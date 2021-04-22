const pool = require('../libs/database');
let servicesModel = {};

servicesModel.getServices = async () => {
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, services.state, categories.title as 'category_title', categories.description 'category_description', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_category_description' FROM services INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id`);
  return services
}

servicesModel.requestService = async (data) => {
  const [requestedData] = await pool.query('INSERT INTO requested_services SET ?', [data])
  return requestedData
}

servicesModel.editOfferedServiceState = async (service) => {
  console.log(pool.format(`UPDATE provider_has_services SET ? WHERE provider_has_services_id = ?`, [service, service.provider_has_services_id]));
  const [update] = await pool.query(`UPDATE provider_has_services SET ? WHERE provider_has_services_id = ?`, [service, service.provider_has_services_id])
  return update
}

servicesModel.cancelRequest = async (id) => {
  await pool.query("UPDATE requested_services SET state = 'cancelado' WHERE requested_service_id = ?", [id])
  return 'ok'
}

servicesModel.scheduleService = async (data) => {
  const [scheduleService] = await pool.query('INSERT INTO scheduled_services SET ?', [data])
  return scheduleService
}

servicesModel.getServicesBySuperCategoryTitle = async (super_category_title) => {
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, categories.title as 'category_title', categories.description 'category_description', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_category_description' FROM services INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE super_categories.title = ?`, [super_category_title]);
  return services
}

servicesModel.getServicesPermitted = async (provider_id) => {
  const [services] = await pool.query("SELECT services.*, super_categories.title as `super_category` FROM oppa.services LEFT JOIN providers_permitted_services ON providers_permitted_services.services_service_id = services.service_id LEFT JOIN categories ON services.categories_category_id = categories.category_id LEFT JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE isBasic = 1 OR providers_permitted_services.services_service_id = services.service_id AND providers_provider_id = ?;", [provider_id]);
  return services
}

servicesModel.getBasicServices = async () => {
  const [basicServices] = await pool.query(`SELECT * FROM services WHERE isBasic = 1`);
  return basicServices
}

servicesModel.getServicesByCategoryId = async (id) => {
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, categories.title as 'category_title', categories.description 'category_description', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_category_description' FROM services INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE category_id=?`, [id]);
  return services
}

servicesModel.givePermission = async (service) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.query('INSERT INTO providers_permitted_services SET ?', [service]);
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

servicesModel.getServicesHistory = async (client_id) => {
  const [services] = await pool.query(`SELECT provider_has_services.providers_provider_id, scheduled_services.*, services.* FROM oppa.scheduled_services INNER JOIN provider_has_services ON scheduled_services.provider_has_services_provider_has_services_id = provider_has_services.provider_has_services_id INNER JOIN services ON provider_has_services.services_service_id = services.service_id WHERE clients_client_id = ?;`, [client_id]);
  for await (let service of services) {
    [provider] = await pool.query(`SELECT providers.provider_id, users.firstname, users.lastname, users.email, users.img_url, users.phone FROM oppa.users LEFT JOIN providers ON users.user_id = providers.users_user_id WHERE providers.provider_id = ?;`, service.providers_provider_id);
    service.provider = provider[0];
  }
  console.log({services});
  return services
}

servicesModel.getProviderServicesByDate = async (provider_id, date) => {
  const [services] = await pool.query(`SELECT provider_has_services.providers_provider_id, scheduled_services.*, services.* FROM oppa.scheduled_services INNER JOIN provider_has_services ON scheduled_services.provider_has_services_provider_has_services_id = provider_has_services.provider_has_services_id INNER JOIN services ON provider_has_services.services_service_id = services.service_id WHERE provider_has_services.providers_provider_id = ? AND date BETWEEN ? AND ?;`, [provider_id, date + ' 00:00:00', date + ' 23:59:59']);
  for await (let service of services) {
    [client] = await pool.query(`SELECT clients.client_id, users.firstname, users.lastname, users.email, users.img_url, users.phone FROM oppa.users LEFT JOIN clients ON users.user_id = clients.users_user_id WHERE clients.client_id = ?;`, service.clients_client_id);
    [address] = await pool.query(`SELECT * FROM addresses WHERE address_id = ?`, service.addresses_address_id);
    service.client = client[0];
    service.address = address[0];
  }
  console.log({services});
  return services
}

