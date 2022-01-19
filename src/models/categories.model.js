const pool = require('../libs/database');
let categoriesModel = {};

categoriesModel.getCategories = async () => {
  const [rows] = await pool.query("SELECT categories.*, super_categories.title as 'super_category' FROM categories INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id;");
  return rows
}

categoriesModel.getCategoriesBySupercategoryTitle = async (title) => {
  const [categories] = await pool.query("SELECT categories.* FROM categories INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE super_categories.title = ?;", [title]);
  return categories
}

categoriesModel.getCategoryById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM categories WHERE category_id=?;', [id]);
  return rows
}

categoriesModel.createCategory = async (newCategory) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [row] = await conn.query('INSERT INTO categories SET ?', [newCategory])
    const [category] = await conn.query('SELECT * FROM categories WHERE category_id=?', [row.insertId])
    await conn.commit();
    return category
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

module.exports = categoriesModel;