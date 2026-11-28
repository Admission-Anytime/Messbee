import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { commerceService, chatService, resolveFileUrl } from '../../services/api';
import QuickBottomBar from '../../components/QuickBottomBar';

const DEFAULT_CATEGORIES = ['General', 'Electronics', 'Accessories', 'Clothing', 'Home & Living', 'Services'];

export default function AddProductScreen({ route, navigation }) {
  const editingProduct = route.params?.product || null;

  const [name, setName] = useState(editingProduct?.name || '');
  const [description, setDescription] = useState(editingProduct?.description || '');
  const [sku, setSku] = useState(editingProduct?.sku || `PRD-${Date.now().toString().slice(-5)}`);
  const [category, setCategory] = useState(
    typeof editingProduct?.category === 'object'
      ? editingProduct.category?.name || 'General'
      : editingProduct?.category || 'General'
  );
  const [brand, setBrand] = useState(editingProduct?.brand || '');
  const [sellingPrice, setSellingPrice] = useState(
    editingProduct?.sellingPrice !== undefined ? String(editingProduct.sellingPrice) : ''
  );
  const [purchasePrice, setPurchasePrice] = useState(
    editingProduct?.purchasePrice !== undefined ? String(editingProduct.purchasePrice) : ''
  );
  const [gstPercentage, setGstPercentage] = useState(
    editingProduct?.gstPercentage !== undefined ? String(editingProduct.gstPercentage) : '18'
  );
  const [currentStock, setCurrentStock] = useState(
    editingProduct?.currentStock !== undefined ? String(editingProduct.currentStock) : '10'
  );
  const [minimumStock, setMinimumStock] = useState(
    editingProduct?.minimumStock !== undefined ? String(editingProduct.minimumStock) : '10'
  );
  const [productImage, setProductImage] = useState(editingProduct?.productImage || '');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    commerceService
      .getCategories()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          const names = list.map((c) => (typeof c === 'string' ? c : c.name)).filter(Boolean);
          if (names.length > 0) setCategories(Array.from(new Set([...names, ...DEFAULT_CATEGORIES])));
        }
      })
      .catch(() => {});
  }, []);

  const handlePickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Gallery permission is required to upload product image.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        setUploadingImg(true);
        try {
          const uploadRes = await chatService.uploadFile(asset);
          if (uploadRes?.fileUrl) {
            setProductImage(uploadRes.fileUrl);
          } else {
            setProductImage(asset.uri);
          }
        } catch {
          setProductImage(asset.uri);
        } finally {
          setUploadingImg(false);
        }
      }
    } catch (err) {
      Alert.alert('Image Error', err.message || 'Could not pick image.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a product name.');
      return;
    }
    if (!sku.trim()) {
      Alert.alert('Validation Error', 'Please enter a product SKU.');
      return;
    }
    if (!sellingPrice.trim() || isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
      Alert.alert('Validation Error', 'Please enter a valid selling price.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      sku: sku.trim(),
      category: category.trim() || 'General',
      brand: brand.trim(),
      sellingPrice: Number(sellingPrice),
      purchasePrice: purchasePrice.trim() ? Number(purchasePrice) : Number(sellingPrice),
      gstPercentage: gstPercentage.trim() ? Number(gstPercentage) : 18,
      currentStock: Number(currentStock) || 0,
      minimumStock: Number(minimumStock) || 10,
      productImage: productImage || undefined,
    };

    setSaving(true);
    try {
      if (editingProduct?._id) {
        await commerceService.updateProduct(editingProduct._id, payload);
        Alert.alert('Updated', 'Product updated successfully.');
      } else {
        await commerceService.createProduct(payload);
        Alert.alert('Created', 'Product added to your catalog.');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const previewUri = resolveFileUrl(productImage);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>{editingProduct ? 'Edit Product' : 'Add Product'}</Text>
          <Text style={styles.headerSub}>
            {editingProduct ? 'Update product details & pricing' : 'Create a new product for your catalog'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Product Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Product information</Text>

            {/* Upload Image Box */}
            <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage} activeOpacity={0.8}>
              {uploadingImg ? (
                <ActivityIndicator color="#00875A" />
              ) : previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.uploadedImg} resizeMode="cover" />
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="add" size={24} color="#00875A" />
                  <Text style={styles.uploadTitle}>Upload product images</Text>
                  <Text style={styles.uploadSub}>PNG, JPG up to 5 MB</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Product name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Product description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your product"
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Product SKU</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. BAG-001"
                  placeholderTextColor="#94A3B8"
                  value={sku}
                  onChangeText={setSku}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Category</Text>
                <TouchableOpacity
                  style={styles.selectBox}
                  onPress={() => setShowCatPicker((v) => !v)}
                >
                  <Text style={styles.selectText} numberOfLines={1}>{category}</Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {showCatPicker && (
              <View style={styles.catChipsWrap}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, category === cat && styles.catChipActive]}
                    onPress={() => {
                      setCategory(cat);
                      setShowCatPicker(false);
                    }}
                  >
                    <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Brand name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter brand"
              placeholderTextColor="#94A3B8"
              value={brand}
              onChangeText={setBrand}
            />
          </View>

          {/* Pricing & Stock Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pricing & stock information</Text>

            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Selling price (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="₹ 0.00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Original / Purchase price (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="₹ 0.00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={purchasePrice}
                  onChangeText={setPurchasePrice}
                />
              </View>
            </View>

            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Current stock</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={currentStock}
                  onChangeText={setCurrentStock}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Tax / GST (%)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="18"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={gstPercentage}
                  onChangeText={setGstPercentage}
                />
              </View>
            </View>

            <Text style={styles.label}>Minimum stock level</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={minimumStock}
              onChangeText={setMinimumStock}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>
                {editingProduct ? 'Update Product' : 'Save Product'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <QuickBottomBar navigation={navigation} activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 11.5, color: '#64748B', marginTop: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  uploadBox: {
    height: 116,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 14,
  },
  uploadedImg: { width: '100%', height: '100%' },
  uploadTitle: { fontSize: 13, fontWeight: '700', color: '#00875A', marginTop: 4 },
  uploadSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  label: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13.5,
    color: '#0F172A',
  },
  textArea: { height: 84, textAlignVertical: 'top', paddingTop: 10 },
  row2: { flexDirection: 'row', gap: 10 },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  selectText: { fontSize: 13.5, color: '#0F172A', flex: 1 },
  catChipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  catChipActive: { backgroundColor: '#DCFCE7' },
  catChipText: { fontSize: 11.5, color: '#475569', fontWeight: '600' },
  catChipTextActive: { color: '#00875A', fontWeight: '700' },
  saveBtn: {
    backgroundColor: '#00875A',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
