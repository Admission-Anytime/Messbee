const Product = require('../models/Product');
const whatsappService = require('../services/whatsappService');

const DEFAULT_IMAGE = 'https://via.placeholder.com/150?text=Product';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const serializeProduct = (item) => ({
  _id: item._id,
  id: item._id.toString(),
  key: item._id.toString(),
  name: item.name,
  sku: item.sku,
  category: item.category,
  price: item.price,
  stock: item.stock,
  img: item.img || DEFAULT_IMAGE,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const normalizeFilters = ({ search, category, stockStatus, userId }) => {
  const filters = { userId };

  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    filters.$or = [{ name: regex }, { sku: regex }];
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

const validateProductPayload = async ({ body, userId, itemId = null, partial = false }) => {
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
  addStringField('sku', 'SKU', { required: true });
  addStringField('category', 'Category', { required: true, defaultValue: 'Others' });
  addStringField('img', 'Image');
  addNumberField('price', 'Price', (value) => value > 0);
  addNumberField('stock', 'Stock level', (value) => value >= 0);

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

    const existingItem = await Product.findOne(duplicateQuery);
    if (existingItem) {
      throw new Error('A product with this SKU already exists');
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

exports.getProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const filters = normalizeFilters({ ...req.query, userId });

    const items = await Product.find(filters).sort({ createdAt: -1 });
    res.status(200).json(items.map(serializeProduct));
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const item = await Product.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(serializeProduct(item));
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(400).json({ message: 'Failed to fetch product' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const payload = await validateProductPayload({ body: req.body, userId });
    const verification = await ensureMetaVerification({
      requireCatalogVisible: true,
    });

    const item = await Product.create({
      ...payload,
      userId,
    });

    res.status(201).json({
      ...serializeProduct(item),
      metaVerification: buildMetaVerificationPayload(verification),
    });
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(error.statusCode || 400).json({
      message: error.message || 'Failed to create product',
      metaVerification: error.metaVerification,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const item = await Product.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const payload = await validateProductPayload({
      body: req.body,
      userId: req.user._id,
      itemId: item._id,
      partial: true,
    });
    const verification = await ensureMetaVerification({
      requireCatalogVisible: true,
    });

    Object.assign(item, payload);
    const updatedItem = await item.save();

    res.status(200).json({
      ...serializeProduct(updatedItem),
      metaVerification: buildMetaVerificationPayload(verification),
    });
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(error.statusCode || 400).json({
      message: error.message || 'Failed to update product',
      metaVerification: error.metaVerification,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const item = await Product.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(item._id);

    res.status(200).json({
      message: 'Product deleted successfully',
      id: item._id,
    });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(error.statusCode || 400).json({
      message: error.message || 'Failed to delete product',
    });
  }
};

exports.verifyProductMetaConnection = async (req, res) => {
  const verification = await whatsappService.verifyInventoryMetaSetup();
  return res.status(verification.success ? 200 : 502).json(verification);
};

exports.initializeProductCommerceSettings = async (req, res) => {
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
    console.error('Error initializing product commerce settings:', metaError);

    return res.status(502).json({
      success: false,
      message: 'Failed to initialize Meta commerce settings',
      error: metaError,
    });
  }
};
