const Contact  = require('../models/Contact');
const mongoose = require('mongoose');
const fs       = require('fs');

/* ── Built-in CSV parser — no external dependency needed ── */
const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { values.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    values.push(cur.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = (values[i] || '').replace(/^"|"$/g, ''); });
    return row;
  });
};

const AVATAR_COLORS = [
  '#4CAF50','#FF9800','#607D8B','#5C6BC0','#E91E63',
  '#009688','#795548','#3F51B5','#FF5722','#9C27B0',
];

/* ─── toClientContact ───────────────────────────────────────────────────────── */
const toClientContact = (doc) => ({
  id:           doc._id,
  _id:          doc._id,
  name:         doc.name,
  whatsapp:     doc.whatsapp,
  phone:        doc.phone,
  email:        doc.email,
  company:      doc.company,
  institute:    doc.institute,
  address:      doc.address,
  city:         doc.city,
  country:      doc.country,
  status:       doc.status,
  labels:       doc.labels,
  initials:     doc.initials,
  color:        doc.color,
  importedFrom: doc.importedFrom,
  createdAt:    doc.createdAt,
  updatedAt:    doc.updatedAt,
});

/* ─── normalizePhone ─────────────────────────────────────────────────────────
   Cleans and normalizes a phone number string.
   - Guards against undefined / null / non-string values
   - Strips spaces, dashes, dots, and parentheses
   - Converts 00XX... international prefix to +XX...
   - Returns null if the result is empty
   - Does NOT assume or append any country code
────────────────────────────────────────────────────────────────────────────── */
const normalizePhone = (rawPhone) => {
  const cleaned = (rawPhone || '').toString().trim().replace(/[\s\-().]/g, '');
  if (!cleaned) return null;
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);
  return cleaned;
};

/* ─── sendError ──────────────────────────────────────────────────────────────
   Consistent error response shape across all routes.
────────────────────────────────────────────────────────────────────────────── */
const sendError = (res, status, message, details = null) => {
  const body = { success: false, message };
  if (details) body.details = details;
  return res.status(status).json(body);
};

/* ─── isValidObjectId ────────────────────────────────────────────────────────
   Prevents Mongoose CastError when an invalid id is passed in the URL.
────────────────────────────────────────────────────────────────────────────── */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/contacts
───────────────────────────────────────────────────────────────────────────── */
exports.getContacts = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = { user: req.user.id };
    // const filter ={}

    if (req.query.status && req.query.status !== 'All Contacts') {
      filter.status = req.query.status;
    }

    if (req.query.labels) {
      const labelArr = req.query.labels.split(',').map(l => l.trim()).filter(Boolean);
      if (labelArr.length) filter.labels = { $in: labelArr };
    }

    if (req.query.search) {
      const q = req.query.search.trim();
      if (q) {
        filter.$or = [
          { name:     { $regex: q, $options: 'i' } },
          { email:    { $regex: q, $options: 'i' } },
          { whatsapp: { $regex: q, $options: 'i' } },
        ];
      }
    }

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Contact.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data:    contacts.map(toClientContact),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/contacts/:id
───────────────────────────────────────────────────────────────────────────── */
exports.getContact = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, 400, 'Invalid contact ID format');
    }

    const contact = await Contact.findOne({ _id: req.params.id, user: req.user.id });
    if (!contact) return sendError(res, 404, 'Contact not found');

    return res.json({ success: true, data: toClientContact(contact) });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/contacts
───────────────────────────────────────────────────────────────────────────── */
exports.createContact = async (req, res, next) => {
  try {
    const {
      name, whatsapp, phone, email,
      company, institute, address, city, country,
      status, labels, initials, color,
    } = req.body;

    // Required field validation
    if (!name || !name.trim())         return sendError(res, 400, 'Name is required');
    if (!whatsapp || !whatsapp.trim()) return sendError(res, 400, 'WhatsApp number is required');

    // Normalize and validate the whatsapp number
    const normalizedWhatsapp = normalizePhone(whatsapp);
    if (!normalizedWhatsapp) return sendError(res, 400, 'Invalid WhatsApp number');
    if (normalizedWhatsapp.replace(/\D/g, '').length < 10) {
      return sendError(res, 400, 'WhatsApp number must have at least 10 digits');
    }

    // Check for duplicate
    const existing = await Contact.findOne({ user: req.user.id, whatsapp: normalizedWhatsapp });
    if (existing) return sendError(res, 409, 'A contact with this WhatsApp number already exists');

    const contact = await Contact.create({
      user:      req.user.id,
      name:      name.trim(),
      whatsapp:  normalizedWhatsapp,
      phone:     phone      || '',
      email:     email      || '',
      company:   company    || '',
      institute: institute  || '',
      address:   address    || '',
      city:      city       || '',
      country:   country    || '',
      status:    status     || 'ACTIVE',
      labels:    labels     || [],
      initials:  initials   || name.trim().substring(0, 2).toUpperCase(),
      color:     color      || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    });

    return res.status(201).json({ success: true, data: toClientContact(contact) });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return sendError(res, 400, 'Validation failed', messages);
    }
    if (err.code === 11000) {
      return sendError(res, 409, 'A contact with this WhatsApp number already exists');
    }
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/contacts/:id
───────────────────────────────────────────────────────────────────────────── */
exports.updateContact = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, 400, 'Invalid contact ID format');
    }

    const allowed = ['name','whatsapp','phone','email','company','institute','address','city','country','status','labels','initials','color'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, 'No valid fields provided for update');
    }

    // Normalize whatsapp if it's being updated
    if (updates.whatsapp !== undefined) {
      const normalized = normalizePhone(updates.whatsapp);
      if (!normalized) return sendError(res, 400, 'Invalid WhatsApp number');
      if (normalized.replace(/\D/g, '').length < 10) {
        return sendError(res, 400, 'WhatsApp number must have at least 10 digits');
      }
      updates.whatsapp = normalized;
    }

    // Re-generate initials if name changed but initials not explicitly provided
    if (updates.name && !updates.initials) {
      updates.initials = updates.name.trim().substring(0, 2).toUpperCase();
    }

    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!contact) return sendError(res, 404, 'Contact not found');

    return res.json({ success: true, data: toClientContact(contact) });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return sendError(res, 400, 'Validation failed', messages);
    }
    if (err.code === 11000) {
      return sendError(res, 409, 'A contact with this WhatsApp number already exists');
    }
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/contacts/:id
───────────────────────────────────────────────────────────────────────────── */
exports.deleteContact = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, 400, 'Invalid contact ID format');
    }

    const contact = await Contact.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!contact) return sendError(res, 404, 'Contact not found');

    return res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/contacts/bulk-delete
   Body: { ids: ['id1', 'id2', ...] }
