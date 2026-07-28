const fs = require('fs');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Category = require('../models/Category');

// Helper to fix common handwriting OCR mistakes in what should be a number
function fixOCRNumber(str) {
  if (!str) return str;
  // Replace common misreadings
  return str
    .replace(/[lIi|]/g, '1')
    .replace(/[oO]/g, '0')
    .replace(/[sS]/g, '5')
    .replace(/[zZ]/g, '2')
    .replace(/[bB]/g, '8')
    .replace(/[gG]/g, '6')
    .replace(/,/g, '.');
}

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

    // Extract potential words and numbers, fixing OCR misreadings for numbers.
    // Instead of strict [\d.]+, we look for tokens that might be numbers (mixed digits and common letter errors)
    const tokens = cleanLine.split(/\s+/);
    const nums = [];
    const wordParts = [];

    for (const token of tokens) {
      // Check if the token looks like a number (contains at least one digit, or is a very common misread)
      if (/[\d]/.test(token) || /^[lIiOoSsZzBbGg.,]+$/.test(token)) {
         const fixedToken = fixOCRNumber(token);
         // Extract just the valid float part
         const match = fixedToken.match(/[\d.]+/);
         if (match) {
            const num = parseFloat(match[0]);
            if (!isNaN(num) && num > 0) {
                nums.push(num);
                continue;
            }
         }
      }
      // If it doesn't parse as a number, treat as a word
      const wordMatch = token.match(/[a-zA-Z]+/);
      if (wordMatch) {
          wordParts.push(wordMatch[0]);
      }
    }

    if (nums.length >= 2 && wordParts.length >= 1) {
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
      const nameParts = wordParts.filter(w => !ignoreWords.includes(w.toLowerCase()) && w.length > 1);
      
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
      .resize({ width: 2500, withoutEnlargement: true }) // Larger upscale for handwritten details
      .grayscale() // Convert to grayscale
      .normalize() // Stretch contrast
      .linear(1.5, -0.2) // Increased contrast boost for lighter pen strokes
      .sharpen({ sigma: 1.5 }) // Added sharpen to make edges crisper
      // Removed median and harsh threshold as they often destroy handwritten curves
      .toFile(preprocessedImagePath);

    // 1. Process Preprocessed Image with Tesseract.js
    const { data: { text } } = await Tesseract.recognize(preprocessedImagePath, 'eng', {
      tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT, // PSM 11: Sparse text. Better for non-uniform handwritten invoices
      tessjs_create_pdf: '0',
      oem: 1, // Explicitly use LSTM OCR Engine
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
