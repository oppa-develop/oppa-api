const pool = require('../libs/database');
let servicesModel = {};

servicesModel.getServices = async () => {
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, categories.title as 'catagory_title', categories.description 'catagory_description', categories.img_url as 'catagory_img_url', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_catagory_description' FROM services  INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id`);
  return services
}

servicesModel.getBasicServices = async () => {
  const [basicServices] = await pool.query(`SELECT * FROM services WHERE isBasic = 1`);
  return basicServices
}

servicesModel.getServicesByCategoryId = async (id) => {
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, categories.title as 'catagory_title', categories.description 'catagory_description', categories.img_url as 'catagory_img_url', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_catagory_description' FROM services  INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE category_id=?`, [id]);
  return services
}

servicesModel.givePermission = async (service) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.query('INSER INTO providers_permited_services SET ?', [service]);
    const [newServicePermitted] = await conn.query('SELECT * FROM services WHERE service_id = ?', [service.services_service_id])
    await conn.commit();
    return newServicePermitted
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

servicesModel.provideService = async (serviceToProvide) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    conn [canProvide] = await conn.query('SELECT * FROM providers_has_services WHERE services_service_id = ?', [serviceToProvide.services_service_id])
    let row
    if (canProvide.length > 0) {
      [row] = await conn.query('INSERT INTO providers_has_services SET ?', [serviceToProvide])
    } else {
      throw Error('Provider cannot provide the service with service_id = ' + serviceToProvide.services_service_id)
    }
    await conn.commit();
    console.log(row);
    return row
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
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

module.exports = servicesModel;