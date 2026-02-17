const Label = require('../models/labelModel');

exports.getLabels = async (req, res) => {
    try {
        const labels = await Label.find();
        res.status(200).json(labels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createLabel = async (req, res) => {
    try {
        const newLabel = new Label(req.body);
        await newLabel.save();
        res.status(201).json(newLabel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateLabel = async (req, res) => {
    try {
        const updatedLabel = await Label.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedLabel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteLabel = async (req, res) => {
    try {
        await Label.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Label deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};