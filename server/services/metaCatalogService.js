const axios = require('axios');
const TenantSettings = require('../models/TenantSettings');
const Product = require('../models/Product');

/**
 * Syncs a single product to Meta Commerce Catalog via Graph API Batch request.
 * @param {Object} product - The product mongoose document
 * @param {String} tenantId - The tenant ID
 * @param {String} method - HTTP method ('CREATE', 'UPDATE', 'DELETE')
 */
exports.syncProductToMeta = async (product, tenantId, method = 'CREATE') => {
  try {
    const settings = await TenantSettings.findOne({ tenantId });
    if (!settings || !settings.metaCommerce || !settings.metaCommerce.catalogId || !settings.metaCommerce.systemUserToken) {
      console.log(`[MetaCatalogSync] Missing catalog credentials for tenant ${tenantId}. Skipping sync.`);
      return;
    }

    const { catalogId, systemUserToken } = settings.metaCommerce;
    
    // Meta requires retailer_id, name, description, brand, price, currency, url, image_url
    const productData = {
      retailer_id: product.sku,
      name: product.name,
      description: product.description || product.name,
      brand: product.brand || 'Generic',
      price: Math.round(product.sellingPrice * 100), // Meta expects price in cents/paise
      currency: settings.billing?.currency || 'INR',
      availability: product.currentStock > 0 ? 'in stock' : 'out of stock',
      condition: 'new',
      image_url: product.productImage || 'https://via.placeholder.com/600',
      url: `https://yourdomain.com/products/${product.sku}` // Dummy URL if none exists
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

    const response = await axios.post(endpoint, payload);
    
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
