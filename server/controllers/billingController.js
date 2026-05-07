const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Create a new transaction
// @route   POST /api/billing/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    const { desc, amount, status, wccAmount } = req.body;

    // Generate a unique transaction ID like TXN-49281948
    const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const transaction = await Transaction.create({
      user: req.user.id,
      transactionId,
      desc,
      amount,
      status: status || 'Paid'
    });

    // Automatically update user WCC credits if this is a top-up or campaign launch
    // Handle cases where user.credits might be null (which breaks $inc)
    const userDoc = await User.findById(req.user.id);
    const currentCredits = userDoc.credits ? Number(userDoc.credits) : 0;

    if (desc && desc.toLowerCase().includes("wcc top-up credit") && wccAmount) {
      await User.findByIdAndUpdate(req.user.id, {
        $set: { credits: currentCredits + Number(wccAmount) }
      });
    } else if (desc && desc.toLowerCase().includes("campaign launch")) {
      // Amount is negative for campaigns
      await User.findByIdAndUpdate(req.user.id, {
        $set: { credits: currentCredits + Number(amount) }
      });
    }

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions for a user
// @route   GET /api/billing/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};
