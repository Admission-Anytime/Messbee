const CustomField = require('../models/CustomField');

exports.createField = async (req, res) => {
    try {
        const { name, description, type, key, isActive } = req.body;
        const newField = new CustomField({
            name,
            description,
            type,
            key,
            isActive,
            userId: req.user ? req.user.id : null // Auth check
        });
        await newField.save();
        res.status(201).json(newField);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFields = async (req, res) => {
    try {
        // If authentication exists, use { userId: req.user.id }

        const fields = await CustomField.find().sort({ createdAt: -1 });
        res.json(fields);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle Active status 
exports.updateField = async (req, res) => {
    try {
        const updatedField = await CustomField.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedField);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteField = async (req, res) => {
    try {
        await CustomField.findByIdAndDelete(req.params.id);
        res.json({ message: "Field deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};