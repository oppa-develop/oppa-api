const pool = require('../libs/database');
let servicesModel = {};

servicesModel.getServices = async () => {
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, categories.title as 'catagory_title', categories.description 'catagory_description', categories.img_url as 'catagory_img_url', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_catagory_description' FROM services  INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id`);
  return services
}

servicesModel.getServicesBySuperCategoryTitle = async (super_category_title) => {
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, categories.title as 'catagory_title', categories.description 'catagory_description', categories.img_url as 'catagory_img_url', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_catagory_description' FROM services  INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE super_categories.title = ?`, [super_category_title]);
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

servicesModel.getServicesHistory = async (user_id) => {
  const [services] = await pool.query('SELECT * FROM oppa.scheduled_services WHERE clients_users_user_id = ?;', [user_id]);
  return services
}

servicesModel.getSuperCategoriesBestServices = async () => {
  let conn = null;
  let i = 0;
  // let superCategories = [];
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [superCategories] = await conn.query('SELECT * FROM super_categories');
    superCategories.forEach( async superCategory => {
      const [services] = await conn.query('SELECT super_categories_super_category_id, services.* FROM services INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON super_categories.super_category_id = categories.super_categories_super_category_id WHERE super_categories_super_category_id = ? ORDER BY RAND() LIMIT 5;', [superCategory.super_category_id])
      superCategories[i].services = services
      i++
    });
    await conn.commit();
    return superCategories
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

servicesModel.provideService = async (serviceToProvide, locationToProvide) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [isBasic] = await conn.query('SELECT isBasic FROM oppa.services WHERE service_id = ?;', [serviceToProvide.services_service_id]);
    const [canProvide] = await conn.query('SELECT * FROM providers_permitted_services WHERE services_service_id = ?', [serviceToProvide.services_service_id]);
    console.log(locationToProvide);
    if (canProvide.length > 0 || isBasic[0].isBasic == 1) {
      await conn.query('INSERT INTO providers_has_services SET ?', [serviceToProvide]);
      await conn.query("INSERT INTO locations (district, region, providers_has_services_providers_provider_id, providers_has_services_providers_users_user_id, providers_has_services_services_service_id) VALUES ?", [locationToProvide]);
      const [newServiceToProvide] = await conn.query('SELECT * FROM oppa.providers_has_services WHERE providers_provider_id=? AND providers_users_user_id=? AND services_service_id=?;', [serviceToProvide.providers_provider_id,serviceToProvide.providers_users_user_id,serviceToProvide.services_service_id]);
      const [locations] = await conn.query('SELECT * FROM oppa.locations WHERE providers_has_services_providers_provider_id=? AND providers_has_services_providers_users_user_id=? AND providers_has_services_services_service_id=?;', [serviceToProvide.providers_provider_id,serviceToProvide.providers_users_user_id,serviceToProvide.services_service_id]);
      newServiceToProvide[0].locations = locations;
      await conn.commit();
      return newServiceToProvide
    } else {
      throw Error('Provider cannot provide the service with service_id = ' + serviceToProvide.services_service_id)
    }
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

servicesModel.createService = async (newService) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [row] = await conn.query('INSERT INTO services SET ?', [newService])
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

servicesModel.getProvidersHasServices = async (service_id) => {
  const [services] = await pool.query("SELECT providers_has_services.*, users.firstname, users.lastname FROM providers_has_services INNER JOIN users ON users.user_id = providers_users_user_id WHERE services_service_id = ? AND providers_has_services.state = 'active'", [service_id])
  // const [services] = await pool.query("SELECT * FROM providers_has_services WHERE state = 'active'")
  return services
}

module.exports = servicesModel;