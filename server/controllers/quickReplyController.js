const QuickReply = require('../models/QuickReply');

// 1. Saare replies fetch karna
exports.getQuickReplies = async (req, res) => {
    try {
        const replies = await QuickReply.find().sort({ createdAt: -1 });
        res.status(200).json(replies || []);
    } catch (err) {
        res.status(500).json([]);
    }
};

// 2. Naya reply create karna
exports.createQuickReply = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.mediaUrl = `/uploads/${req.file.filename}`;
        }
        const newReply = new QuickReply(data);
        const savedReply = await newReply.save();
        res.status(201).json(savedReply);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 3. Update karna
exports.updateQuickReply = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.mediaUrl = `/uploads/${req.file.filename}`;
        }
        const updatedReply = await QuickReply.findByIdAndUpdate(
            req.params.id, 
            data, 
            { new: true }
        );
        res.status(200).json(updatedReply);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 4. Delete karna
exports.deleteQuickReply = async (req, res) => {
    try {
        await QuickReply.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};