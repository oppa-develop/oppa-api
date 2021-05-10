const pool = require('../libs/database');
let superCategoriesModel = {};

superCategoriesModel.getSuperCategories = async () => {
  const [rows] = await pool.query('SELECT * FROM super_categories;');
  return rows
}

superCategoriesModel.getSuperCategoryById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM super_categories WHERE super_category_id=?;', [id]);
  return rows
}

superCategoriesModel.createSuperCategory = async (newSuperCategory) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [row] = await conn.query('INSERT INTO super_categories SET ?', [newSuperCategory])
    const [superCategory] = await conn.query('SELECT * FROM super_categories WHERE super_category_id=?', [row.insertId])
    await conn.commit();
    return superCategory
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

module.exports = superCategoriesModel;