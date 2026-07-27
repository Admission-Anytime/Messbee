const fs = require('fs');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Category = require('../models/Category');

function parseInvoiceText(text) {
  const lines = text.split('\n');
  const items = [];
  let supplierName = null;
  let invoiceNumber = `INV-${Date.now()}`; // fallback
  let date = new Date().toLocaleDateString();

  // Try to find supplier on first few non-empty lines
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i].trim();
    if (line.length > 3 && !line.toLowerCase().includes('invoice') && !line.toLowerCase().includes('date')) {
      supplierName = line;
      break;
    }
  }

  // Robust Heuristic Parsing (instead of strict regex)
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.length < 5) continue;
    
    const lowerLine = cleanLine.toLowerCase();
    if (lowerLine.includes('invoice no') || lowerLine.includes('invoice #')) {
      const parts = cleanLine.split(/[:#]/);
      if (parts.length > 1) invoiceNumber = parts[1].trim();
    }

    if (lowerLine.includes('total') && lowerLine.indexOf('total') < 5) continue; // Skip Total summary line

    // Extract all numbers and words
    const numberMatches = cleanLine.match(/[\d.]+/g);
    const wordMatches = cleanLine.match(/[a-zA-Z]+/g);

    if (numberMatches && numberMatches.length >= 2 && wordMatches && wordMatches.length >= 1) {
      // Filter out invalid numbers like just a dot
      let nums = numberMatches.map(n => parseFloat(n)).filter(n => !isNaN(n));
      
      if (nums.length >= 2) {
        // Assume last number is Total, second to last is Rate/Price
        const total = nums[nums.length - 1];
        const rate = nums[nums.length - 2];
        // If there are at least 3 numbers, the third to last might be Qty, otherwise default to 1
        let qty = 1;
        if (nums.length >= 3) {
            qty = nums[nums.length - 3];
            // Sanity check: if qty is strangely large (like it picked up a weight 100gm instead), set to 1
            if (qty > 1000) qty = 1;
        }
        
        // Remove common header words from the product name
        const ignoreWords = ['sno', 'qty', 'rate', 'amount', 'description', 'total', 'rs'];
        const nameParts = wordMatches.filter(w => !ignoreWords.includes(w.toLowerCase()) && w.length > 1);
        
        if (nameParts.length > 0 && total > 0 && rate > 0) {
            items.push({
                name: nameParts.join(' ').substring(0, 50),
                quantity: Math.round(qty),
                purchasePrice: rate,
                total: total,
                gstPercentage: 18 // Default
            });
        }
      }
    }
  }

  return { supplierName, invoiceNumber, date, items };
}

exports.scanInvoice = async (req, res) => {
  let imagePath = null;
  let preprocessedImagePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an invoice image.' });
    }

    const tenantId = req.user.tenantId || req.user._id;
    imagePath = req.file.path;
    preprocessedImagePath = path.join(path.dirname(imagePath), `preprocessed-${Date.now()}.png`);

    // 0. Extreme Preprocess Image with Sharp for handwriting
    await sharp(imagePath)
      .resize({ width: 2000 }) // Upscale to make thin pen strokes thicker
      .median(3) // Smooth out jagged pen edges
      .grayscale()
      .normalize()
      .linear(1.5, -0.2) // Increase contrast aggressively
      .threshold(130)
      .toFile(preprocessedImagePath);

    // 1. Process Preprocessed Image with Tesseract.js (Tuned for tables/lists)
    const { data: { text } } = await Tesseract.recognize(preprocessedImagePath, 'eng', {
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789. -',
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK, // PSM 6: Assume a single uniform block of text
    });
    console.log("OCR Extracted Text:", text);
    const parsedData = parseInvoiceText(text);

    // Clean up uploaded files
    try {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      if (fs.existsSync(preprocessedImagePath)) fs.unlinkSync(preprocessedImagePath);
    } catch (cleanupErr) {
      console.log('Error cleaning up files', cleanupErr);
    }

    // 2. Match or Find Supplier
    let matchedSupplier = null;
    if (parsedData.supplierName) {
      const supplierWord = parsedData.supplierName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
      if (supplierWord.length > 2) {
        const supplierRegex = new RegExp(supplierWord, 'i');
        matchedSupplier = await Supplier.findOne({
          tenantId,
          companyName: { $regex: supplierRegex }
        });
      }
    }

    // 3. Process Products (Match or Create)
    const processedItems = [];
    
    let defaultCategory = await Category.findOne({ tenantId });
    if (!defaultCategory) {
      defaultCategory = await Category.create({ tenantId, name: 'General', description: 'Auto-created category for OCR' });
    }

    for (const item of parsedData.items) {
      if (!item.name) continue;

      let product = await Product.findOne({
        tenantId,
        name: { $regex: new RegExp(`^${item.name}$`, 'i') }
      });

      if (!product) {
        // Auto-create new product
        product = await Product.create({
          tenantId,
          user: req.user._id,
          name: item.name,
          sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: defaultCategory._id,
          purchasePrice: item.purchasePrice || 0,
          sellingPrice: (item.purchasePrice || 0) * 1.2,
          gstPercentage: item.gstPercentage || 18,
          currentStock: 0,
          status: 'active'
        });
      }

      processedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity || 1,
        purchasePrice: item.purchasePrice || product.purchasePrice,
        discount: 0,
        gst: item.gstPercentage || product.gstPercentage,
        total: item.total || ((item.purchasePrice || 0) * (item.quantity || 1)) * (1 + (item.gstPercentage || 18) / 100)
      });
    }

    res.status(200).json({
      success: true,
      data: {
        supplierId: matchedSupplier ? matchedSupplier._id : null,
        supplierName: parsedData.supplierName,
        invoiceNumber: parsedData.invoiceNumber,
        date: parsedData.date,
        items: processedItems,
        rawText: text // Returning raw text just in case frontend wants to show it for debugging
      }
    });

  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process invoice image', error: error.message });
  }
};
