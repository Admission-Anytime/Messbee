const InventoryItem = require('../models/InventoryItem');
const whatsappService = require('../services/whatsappService');

const DEFAULT_IMAGE = 'https://via.placeholder.com/150?text=Product';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

const getStockStatus = (stock) => {
  if (stock === 0) {
    return 'OUT OF STOCK';
  }

  if (stock < 10) {
    return 'Low Stock';
  }

  return 'In stock';
};

const serializeInventoryItem = (item) => ({
  _id: item._id,
  id: item._id.toString(),
  key: item._id.toString(),
  product: {
    name: item.name,
    desc: item.desc,
    img: item.img || DEFAULT_IMAGE,
  },
  sku: item.sku,
  stock: item.stock,
  goal: item.goal,
  price: formatCurrency(item.price),
  priceValue: item.price,
  category: item.category,
  status: getStockStatus(item.stock),
  shop: item.shop,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeFilters = ({ search, category, stockStatus, userId }) => {
  const filters = { userId };

  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    filters.$or = [{ name: regex }, { sku: regex }, { desc: regex }];
  }

  if (category && category !== 'all') {
    filters.category = category;
  }

  if (stockStatus) {
    const normalizedStatus = stockStatus.toLowerCase();

    if (normalizedStatus === 'in' || normalizedStatus === 'in_stock') {
      filters.stock = { $gte: 10 };
    } else if (normalizedStatus === 'low' || normalizedStatus === 'low_stock') {
      filters.stock = { $gt: 0, $lt: 10 };
    } else if (normalizedStatus === 'out' || normalizedStatus === 'out_of_stock') {
      filters.stock = 0;
    }
  }

  return filters;
};

const validateInventoryPayload = async ({ body, userId, itemId = null, partial = false }) => {
  const updates = {};

  const addStringField = (key, label, options = {}) => {
    if (body[key] === undefined) {
      if (!partial && options.required) {
        throw new Error(`${label} is required`);
      }
      return;
    }

    const value = String(body[key]).trim();
    if (!value && options.required) {
      throw new Error(`${label} is required`);
    }

    if (value || !options.required) {
      updates[key] = value || options.defaultValue || '';
    }
  };

  const addNumberField = (key, label, validator) => {
    if (body[key] === undefined) {
      if (!partial) {
        throw new Error(`${label} is required`);
      }
      return;
    }

    const value = Number(body[key]);
    if (!Number.isFinite(value) || !validator(value)) {
      throw new Error(`Valid ${label.toLowerCase()} is required`);
    }

    updates[key] = value;
  };

  addStringField('name', 'Product name', { required: true });
  addStringField('desc', 'Description');
  addStringField('img', 'Image');
  addStringField('sku', 'SKU', { required: true });
  addStringField('category', 'Category', { required: !partial, defaultValue: 'Others' });
  addNumberField('stock', 'Stock level', (value) => value >= 0);
  addNumberField('goal', 'Goal', (value) => value > 0);
  addNumberField('price', 'Price', (value) => value > 0);

  if (body.shop !== undefined) {
    updates.shop = Boolean(body.shop);
  } else if (!partial) {
    updates.shop = false;
  }

  if (updates.img !== undefined && !updates.img) {
    updates.img = DEFAULT_IMAGE;
  }

  if (updates.category !== undefined && !updates.category) {
    updates.category = 'Others';
  }

  if (updates.sku) {
    updates.sku = updates.sku.toUpperCase();

    const duplicateQuery = {
      userId,
      sku: updates.sku,
    };

    if (itemId) {
      duplicateQuery._id = { $ne: itemId };
    }

    const existingItem = await InventoryItem.findOne(duplicateQuery);
    if (existingItem) {
      throw new Error('An inventory item with this SKU already exists');
    }
  }

  return updates;
};

const buildMetaVerificationPayload = (verification) => ({
  verified: true,
  verifiedAt: new Date().toISOString(),
  phoneNumberId: verification?.checks?.config?.phoneNumberId || null,
  wabaId: verification?.checks?.config?.wabaId || null,
  phoneNumber: verification?.checks?.phoneNumbers?.matchedPhoneNumber || null,
  commerceSettings: verification?.checks?.commerceSettings
    ? {
        id: verification.checks.commerceSettings.id || null,
        isCartEnabled: Boolean(verification.checks.commerceSettings.isCartEnabled),
        isCatalogVisible: Boolean(verification.checks.commerceSettings.isCatalogVisible),
      }
    : null,
});

const ensureMetaVerification = async (options = {}) => {
  const verification = await whatsappService.verifyInventoryMetaSetup(options);

  if (!verification.success) {
    const error = new Error(verification.message || 'Meta verification failed');
    error.statusCode = 502;
    error.metaVerification = verification;
    throw error;
  }

  return verification;
};

exports.getInventoryItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const filters = normalizeFilters({ ...req.query, userId });

    const items = await InventoryItem.find(filters).sort({ createdAt: -1 });
    res.status(200).json(items.map(serializeInventoryItem));
  } catch (error) {
    console.error('Error fetching inventory items:', error.message);
    res.status(500).json({ message: 'Failed to fetch inventory items' });
  }
};

