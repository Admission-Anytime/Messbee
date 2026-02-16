
const router = require("express").Router();
const { protect } = require("../middleware/auth");


const { createCustomField } = require("../controllers/customField/createCustomFieldControllers");
const { updateCustomField } = require("../controllers/customField/updateCustomFieldsControllers");
const { deleteCustomField } = require("../controllers/customField/deleteCustomFieldsControllers");
const { listCustomFields } = require("../controllers/customField/listCustomFieldcontroller");


router.get("/list", protect, listCustomFields);


router.post("/create", protect, createCustomField);


router.put("/update/:id", protect, updateCustomField);

router.delete("/delete/:id", protect, deleteCustomField);


module.exports = router;

