const Contact  = require('../models/Contact');
const mongoose = require('mongoose');
const fs       = require('fs');
const { normalizePhoneNumber } = require('../utils/phoneHelper');


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

const normalize = (str) => str.toLowerCase().replace(/[\s_\-]/g, '');

const resolveField = (row, candidates) => {
  const rowKeys = Object.keys(row);
  for (const candidate of candidates) {
    const normCandidate = normalize(candidate);
    const match = rowKeys.find(k => normalize(k) === normCandidate);
    if (match !== undefined && row[match] !== undefined && row[match] !== '') {
      return row[match].trim();
    }
  }
  return '';
};

const AVATAR_COLORS = [
  '#4CAF50','#FF9800','#607D8B','#5C6BC0','#E91E63',
  '#009688','#795548','#3F51B5','#FF5722','#9C27B0',
];

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

const normalizePhone = (rawPhone) => normalizePhoneNumber(rawPhone);


const getSubscriberDigits = (phone) => {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0'))  return digits.slice(1);
  if (digits.length === 11 && digits.startsWith('1'))  return digits.slice(1);
  if (digits.length === 10) return digits;
  return digits.length > 10 ? digits.slice(-10) : digits;
};

const sendError = (res, status, message, details = null) => {
  const body = { success: false, message };
  if (details) body.details = details;
  return res.status(status).json(body);
};

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

    if (req.query.status && req.query.status !== 'All Contacts') {
      const statusValues = req.query.status.split(',').map(s => s.trim()).filter(Boolean);
      if (statusValues.length === 1) {
        filter.status = statusValues[0];
      } else if (statusValues.length > 1) {
        filter.status = { $in: statusValues };
      }
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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/contacts/:id
───────────────────────────────────────────────────────────────────────────── */
exports.getContact = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id))
      return sendError(res, 400, 'Invalid contact ID format');

    const contact = await Contact.findOne({ _id: req.params.id, user: req.user.id });
    if (!contact) return sendError(res, 404, 'Contact not found');

    return res.json({ success: true, data: toClientContact(contact) });
  } catch (err) { next(err); }
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

    if (!name || !name.trim())         return sendError(res, 400, 'Name is required');
    if (!whatsapp || !whatsapp.trim()) return sendError(res, 400, 'WhatsApp number is required');

    const normalizedWhatsapp = normalizePhone(whatsapp);
    if (!normalizedWhatsapp) return sendError(res, 400, 'Invalid WhatsApp number');
    if (normalizedWhatsapp.replace(/\D/g, '').length < 10)
      return sendError(res, 400, 'WhatsApp number must have at least 10 digits');

    // ─── DEBUG LOGS — remove these after fixing ───────────────────────────
    console.log('─────────────────────────────────────────');
    console.log('RAW INPUT whatsapp   :', whatsapp);
    console.log('NORMALIZED whatsapp  :', normalizedWhatsapp);
    console.log('INCOMING digits      :', getSubscriberDigits(normalizedWhatsapp));

    const existingContacts = await Contact.find({ user: req.user.id }, 'whatsapp').lean();

    console.log('EXISTING contacts    :');
    existingContacts.forEach((c, i) => {
      console.log(`  [${i + 1}] whatsapp: ${c.whatsapp}  →  digits: ${getSubscriberDigits(c.whatsapp)}`);
    });

    const incomingDigits = getSubscriberDigits(normalizedWhatsapp);
    const duplicateMatch = existingContacts.find(c => getSubscriberDigits(c.whatsapp) === incomingDigits);

    console.log('DUPLICATE MATCH      :', duplicateMatch ? duplicateMatch.whatsapp : 'none');
    console.log('─────────────────────────────────────────');
    // ─────────────────────────────────────────────────────────────────────

    const isDuplicate = !!duplicateMatch;
    if (isDuplicate) return sendError(res, 409, 'A contact with this WhatsApp number already exists');

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
    if (err.code === 11000)
      return sendError(res, 409, 'A contact with this WhatsApp number already exists');
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/contacts/:id
───────────────────────────────────────────────────────────────────────────── */
exports.updateContact = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id))
      return sendError(res, 400, 'Invalid contact ID format');

    const existingContact = await Contact.findOne({ _id: req.params.id, user: req.user.id });
    if (!existingContact) return sendError(res, 404, 'Contact not found');

    // If verified, block core identity updates
    if (existingContact.isVerified) {
      const coreFields = ['name', 'whatsapp', 'phone', 'email'];
      const isEditingCore = coreFields.some(f => req.body[f] !== undefined && req.body[f] !== existingContact[f]);
      if (isEditingCore) {
        return sendError(res, 403, 'This contact is verified and locked. Core details cannot be changed.');
      }
    }

    const allowed = ['name','whatsapp','phone','email','company','institute','address','city','country','status','labels','initials','color', 'isVerified'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    if (Object.keys(updates).length === 0)
      return sendError(res, 400, 'No valid fields provided for update');

    // Prevent un-verifying once verified
    if (existingContact.isVerified && updates.isVerified === false) {
      delete updates.isVerified;
    }

    if (updates.whatsapp !== undefined) {
      const normalized = normalizePhone(updates.whatsapp);
      if (!normalized) return sendError(res, 400, 'Invalid WhatsApp number');
      updates.whatsapp = normalized;
    }

    if (updates.name && !updates.initials && !existingContact.isVerified)
      updates.initials = updates.name.trim().substring(0, 2).toUpperCase();

    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    return res.json({ success: true, data: toClientContact(contact) });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return sendError(res, 400, 'Validation failed', messages);
    }
    if (err.code === 11000)
      return sendError(res, 409, 'A contact with this WhatsApp number already exists');
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/contacts/:id
───────────────────────────────────────────────────────────────────────────── */
exports.deleteContact = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id))
      return sendError(res, 400, 'Invalid contact ID format');

    const contact = await Contact.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!contact) return sendError(res, 404, 'Contact not found');

    return res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/contacts/bulk-delete
