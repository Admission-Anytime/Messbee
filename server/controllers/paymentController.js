const Payment = require('../models/Payment');
const Product = require('../models/Product');

// @desc    Get all payments (Now showing Products as requested)
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res, next) => {
  try {
    const { status, fromDate, toDate } = req.query;

    const query = { userId: req.user._id };

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        query.createdAt.$lte = to;
      }
    }

    // Fetch Products to display their price in the payment list
    const products = await Product.find(query).sort({ createdAt: -1 });

    let payments = products.map(product => {
      let mappedStatus = 'Paid';
      if (product.stock === 0) mappedStatus = 'Failed';
      else if (product.stock < 10) mappedStatus = 'Pending';
      
      return {
        _id: product._id,
        customer: { name: product.name, phone: product.sku },
        transaction_id: product._id,
        amount: product.price,
        currency: 'INR',
        status: mappedStatus,
        createdAt: product.createdAt
      };
    });

    // Simple status filter logic after mapping
    if (status && status !== 'All Status') {
      payments = payments.filter(p => p.status === status);
    }

    // Return the response format expected by PaymentApi
    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json(payment);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a payment
// @route   POST /api/payments
// @access  Private
exports.createPayment = async (req, res, next) => {
  try {
    const paymentData = {
      ...req.body,
      userId: req.user._id
    };
    
    const newPayment = await Payment.create(paymentData);
    res.status(201).json(newPayment);
  } catch (error) {
    next(error);
  }
};
