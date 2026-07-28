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

    // Aggregate Sales and calculate COGS & Daily Trends for this month
    const salesStats = await Sales.aggregate([
      { $match: { tenantId: tenantObjId, salesDate: { $gte: thisMonth } } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          salesDate: { $first: "$salesDate" },
          grandTotal: { $first: "$grandTotal" },
          totalCOGS: { 
            $sum: { $multiply: ["$products.quantity", { $ifNull: ["$productInfo.purchasePrice", 0] }] } 
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$salesDate" } },
          dailyRevenue: { $sum: "$grandTotal" },
          dailyCOGS: { $sum: "$totalCOGS" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    let totalMonthlySales = 0;
    let totalMonthlyCOGS = 0;
    let dailyTrends = [];

    salesStats.forEach(dayStat => {
      totalMonthlySales += dayStat.dailyRevenue;
      totalMonthlyCOGS += dayStat.dailyCOGS;
      dailyTrends.push({
        date: dayStat._id,
        sales: dayStat.dailyRevenue,
        profit: dayStat.dailyRevenue - dayStat.dailyCOGS
      });
    });

    const netProfit = totalMonthlySales - totalMonthlyCOGS;

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
        monthlySales: totalMonthlySales,
        monthlyPurchases: purchaseStats.length > 0 ? purchaseStats[0].totalPurchase : 0,
        netProfit: netProfit,
        dailyTrends: dailyTrends,
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
