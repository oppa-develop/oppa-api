const pool = require('../libs/database');
let categoriesModel = {};

categoriesModel.getCategories = async () => {
  const [rows] = await pool.query('SELECT * FROM categories;');
  return rows
}

categoriesModel.getCategoryById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM categories WHERE category_id=?;', [id]);
  console.log(rows);
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