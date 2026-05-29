const Label = require('../models/Label');
const { PLAN_LIMITS } = require('../utils/planLimits');

// 1. Get all labels
exports.getLabels = async (req, res) => {
    try {
        const user = req.user?._id;
        // Find labels belonging to this user OR system labels
        const labels = await Label.find({
            $or: [
                { user: user },
                { isSystem: true }
            ]
        }).sort({ createdAt: -1 });
        res.status(200).json(labels || []);
    } catch (err) {
        console.error('❌ Error fetching labels:', err.message);
        res.status(500).json({ message: 'Failed to fetch labels' });
    }
};

// 2. Create new label
exports.createLabel = async (req, res) => {
    try {
        const { name, desc, color, bg, text, isSystem, user } = req.body;
        
        // Validation
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Label name is required' });
        }

        if (name.length > 25) {
            return res.status(400).json({ message: 'Label name cannot exceed 25 characters' });
        }

        // Check plan limit dynamically
        const userPlan = (req.user?.subscriptionPlan || 'free').toLowerCase();
        const limit = PLAN_LIMITS[userPlan]?.labels || PLAN_LIMITS.free.labels;

        const labelCount = await Label.countDocuments({ user: req.user?._id });
        if (labelCount >= limit) {
            return res.status(403).json({ 
                message: `Label limit reached. You can only create up to ${limit} labels. Please upgrade your plan.`,
                limitReached: true 
            });
        }

        // Set creator from authenticated user
        const creator = req.user ? req.user.name : 'System';

        const newLabel = new Label({
            name,
            desc: desc || '',
            color: color || '#EF4444',
            bg: bg || 'bg-emerald-50',
            text: text || 'text-emerald-800',
            creator,
            isSystem: isSystem || false,
            user: req.user?._id
        });
        
        const savedLabel = await newLabel.save();
        
        console.log(`✅ Created label: ${savedLabel.name}`);
        res.status(201).json(savedLabel);
    } catch (err) {
        console.error('❌ Error creating label:', err.message);
        res.status(400).json({ message: err.message || 'Failed to create label' });
    }
};

// 3. Update label
exports.updateLabel = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, desc, color, bg, text } = req.body;

        // Validation
        if (name && name.length > 25) {
            return res.status(400).json({ message: 'Label name cannot exceed 25 characters' });
        }

        const user = req.user?._id;
        const label = await Label.findOne({ _id: id, user });
        if (!label) {
            return res.status(404).json({ message: 'Label not found or access denied' });
        }

        // Update fields
        if (name !== undefined) label.name = name;
        if (desc !== undefined) label.desc = desc;
        if (color !== undefined) label.color = color;
        if (bg !== undefined) label.bg = bg;
        if (text !== undefined) label.text = text;

        const updatedLabel = await label.save();
        
        console.log(`✅ Updated label: ${updatedLabel.name}`);
        res.status(200).json(updatedLabel);
    } catch (err) {
        console.error('❌ Error updating label:', err.message);
        res.status(400).json({ message: err.message || 'Failed to update label' });
    }
};

// 4. Delete label
exports.deleteLabel = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = req.user?._id;
        const label = await Label.findOne({ _id: id, user });
        if (!label) {
            return res.status(404).json({ message: 'Label not found or access denied' });
        }

        await Label.findByIdAndDelete(id);
        
        console.log(`✅ Deleted label: ${label.name}`);
        res.status(200).json({ message: 'Label deleted successfully', deletedId: id });
    } catch (err) {
        console.error('❌ Error deleting label:', err.message);
        res.status(500).json({ message: 'Failed to delete label' });
    }
};

// 5. Initialize system labels
exports.initializeSystemLabels = async (req, res) => {
    try {
        const systemLabels = [
            { name: 'Hot lead', desc: 'Most eligible customer to target', color: '#E76F51', bg: 'bg-orange-100', text: 'text-orange-800', creator: 'WhatsTool', isSystem: true },
            { name: 'Cold lead', desc: 'Not very interest customer', color: '#219EBC', bg: 'bg-cyan-100', text: 'text-cyan-800', creator: 'WhatsTool', isSystem: true },
            { name: 'Warm lead', desc: 'Very interested customer', color: '#E85D04', bg: 'bg-yellow-100', text: 'text-yellow-800', creator: 'WhatsTool', isSystem: true },
            { name: 'Issue raised', desc: 'Issue has been raised by team', color: '#D00000', bg: 'bg-red-100', text: 'text-red-800', creator: 'WhatsTool', isSystem: true },
            { name: 'Resolved', desc: 'Issue resolved', color: '#6A994E', bg: 'bg-green-100', text: 'text-green-800', creator: 'WhatsTool', isSystem: true },
            { name: 'Payment pending', desc: 'Payment is not yet received', color: '#4361EE', bg: 'bg-blue-100', text: 'text-blue-800', creator: 'WhatsTool', isSystem: true },
            { name: 'Payment received', desc: 'Payment has done by the customer', color: '#4361EE', bg: 'bg-blue-100', text: 'text-blue-800', creator: 'WhatsTool', isSystem: true },
            { name: 'Invoice sent', desc: 'We have send the invoice', color: '#333D29', bg: 'bg-gray-200', text: 'text-gray-800', creator: 'WhatsTool', isSystem: true },
        ];

        // Check if system labels already exist
        const existingLabels = await Label.find({ isSystem: true });
        if (existingLabels.length > 0) {
            return res.status(200).json({ message: 'System labels already initialized', count: existingLabels.length });
        }

        const created = await Label.insertMany(systemLabels);
        console.log(`✅ Initialized ${created.length} system labels`);
        res.status(201).json({ message: 'System labels initialized successfully', count: created.length });
    } catch (err) {
        console.error('❌ Error initializing system labels:', err.message);
        res.status(500).json({ message: 'Failed to initialize system labels' });
    }
};