servicesModel.getProviderServicesHistory = async (provider_id, date) => {
  const [services] = await pool.query(`SELECT provider_has_services.providers_provider_id, scheduled_services.*, services.* FROM oppa.scheduled_services INNER JOIN provider_has_services ON scheduled_services.provider_has_services_provider_has_services_id = provider_has_services.provider_has_services_id INNER JOIN services ON provider_has_services.services_service_id = services.service_id WHERE provider_has_services.providers_provider_id = ? AND date <= ?;`, [provider_id, date]);
  for await (let service of services) {
    [client] = await pool.query(`SELECT clients.client_id, users.firstname, users.lastname, users.email, users.img_url, users.phone FROM oppa.users LEFT JOIN clients ON users.user_id = clients.users_user_id WHERE clients.client_id = ?;`, service.clients_client_id);
    [address] = await pool.query(`SELECT * FROM addresses WHERE address_id = ?`, service.addresses_address_id);
    service.client = client[0];
    service.address = address[0];
  }
  console.log({services});
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
    if (canProvide.length > 0 || isBasic[0].isBasic == 1) {
      const [newServiceProvided] = await conn.query('INSERT INTO provider_has_services SET ?', [serviceToProvide]);
      // console.log('funcionó antes de locations', newServiceProvided);
      for await (let location of locationToProvide) {
        location.push(newServiceProvided.insertId)
      }
      console.log(conn.format("INSERT INTO locations (`district`, `region`, `provider_has_services_provider_has_services_id`) VALUES ?", [locationToProvide]))
      await conn.query("INSERT INTO locations (`district`, `region`, `provider_has_services_provider_has_services_id`) VALUES ?", [locationToProvide]);
      console.log('insertó locations');
      // const [newServiceToProvide] = await conn.query('SELECT * FROM oppa.provider_has_services WHERE provider_has_services_id=?;', [newServiceProvided.insertId]);
      // const [locations] = await conn.query('SELECT * FROM oppa.locations WHERE =?;', [serviceToProvide.providers_provider_id,serviceToProvide.providers_users_user_id,serviceToProvide.services_service_id]);
      // newServiceToProvide[0].locations = locations;
      await conn.commit();
      return newServiceProvided
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
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, categories.title as 'category_title', categories.description 'category_description', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_category_description' FROM services INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE super_category_id=?`, [id]);
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
  const [services] = await pool.query("SELECT provider_has_services.*, users.firstname, users.lastname FROM provider_has_services INNER JOIN users ON users.user_id = providers_users_user_id WHERE services_service_id = ? AND provider_has_services.state = 'active'", [service_id])
  // const [services] = await pool.query("SELECT * FROM provider_has_services WHERE state = 'active'")
  return services
}

servicesModel.getServicesOfferedByUserId = async (user_id) => {
  let i=0;
  const [services] = await pool.query("SELECT services.*, provider_has_services.*, super_categories.title as `super_category` FROM provider_has_services INNER JOIN services ON services.service_id = provider_has_services.services_service_id INNER JOIN categories ON services.categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE providers_provider_id = ?;", [user_id]);
  for await (let service of services) {
    const [locations] = await pool.query('SELECT * FROM oppa.locations WHERE provider_has_services_provider_has_services_id = ?;', [service.provider_has_services_id]);
    services[i].locations = locations
    i++
  }

  return services
}

servicesModel.changeOfferedServiceState = async (offeredService) => {
  // detallar los ? desde el offeredService en la query
  const [res] = await pool.query('UPDATE provider_has_services SET state = ? WHERE ?', [offeredService])
  return res
}

module.exports = servicesModel;