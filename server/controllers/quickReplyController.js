const QuickReply = require('../models/QuickReply');

// 1. Get all quick replies
exports.getQuickReplies = async (req, res) => {
    try {
        const replies = await QuickReply.find().sort({ createdAt: -1 });
        console.log(`✅ Fetched ${replies.length} quick replies`);
        res.status(200).json(replies || []);
    } catch (err) {
        console.error('❌ Error fetching quick replies:', err.message);
        res.status(500).json({ message: 'Failed to fetch quick replies' });
    }
};

// 2. Create new quick reply
exports.createQuickReply = async (req, res) => {
    try {
        const { shortcut, content, type } = req.body;
        
        // Validation
        if (!shortcut || shortcut.trim() === '') {
            return res.status(400).json({ message: 'Shortcut is required' });
        }

        // Check for duplicate shortcut
        const existingReply = await QuickReply.findOne({ shortcut });
        if (existingReply) {
            return res.status(400).json({ message: `Shortcut "${shortcut}" already exists` });
        }

        const data = { ...req.body };
        if (req.file) {
            data.mediaUrl = `/uploads/${req.file.filename}`;
            console.log(`📎 File uploaded: ${req.file.filename}`);
        }
        
        const newReply = new QuickReply(data);
        const savedReply = await newReply.save();
        
        console.log(`✅ Created quick reply: ${savedReply.shortcut}`);
        res.status(201).json(savedReply);
    } catch (err) {
        console.error('❌ Error creating quick reply:', err.message);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'This shortcut already exists' });
        }
        res.status(400).json({ message: err.message || 'Failed to create quick reply' });
    }
};

// 3. Update quick reply
exports.updateQuickReply = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if reply exists
        const existingReply = await QuickReply.findById(id);
        if (!existingReply) {
            return res.status(404).json({ message: 'Quick reply not found' });
        }

        const data = { ...req.body };
        if (req.file) {
            data.mediaUrl = `/uploads/${req.file.filename}`;
            console.log(`📎 File updated: ${req.file.filename}`);
        }
        
        const updatedReply = await QuickReply.findByIdAndUpdate(
            id, 
            data, 
            { new: true, runValidators: true }
        );
        
        console.log(`✅ Updated quick reply: ${updatedReply.shortcut}`);
        res.status(200).json(updatedReply);
    } catch (err) {
        console.error('❌ Error updating quick reply:', err.message);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'This shortcut already exists' });
        }
        res.status(400).json({ message: err.message || 'Failed to update quick reply' });
    }
};

// 4. Delete quick reply
exports.deleteQuickReply = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedReply = await QuickReply.findByIdAndDelete(id);
        
        if (!deletedReply) {
            return res.status(404).json({ message: 'Quick reply not found' });
        }
        
        console.log(`✅ Deleted quick reply: ${deletedReply.shortcut}`);
        res.status(200).json({ 
            message: 'Quick reply deleted successfully',
            deletedReply 
        });
    } catch (err) {
        console.error('❌ Error deleting quick reply:', err.message);
        res.status(500).json({ message: err.message || 'Failed to delete quick reply' });
    }
};