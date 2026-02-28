const Status = require('../models/Status');

// 1. Get all statuses for a user
exports.getStatuses = async (req, res) => {
    try {
        const userId = req.user._id;
        const statuses = await Status.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(statuses || []);
    } catch (err) {
        console.error('❌ Error fetching statuses:', err.message);
        res.status(500).json({ message: 'Failed to fetch statuses' });
    }
};

// 2. Create new status
exports.createStatus = async (req, res) => {
    try {
        const { name, description, color, isActive } = req.body;
        const userId = req.user._id;
        
        // Validation
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Status name is required' });
        }

        if (name.length > 50) {
            return res.status(400).json({ message: 'Status name cannot exceed 50 characters' });
        }

        // Check plan limit (5 statuses per user)
        const statusCount = await Status.countDocuments({ userId });
        if (statusCount >= 5) {
            return res.status(403).json({ 
                message: 'Status limit reached. You can only create up to 5 statuses. Please upgrade your plan.',
                limitReached: true 
            });
        }

        // Set creator from authenticated user
        const createdBy = req.user.name || req.user.email || 'User';
        const avatar = req.user.avatar || req.user.profilePicture || `https://i.pravatar.cc/150?u=${req.user.email}`;

        const newStatus = new Status({
            name,
            description: description || '',
            color: color || '#3B82F6',
            isActive: isActive !== undefined ? isActive : true,
            createdBy,
            avatar,
            userId
        });
        
        const savedStatus = await newStatus.save();
        
        console.log(`✅ Created status: ${savedStatus.name} for user ${userId}`);
        res.status(201).json(savedStatus);
    } catch (err) {
        console.error('❌ Error creating status:', err.message);
        res.status(400).json({ message: err.message || 'Failed to create status' });
    }
};

// 3. Update status
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, isActive } = req.body;
        const userId = req.user._id;

        // Validation
        if (name && name.length > 50) {
            return res.status(400).json({ message: 'Status name cannot exceed 50 characters' });
        }

        const status = await Status.findOne({ _id: id, userId });
        if (!status) {
            return res.status(404).json({ message: 'Status not found or you do not have permission to update it' });
        }

        // Update fields
        if (name !== undefined) status.name = name;
        if (description !== undefined) status.description = description;
        if (color !== undefined) status.color = color;
        if (isActive !== undefined) status.isActive = isActive;

        const updatedStatus = await status.save();
        
        console.log(`✅ Updated status: ${updatedStatus.name} for user ${userId}`);
        res.status(200).json(updatedStatus);
    } catch (err) {
        console.error('❌ Error updating status:', err.message);
        res.status(400).json({ message: err.message || 'Failed to update status' });
    }
};

// 4. Delete status
exports.deleteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const status = await Status.findOne({ _id: id, userId });
        if (!status) {
            return res.status(404).json({ message: 'Status not found or you do not have permission to delete it' });
        }

        await Status.findByIdAndDelete(id);
        
        console.log(`✅ Deleted status: ${status.name} for user ${userId}`);
        res.status(200).json({ message: 'Status deleted successfully', id });
    } catch (err) {
        console.error('❌ Error deleting status:', err.message);
        res.status(400).json({ message: err.message || 'Failed to delete status' });
    }
};

// 5. Get single status by ID
exports.getStatusById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const status = await Status.findOne({ _id: id, userId });
        if (!status) {
            return res.status(404).json({ message: 'Status not found' });
        }

        res.status(200).json(status);
    } catch (err) {
        console.error('❌ Error fetching status:', err.message);
        res.status(400).json({ message: err.message || 'Failed to fetch status' });
    }
};