───────────────────────────────────────────────────────────────────────────── */
exports.bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendError(res, 400, 'ids must be a non-empty array');

    const invalidIds = ids.filter(id => !isValidObjectId(id));
    if (invalidIds.length)
      return sendError(res, 400, 'One or more invalid contact IDs', invalidIds);

    const result = await Contact.deleteMany({ _id: { $in: ids }, user: req.user.id });
    return res.json({ success: true, deleted: result.deletedCount });
  } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/contacts/bulk-status
───────────────────────────────────────────────────────────────────────────── */
exports.bulkUpdateStatus = async (req, res, next) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendError(res, 400, 'ids must be a non-empty array');
    if (!status) return sendError(res, 400, 'status is required');

    const result = await Contact.updateMany(
      { _id: { $in: ids }, user: req.user.id },
      { $set: { status } }
    );
    return res.json({ success: true, updated: result.modifiedCount });
  } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/contacts/bulk-labels
───────────────────────────────────────────────────────────────────────────── */
exports.bulkAddLabels = async (req, res, next) => {
  try {
    const { ids, labels } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendError(res, 400, 'ids must be a non-empty array');
    if (!Array.isArray(labels) || labels.length === 0)
      return sendError(res, 400, 'labels must be a non-empty array');

    const result = await Contact.updateMany(
      { _id: { $in: ids }, user: req.user.id },
      { $addToSet: { labels: { $each: labels } } }
    );
    return res.json({ success: true, updated: result.modifiedCount });
  } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/contacts/import
───────────────────────────────────────────────────────────────────────────── */
exports.importContacts = async (req, res, next) => {
  const cleanupFile = () => {
    try {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    } catch (_) {}
  };

  try {
    if (!req.file) return sendError(res, 400, 'Please upload a CSV file');

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

    if (!rows.length) return sendError(res, 400, 'CSV file is empty or has no data rows');

    // ── Parse the user-defined field mapping from Step 2 (if provided) ──────────
    // Shape: { "CSV Column Header": "crmFieldKey" | "skip" }
    // crmFieldKey values: phone, firstName, lastName, fullName, email, company,
    //                     city, country, address, status, labels, skip
    let fieldMapping = null;
    if (req.body.fieldMapping) {
      try {
        fieldMapping = JSON.parse(req.body.fieldMapping);
      } catch (_) {
        fieldMapping = null; // fall back to auto-detect
      }
    }

    // ── Helper: resolve a CRM field from a row using fieldMapping ────────────────
    const resolveFromMapping = (row, crmKey) => {
      if (!fieldMapping) return '';
      const csvCol = Object.keys(fieldMapping).find(k => fieldMapping[k] === crmKey);
      if (!csvCol) return '';
      return (row[csvCol] || '').trim();
    };

    const VALID_STATUSES = ['ACTIVE', 'WARM', 'INACTIVE', 'COLD'];
    const successful = [];
    const failed     = [];

    for (let i = 0; i < rows.length; i++) {
      const row      = rows[i];
      const rowIndex = i + 2;

      // ── Resolve name ───────────────────────────────────────────────────────────
      let name = '';
      if (fieldMapping) {
        const firstName = resolveFromMapping(row, 'firstName');
        const lastName  = resolveFromMapping(row, 'lastName');
        const fullName  = resolveFromMapping(row, 'fullName');
        name = fullName || [firstName, lastName].filter(Boolean).join(' ');
      } else {
        name = resolveField(row, [
          'name', 'fullname', 'full name', 'full_name', 'fullName',
          'FullName', 'Full Name', 'contactname', 'contact name', 'contact_name',
          'firstname', 'first name', 'first_name', 'fname',
        ]);
        // Try combining first + last name if separate columns
        if (!name) {
          const first = resolveField(row, ['firstname', 'first name', 'first_name', 'fname', 'First Name']);
          const last  = resolveField(row, ['lastname', 'last name', 'last_name', 'lname', 'Last Name']);
          name = [first, last].filter(Boolean).join(' ');
        }
      }

      // ── Resolve phone ──────────────────────────────────────────────────────────
      const rawPhone = fieldMapping
        ? resolveFromMapping(row, 'phone')
        : resolveField(row, [
            'whatsapp', 'whatsappnumber', 'whatsapp number', 'whatsapp_number',
            'WhatsApp', 'WhatsApp Number',
            'phone', 'phonenumber', 'phone number', 'phone_number',
            'Phone', 'Phone Number',
            'mobile', 'mobilenumber', 'mobile number', 'mobile_number',
            'contact', 'contactnumber', 'contact number', 'cell', 'mob',
          ]);

      const rawAltPhone = fieldMapping
        ? resolveFromMapping(row, 'altPhone') || rawPhone
        : resolveField(row, [
            'alternatephone', 'alternate phone', 'altphone', 'alt phone',
            'landline', 'telephone', 'tel',
          ]) || rawPhone;

      // ── Resolve remaining fields ───────────────────────────────────────────────
      const email = fieldMapping
        ? resolveFromMapping(row, 'email')
        : resolveField(row, ['email', 'emailaddress', 'email address', 'email_address', 'Email', 'Email Address', 'mail']);

      const company = fieldMapping
        ? resolveFromMapping(row, 'company')
        : resolveField(row, ['company', 'companyname', 'company name', 'company_name', 'Company', 'Company Name', 'organisation', 'organization', 'org']);

      const institute = fieldMapping
        ? resolveFromMapping(row, 'institute')
        : resolveField(row, ['institute', 'institution', 'Institute', 'Institution', 'school', 'college', 'university']);

      const city = fieldMapping
        ? resolveFromMapping(row, 'city')
        : resolveField(row, ['city', 'City', 'town', 'Town', 'district', 'District']);

      const country = fieldMapping
        ? resolveFromMapping(row, 'country')
        : resolveField(row, ['country', 'Country', 'countrycode', 'country code', 'country_code', 'Country Code', 'CountryCode', 'nation', 'Nation']);

      const address = fieldMapping
        ? resolveFromMapping(row, 'address')
        : resolveField(row, [
            'address', 'Address', 'fulladdress', 'full address', 'full_address',
            'streetaddress', 'street address', 'street',
          ]) || [city, country].filter(Boolean).join(', ');

      const rawStatus = fieldMapping
        ? resolveFromMapping(row, 'status')
        : resolveField(row, ['status', 'Status', 'contactstatus', 'contact status']);
      const status = VALID_STATUSES.includes((rawStatus || '').toUpperCase())
        ? rawStatus.toUpperCase()
        : 'ACTIVE';

      const rawLabels = fieldMapping
        ? resolveFromMapping(row, 'labels')
        : resolveField(row, ['labels', 'Labels', 'tags', 'Tags', 'label', 'tag']);
      const labels = rawLabels
        ? rawLabels.split(',').map(l => l.trim()).filter(Boolean)
        : [];

      // ── Validation ─────────────────────────────────────────────────────────────
      if (!name) {
        failed.push({ row: rowIndex, data: JSON.stringify(row), name: 'Unknown', reason: 'Missing name' });
        continue;
      }
      if (!rawPhone) {
        failed.push({ row: rowIndex, data: name, name, reason: 'Missing phone / WhatsApp number' });
        continue;
      }

      const whatsapp = normalizePhone(rawPhone);
      if (!whatsapp) {
        failed.push({ row: rowIndex, data: rawPhone, name, reason: 'Empty phone number after cleaning' });
        continue;
      }
      if (whatsapp.replace(/\D/g, '').length < 10) {
        failed.push({ row: rowIndex, data: rawPhone, name, reason: 'Phone number too short (min 10 digits)' });
        continue;
      }

      const phone    = normalizePhone(rawAltPhone) || whatsapp;
      const initials = name.substring(0, 2).toUpperCase();
      const color    = AVATAR_COLORS[i % AVATAR_COLORS.length];

      try {
        await Contact.findOneAndUpdate(
          { user: req.user.id, whatsapp },
          {
            $set: {
              name,
              whatsapp,
              phone,
              email:        email     || '',
              company:      company   || '',
              institute:    institute || '',
              address:      address   || '',
              city:         city      || '',
              country:      country   || '',
              status,
              labels,
              initials,
              color,
              importedFrom: req.file?.originalname || 'csv_import',
            },
            $setOnInsert: { user: req.user.id },
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