exports.getInventorySummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const [summary] = await InventoryItem.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ['$stock', 0] }, 1, 0],
            },
          },
          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [{ $gt: ['$stock', 0] }, { $lt: ['$stock', 10] }],
                },
                1,
                0,
              ],
            },
          },
          inventoryValue: {
            $sum: { $multiply: ['$price', '$stock'] },
          },
        },
      },
    ]);

    const normalizedSummary = {
      totalProducts: summary?.totalProducts || 0,
      outOfStock: summary?.outOfStock || 0,
      lowStock: summary?.lowStock || 0,
      inventoryValue: summary?.inventoryValue || 0,
      inventoryValueFormatted: formatCurrency(summary?.inventoryValue || 0),
    };

    res.status(200).json(normalizedSummary);
  } catch (error) {
    console.error('Error fetching inventory summary:', error.message);
    res.status(500).json({ message: 'Failed to fetch inventory summary' });
  }
};

exports.verifyInventoryMetaConnection = async (req, res) => {
  const verification = await whatsappService.verifyInventoryMetaSetup();

  return res.status(verification.success ? 200 : 502).json(verification);
};

exports.initializeInventoryCommerceSettings = async (req, res) => {
  try {
    const update = await whatsappService.updateCommerceSettings({
      isCartEnabled: req.body?.isCartEnabled ?? true,
      isCatalogVisible: req.body?.isCatalogVisible ?? true,
    });

    const verification = await whatsappService.verifyInventoryMetaSetup({
      requireCatalogVisible: Boolean(req.body?.isCatalogVisible ?? true),
    });

    if (!verification.success) {
      return res.status(502).json({
        success: false,
        message: verification.message || 'Meta commerce settings were updated but verification still failed',
        update,
        metaVerification: verification,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Meta commerce settings initialized successfully',
      update,
      metaVerification: buildMetaVerificationPayload(verification),
    });
  } catch (error) {
    const metaError = error.response?.data || error.message;
    console.error('Error initializing commerce settings:', metaError);

    return res.status(502).json({
      success: false,
      message: 'Failed to initialize Meta commerce settings',
      error: metaError,
    });
  }
};

exports.getInventoryItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.status(200).json(serializeInventoryItem(item));
  } catch (error) {
    console.error('Error fetching inventory item:', error.message);
    res.status(400).json({ message: 'Failed to fetch inventory item' });
  }
};

exports.createInventoryItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const payload = await validateInventoryPayload({ body: req.body, userId });
    const verification = payload.shop
      ? await ensureMetaVerification({
          requireCatalogVisible: true,
        })
      : null;

    const item = await InventoryItem.create({
      ...payload,
      userId,
    });

    res.status(201).json({
      ...serializeInventoryItem(item),
      metaVerification: verification ? buildMetaVerificationPayload(verification) : null,
    });
  } catch (error) {
    console.error('Error creating inventory item:', error.message);
    res.status(error.statusCode || 400).json({
      message: error.message || 'Failed to create inventory item',
      metaVerification: error.metaVerification,
    });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const payload = await validateInventoryPayload({
      body: req.body,
      userId: req.user._id,
      itemId: item._id,
      partial: true,
    });
    const verification = payload.shop === true
      ? await ensureMetaVerification({
          requireCatalogVisible: true,
        })
      : null;

    Object.assign(item, payload);
    const updatedItem = await item.save();

    res.status(200).json({
      ...serializeInventoryItem(updatedItem),
      metaVerification: verification ? buildMetaVerificationPayload(verification) : null,
    });
  } catch (error) {
    console.error('Error updating inventory item:', error.message);
    res.status(error.statusCode || 400).json({
      message: error.message || 'Failed to update inventory item',
      metaVerification: error.metaVerification,
    });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    await InventoryItem.findByIdAndDelete(item._id);

    res.status(200).json({
      message: 'Inventory item deleted successfully',
      id: item._id,
      metaVerification: null,
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error.message);
    res.status(error.statusCode || 400).json({
      message: error.message || 'Failed to delete inventory item',
      metaVerification: error.metaVerification,
    });
  }
};
