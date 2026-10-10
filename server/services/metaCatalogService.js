const axios = require('axios');
const TenantSettings = require('../models/TenantSettings');
const Product = require('../models/Product');
const Channel = require('../models/Channel');

/**
 * Syncs a single product to Meta Commerce Catalog via Graph API Batch request.
 * @param {Object} product - The product mongoose document
 * @param {String} tenantId - The tenant ID
 * @param {String} method - HTTP method ('CREATE', 'UPDATE', 'DELETE')
 */
exports.syncProductToMeta = async (product, tenantId, method = 'CREATE') => {
  try {
    const settings = await TenantSettings.findOne({ tenantId });
    
    // Catalog ID is strictly required
    const catalogId = settings?.metaCommerce?.catalogId;
    if (!catalogId) {
      console.log(`[MetaCatalogSync] Missing catalog ID for tenant ${tenantId}. Skipping sync.`);
      return;
    }

    // Determine the access token to use: 
    // 1. Try to get it from settings (if manually provided)
    // 2. Fallback to the Channel's metaAccessToken (obtained via Embedded Signup)
    let systemUserToken = settings?.metaCommerce?.systemUserToken;
    
    if (!systemUserToken) {
      let channel = await Channel.findOne({ tenantId }).select('+metaAccessToken');
      if (!channel && typeof tenantId === 'string') {
        channel = await Channel.findOne({ tenantId: tenantId }).select('+metaAccessToken');
      }
      if (channel && channel.metaAccessToken) {
        systemUserToken = channel.metaAccessToken;
      }
    }

    if (!systemUserToken) {
      try {
        const User = require('../models/User');
        const userDoc = await User.findById(tenantId).select('+whatsappConfig.accessToken');
        if (userDoc?.whatsappConfig?.accessToken) {
          systemUserToken = userDoc.whatsappConfig.accessToken;
        }
      } catch (_) {}
    }

    if (!systemUserToken) {
      console.log(`[MetaCatalogSync] Missing Meta access token for tenant ${tenantId}. Ensure embedded signup is completed or System User Token is set in Commerce settings. Skipping sync.`);
      return;
    }
    
    // Meta requires retailer_id, name, description, brand, price, currency, url, image_url
    const priceVal = product.sellingPrice !== undefined && product.sellingPrice !== null ? product.sellingPrice : (product.price || 0);
    const productData = {
      retailer_id: product.sku,
      name: product.name,
      description: product.description || product.name,
      brand: product.brand || 'Generic',
      price: Math.round(Number(priceVal) * 100), // Meta expects price in cents/paise
      currency: settings?.billing?.currency || 'INR',
      availability: (product.currentStock || product.stock || 0) > 0 ? 'in stock' : 'out of stock',
      condition: 'new',
      image_url: product.productImage || product.image || 'https://via.placeholder.com/600',
      url: `https://tools.messbee.com/products/${product.sku}`
    };

    let endpoint = `https://graph.facebook.com/v19.0/${catalogId}/batch`;
    
    let requests = [];
    if (method === 'CREATE' || method === 'UPDATE') {
      requests.push({
        method: method,
        data: productData
      });
    } else if (method === 'DELETE') {
      requests.push({
        method: 'DELETE',
        data: { id: product.metaProductId || product.sku }
      });
    }

    const payload = {
      access_token: systemUserToken,
      requests: requests
    };

    const response = await axios.post(endpoint, payload, {
      headers: {
        'Authorization': `Bearer ${systemUserToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Process response
    if (response.data && response.data.handles && response.data.handles.length > 0) {
      // Sync successful
      product.metaSyncStatus = 'synced';
      product.metaSyncError = null;
      // Ideally, the Graph API doesn't return the metaProductId immediately in the batch response (it returns a handle).
      // We will assume success if there's no error.
    } else if (response.data && response.data.validation_status && response.data.validation_status.length > 0) {
       const errors = response.data.validation_status.map(v => v.errors).flat();
       if(errors.length > 0) {
           throw new Error(JSON.stringify(errors));
       } else {
           product.metaSyncStatus = 'synced';
           product.metaSyncError = null;
       }
    } else {
       product.metaSyncStatus = 'synced';
       product.metaSyncError = null;
    }

    await product.save({ validateBeforeSave: false });
    console.log(`[MetaCatalogSync] Successfully synced product ${product.sku} to Meta Catalog.`);

  } catch (error) {
    console.error(`[MetaCatalogSync] Error syncing product ${product.sku} to Meta:`, error.response?.data || error.message);
    
    // Update product status to failed
    product.metaSyncStatus = 'failed';
    product.metaSyncError = error.response?.data?.error?.message || error.message;
    await product.save({ validateBeforeSave: false });
  }
};
