const pool = require('../libs/database');
let servicesModel = {};

servicesModel.getServices = async () => {
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, categories.title as 'catagory_title', categories.description 'catagory_description', categories.img_url as 'catagory_img_url', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_catagory_description' FROM services  INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id`);
  return services
}

servicesModel.getServicesByCategoryId = async (id) => {
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, categories.title as 'catagory_title', categories.description 'catagory_description', categories.img_url as 'catagory_img_url', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_catagory_description' FROM services  INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE category_id=?`, [id]);
  return services
}

servicesModel.getServicesBySuperCategoryId = async (id) => {
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, categories.title as 'catagory_title', categories.description 'catagory_description', categories.img_url as 'catagory_img_url', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_catagory_description' FROM services  INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE super_category_id=?`, [id]);
  return services
}

servicesModel.getServicesCategories = async () => {
  const [categories] = await pool.query('SELECT * FROM categories;');
  return categories
}

servicesModel.getServicesSuperCategories = async () => {
  const [superCategories] = await pool.query('SELECT * FROM super_categories;');
  return superCategories
}

servicesModel.getServicesById = async (id) => {
  const [service] = await pool.query('SELECT * FROM services WHERE service_id=?;', [id]);
  return service
}

servicesModel.getCategoryById = async (id) => {
  const [category] = await pool.query('SELECT * FROM categories WHERE category_id=?;', [id]);
  return category
}

servicesModel.getSuperCategoryById = async (id) => {
  const [superCategory] = await pool.query('SELECT * FROM super_categories WHERE super_category_id=?;', [id]);
  return superCategory
}

servicesModel.createSuperCategory = async (newSuperCategory) => {
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

servicesModel.createService = async (newService, isBasic) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [row] = await conn.query('INSERT INTO services SET ?', [newService])
    if (isBasic) {
      await conn.query('INSERT INTO basic_services SET ?', [{ 
        services_service_id: row.insertId,
        services_categories_category_id: newService.categories_category_id,
        created_at: newService.created_at 
      }])
    }
    const [finalServiceData] = await conn.query('SELECT * FROM services WHERE service_id=?', [row.insertId])
    await conn.commit();
    return finalServiceData
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

servicesModel.createCategory = async (newCategory) => {
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

module.exports = servicesModel;