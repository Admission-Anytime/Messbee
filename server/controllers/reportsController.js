const Sales = require('../models/Sales');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');

exports.getDashboardStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const tenantObjId = new mongoose.Types.ObjectId(tenantId);

    // Get date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Aggregate Sales for this month
    const salesStats = await Sales.aggregate([
      { $match: { tenantId: tenantObjId, salesDate: { $gte: thisMonth } } },
      { $group: { _id: null, totalSales: { $sum: "$grandTotal" }, count: { $sum: 1 } } }
    ]);

    // Aggregate Purchases for this month
    const purchaseStats = await Purchase.aggregate([
      { $match: { tenantId: tenantObjId, purchaseDate: { $gte: thisMonth } } },
      { $group: { _id: null, totalPurchase: { $sum: "$grandTotal" }, count: { $sum: 1 } } }
    ]);

    // Inventory Alerts
    const lowStockCount = await Product.countDocuments({ 
      tenantId: tenantObjId, 
      $expr: { $lte: ['$currentStock', '$minimumStock'] } 
    });

    const outOfStockCount = await Product.countDocuments({ 
      tenantId: tenantObjId, 
      currentStock: { $lte: 0 } 
    });

    // Counts
    const productsCount = await Product.countDocuments({ tenantId: tenantObjId });
    const customersCount = await Customer.countDocuments({ tenantId: tenantObjId });
    const suppliersCount = await Supplier.countDocuments({ tenantId: tenantObjId });

    res.status(200).json({
      success: true,
      data: {
        monthlySales: salesStats.length > 0 ? salesStats[0].totalSales : 0,
        monthlyPurchases: purchaseStats.length > 0 ? purchaseStats[0].totalPurchase : 0,
        lowStockAlerts: lowStockCount,
        outOfStockAlerts: outOfStockCount,
        totalProducts: productsCount,
        totalCustomers: customersCount,
        totalSuppliers: suppliersCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const { startDate, endDate } = req.query;

    let matchStage = { tenantId: new mongoose.Types.ObjectId(tenantId) };
    
    if (startDate && endDate) {
      matchStage.salesDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const report = await Sales.aggregate([
      { $match: matchStage },
      { $unwind: "$products" },
      { 
        $group: { 
          _id: "$products.product", 
          totalQuantitySold: { $sum: "$products.quantity" },
          totalRevenue: { $sum: "$products.total" },
          totalGST: { $sum: "$products.gst" }
        } 
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPurchaseReport = async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user._id;
    const { startDate, endDate } = req.query;

    let matchStage = { tenantId: new mongoose.Types.ObjectId(tenantId) };
    
    if (startDate && endDate) {
      matchStage.purchaseDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const report = await Purchase.aggregate([
      { $match: matchStage },
      { $unwind: "$products" },
      { 
        $group: { 
          _id: "$products.product", 
          totalQuantityPurchased: { $sum: "$products.quantity" },
          totalSpent: { $sum: "$products.total" }
        } 
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      { $sort: { totalSpent: -1 } }
    ]);

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