───────────────────────────────────────────────────────────────────────────── */
exports.bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 400, 'ids must be a non-empty array');
    }

    const invalidIds = ids.filter(id => !isValidObjectId(id));
    if (invalidIds.length) {
      return sendError(res, 400, 'One or more invalid contact IDs', invalidIds);
    }

    const result = await Contact.deleteMany({ _id: { $in: ids }, user: req.user.id });
    return res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/contacts/import
───────────────────────────────────────────────────────────────────────────── */
exports.importContacts = async (req, res, next) => {
  const cleanupFile = () => {
    try {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (_) { /* ignore cleanup errors */ }
  };

  try {
    if (!req.file) {
      return sendError(res, 400, 'Please upload a CSV file');
    }

    let fileContent;
    try {
      fileContent = fs.readFileSync(req.file.path, 'utf-8');
    } catch (readErr) {
      cleanupFile();
      return sendError(res, 500, 'Failed to read uploaded file. Please try again.');
    }

    let rows;
    try {
      rows = parseCSV(fileContent);
    } catch (parseErr) {
      cleanupFile();
      return sendError(res, 400, 'Failed to parse CSV. Please check the file format and try again.');
    }

    cleanupFile();

    if (!rows.length) {
      return sendError(res, 400, 'CSV file is empty or has no data rows');
    }

    const successful = [];
    const failed     = [];

    for (let i = 0; i < rows.length; i++) {
      const row      = rows[i];
      const rowIndex = i + 2; // +2 because row 1 is headers, arrays are 0-indexed

      // Flexible column name mapping
      const name      = row.fullName  || row.name      || row.Name      || row.FullName || '';
      const phone     = row.Phone     || row.phone     || row.whatsapp  || row.WhatsApp || '';
      const email     = row.Email     || row.email     || '';
      const company   = row.Company   || row.company   || '';
      const city      = row.City      || row.city      || '';
      const country   = row['Country Code'] || row.country || row.Country || '';
      const institute = row.Institute || row.institute || '';
      const address   = row.Address   || row.address   || [city, country].filter(Boolean).join(', ');

      // Required field validation
      if (!name || !name.trim()) {
        failed.push({ row: rowIndex, data: JSON.stringify(row), name: 'Unknown', reason: 'Missing name' });
        continue;
      }
      if (!phone) {
        failed.push({ row: rowIndex, data: name, name, reason: 'Missing phone number' });
        continue;
      }

      // Normalize phone
      const whatsapp = normalizePhone(phone);

      if (!whatsapp) {
        failed.push({ row: rowIndex, data: phone, name, reason: 'Empty phone number after cleaning' });
        continue;
      }

      if (whatsapp.replace(/\D/g, '').length < 10) {
        failed.push({ row: rowIndex, data: phone, name, reason: 'Phone number too short (min 10 digits)' });
        continue;
      }

      const initials = name.trim().substring(0, 2).toUpperCase();
      const color    = AVATAR_COLORS[i % AVATAR_COLORS.length];

      try {
        await Contact.findOneAndUpdate(
          { user: req.user.id, whatsapp },
          {
            $set: {
              name: name.trim(), whatsapp, phone: whatsapp, email,
              company, institute, address, city, country,
              status: 'ACTIVE', initials, color,
              importedFrom: req.file?.originalname || 'csv_import',
            },
            $setOnInsert: { labels: [], user: req.user.id },
          },
          { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );

        successful.push({ row: rowIndex, name });
      } catch (dbErr) {
        if (dbErr.name === 'ValidationError') {
          const messages = Object.values(dbErr.errors).map(e => e.message).join(', ');
          failed.push({ row: rowIndex, data: whatsapp, name, reason: `Validation error: ${messages}` });
        } else if (dbErr.code === 11000) {
          failed.push({ row: rowIndex, data: whatsapp, name, reason: 'Duplicate entry' });
        } else {
          failed.push({ row: rowIndex, data: whatsapp, name, reason: 'Database error — contact not saved' });
        }
      }
    }

    return res.status(201).json({
      success:    true,
      total:      rows.length,
      successful: successful.length,
      failed:     failed.length,
      failedRows: failed,
      message:    `${successful.length} of ${rows.length} contacts imported successfully`,
    });
  } catch (err) {
    cleanupFile();
    next(err);
  }
};