const asyncHandler = require("express-async-handler");
const Status = require("../models/Status");

// @desc    Get all statuses
// @route   GET /api/status
// @access  Private
const getStatuses = asyncHandler(async (req, res) => {
  // ✅ Safety Check: Ensure user is authenticated
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, user not found");
  }

  const statuses = await Status.find({ user: req.user.id });
  res.status(200).json(statuses);
});

// @desc    Create new status
// @route   POST /api/status
// @access  Private
const createStatus = asyncHandler(async (req, res) => {
  // ✅ Safety Check
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, user not found");
  }

  const { name, description, color, createdBy } = req.body;

  // ✅ Improved Validation (Trim whitespace)
  if (!name?.trim() || !description?.trim() || !color?.trim()) {
    res.status(400);
    throw new Error("Please fill in all fields (Name, Description, Color)");
  }

  // --- 🔒 ENFORCE LIMIT: CHECK COUNT ---
  const count = await Status.countDocuments({ user: req.user.id });
  if (count >= 5) {
    res.status(400);
    throw new Error("Plan Limit Reached: You cannot create more than 5 statuses.");
  }

  const status = await Status.create({
    user: req.user.id,
    name: name.trim(),
    description: description.trim(),
    color: color.trim(),
    createdBy: createdBy || req.user.name || "User", // Fallback to user name
  });

  res.status(201).json(status);
});

// @desc    Update status
// @route   PUT /api/status/:id
// @access  Private
const updateStatus = asyncHandler(async (req, res) => {
  // ✅ Safety Check
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, user not found");
  }

  const status = await Status.findById(req.params.id);

  if (!status) {
    res.status(404);
    throw new Error("Status not found");
  }

  // ✅ Authorization Check: User must own the status
  if (status.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized to update this status");
  }

  const updatedStatus = await Status.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true } // runValidators ensures data integrity
  );

  res.status(200).json(updatedStatus);
});

// @desc    Delete status
// @route   DELETE /api/status/:id
// @access  Private
const deleteStatus = asyncHandler(async (req, res) => {
  // ✅ Safety Check
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, user not found");
  }

  const status = await Status.findById(req.params.id);

  if (!status) {
    res.status(404);
    throw new Error("Status not found");
  }

  // ✅ Authorization Check
  if (status.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized to delete this status");
  }

  await status.deleteOne();

  res.status(200).json({ id: req.params.id, message: "Status removed" });
});

module.exports = {
  getStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
};