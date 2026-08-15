const db = require('../config/db');
const { invalidateAllUserCache } = require('../services/cacheService');

const toInt = (v) => {
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
};

// Auto-generated / dummy categories (e.g. "EdgeCat161514") are never
// exposed, creatable or editable.
const EDGE_CATEGORY_RE = /^EdgeCat/i;

const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    let query = "SELECT id, name, type, icon_name, color_code FROM categories WHERE name NOT LIKE 'EdgeCat%'";
    const params = [];

    if (type) {
      query += ' AND type = $1';
      params.push(type);
    }

    query += ' ORDER BY name ASC';

    const result = await db.query(query, params);
    return res.json(result.rows);
  } catch (error) {
    console.error('Get Categories Error:', error);
    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid category id.' });

    const result = await db.query('SELECT id, name, type, icon_name, color_code FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Get Category By ID Error:', error);
    return res.status(500).json({ error: 'Failed to fetch category.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, type = 'expense', icon_name = 'Tag', color_code = '#6B7280' } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const cleanName = String(name).trim();
    if (EDGE_CATEGORY_RE.test(cleanName)) {
      return res.status(400).json({ error: 'Category name is not allowed.' });
    }
    const existing = await db.query('SELECT * FROM categories WHERE LOWER(name) = LOWER($1)', [cleanName]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Category already exists.' });
    }

    const result = await db.query(
      'INSERT INTO categories (name, type, icon_name, color_code) VALUES ($1, $2, $3, $4) RETURNING id, name, type, icon_name, color_code',
      [cleanName, ['income', 'expense'].includes(type) ? type : 'expense', icon_name, color_code]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create Category Error:', error);
    return res.status(500).json({ error: 'Failed to create category.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid category id.' });

    const existing = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Category not found.' });

    const body = req.body || {};
    const cur = existing.rows[0];
    const name = body.name !== undefined && String(body.name).trim() ? String(body.name).trim() : cur.name;
    if (EDGE_CATEGORY_RE.test(name)) {
      return res.status(400).json({ error: 'Category name is not allowed.' });
    }
    const type = body.type !== undefined && ['income', 'expense'].includes(body.type) ? body.type : cur.type;
    const icon_name = body.icon_name || cur.icon_name;
    const color_code = body.color_code || cur.color_code;

    const result = await db.query(
      'UPDATE categories SET name = $1, type = $2, icon_name = $3, color_code = $4 WHERE id = $5 RETURNING id, name, type, icon_name, color_code',
      [name, type, icon_name, color_code, id]
    );

    await invalidateAllUserCache(); // categories are global; clear all cached dashboards
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Update Category Error:', error);
    return res.status(500).json({ error: 'Failed to update category.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid category id.' });

    const existing = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Category not found.' });

    if (existing.rows[0].name === 'Uncategorized') {
      return res.status(400).json({ error: 'The Uncategorized fallback category cannot be deleted.' });
    }

    await db.query('DELETE FROM categories WHERE id = $1', [id]);
    await invalidateAllUserCache();
    return res.json({ message: 'Category deleted.' });
  } catch (error) {
    console.error('Delete Category Error:', error);
    return res.status(500).json({ error: 'Failed to delete category.' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
