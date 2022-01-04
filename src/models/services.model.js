const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
dayjs.extend(isBetween);
const pool = require('../libs/database');
let servicesModel = {};

servicesModel.getServices = async () => {
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, services.state, categories.title as 'category_title', categories.description 'category_description', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_category_description', commission FROM services INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id`);
  return services
}

servicesModel.getServicesQuantityByState = async () => {
  const [services] = await pool.query(`SELECT services.title, MIN(categories.title) AS 'category', MIN(super_categories.title) AS 'supercategory', scheduled_services.state, count(*) AS 'quantity', MIN(commission) as 'commission' FROM scheduled_services INNER JOIN provider_has_services ON provider_has_services.provider_has_services_id = scheduled_services.provider_has_services_provider_has_services_id INNER JOIN services ON provider_has_services.services_service_id = services.service_id INNER JOIN categories ON categories.category_id = services.categories_category_id INNER JOIN super_categories ON super_categories.super_category_id = categories.super_categories_super_category_id GROUP BY services.title, scheduled_services.state;`);
  return services
}

servicesModel.getPotentialProviders = async (service_id, region, district, date, hour, gender) => {

  // buscamos todos los proveedores que ofrecen ese servicio actualmente
  let [providers] = await pool.query(`SELECT MIN(admin_id) as 'admin_id', MIN(client_id) as 'client_id', MIN(provider_id) as 'provider_id', users.*, provider_has_services.services_service_id as 'provided_service_id' FROM users LEFT JOIN admins ON admins.users_user_id = user_id  LEFT JOIN clients ON clients.users_user_id = user_id  LEFT JOIN providers ON providers.users_user_id = user_id INNER JOIN provider_has_services ON providers.provider_id = provider_has_services.providers_provider_id WHERE provider_has_services.state = 'active' AND provider_has_services.services_service_id = ? GROUP BY providers.provider_id;`, [service_id]);

  return providers
}

servicesModel.getLastServicesRequested = async () => {
  let [lastServicesRequested] = await pool.query(`SELECT services.title AS 'service', categories.title AS 'category', super_categories.title AS 'super_category', (SELECT concat(firstname, ' ', lastname) FROM users WHERE users.user_id = provider_has_services.providers_users_user_id LIMIT 1) AS 'provider', (SELECT concat(firstname, ' ', lastname) FROM users WHERE users.user_id = scheduled_services.clients_users_user_id LIMIT 1) AS 'client', scheduled_services.state, scheduled_services.date FROM scheduled_services INNER JOIN provider_has_services ON provider_has_services.provider_has_services_id = scheduled_services.provider_has_services_provider_has_services_id INNER JOIN services ON provider_has_services.services_service_id = services.service_id INNER JOIN categories ON categories.category_id = services.categories_category_id INNER JOIN super_categories ON super_categories.super_category_id = categories.super_categories_super_category_id;`)

  return lastServicesRequested
}

servicesModel.getMostRequestedServices = async (limit) => {
  limit = parseInt(limit)
  let [mostRequestedServices] = await pool.query(`SELECT MIN(services.title) AS 'title', MIN(categories.title) AS 'category', MIN(super_categories.title) AS 'supercategory', count(*) AS 'quantity', MIN(services.img_url) as 'img_url' FROM scheduled_services INNER JOIN provider_has_services ON provider_has_services.provider_has_services_id = scheduled_services.provider_has_services_provider_has_services_id INNER JOIN services ON provider_has_services.services_service_id = services.service_id INNER JOIN categories ON categories.category_id = services.categories_category_id INNER JOIN super_categories ON super_categories.super_category_id = categories.super_categories_super_category_id GROUP BY categories.title, services.title ORDER BY quantity DESC LIMIT ?;`, [limit])

  return mostRequestedServices
}

servicesModel.getPotentialServices = async (potentialProviders, service_id, region, district, date, hour, gender) => {
  // filtros
  let filters = {
    date: false,
    hour: false,
  }
  let potentialServices = []
  
  return new Promise(async resolve => {
    
    for await (let provider of potentialProviders) {
      // borramos la data sensible
      delete provider.password;
      delete provider.token;
  
      const [provider_has_services] = await pool.query(`SELECT * FROM provider_has_services WHERE provider_has_services.providers_provider_id = ? AND provider_has_services.services_service_id = ? AND provider_has_services.state = 'active' AND (provider_has_services.gender = 'Unisex' OR provider_has_services.gender = ?);`, [provider.provider_id, service_id, gender]);

      console.log(pool.format(`SELECT * FROM provider_has_services WHERE provider_has_services.providers_provider_id = ? AND provider_has_services.services_service_id = ? AND provider_has_services.state = 'active' AND (provider_has_services.gender = 'Unisex' OR provider_has_services.gender = ?);`, [provider.provider_id, service_id, gender]))

      for await (let provider_has_service of provider_has_services) {
        // obtenemos la locación definida por el proveedor para este servicio, filtrada por region, comuna y género
        const [location] = await pool.query(`SELECT * FROM locations WHERE locations.provider_has_services_provider_has_services_id = ? AND locations.region = ? AND (locations.district = ? OR locations.district IS NULL);`, [provider_has_service.provider_has_services_id, region, district]);
        provider_has_service.location = location;
  
        // ahora filtramos por fecha
        let dateWeekNumber = dayjs(date).format('d');
        if (dateWeekNumber === '0') dateWeekNumber = 'd';
        if (dateWeekNumber === '1') dateWeekNumber = 'l';
        if (dateWeekNumber === '2') dateWeekNumber = 'm';
        if (dateWeekNumber === '3') dateWeekNumber = 'x';
        if (dateWeekNumber === '4') dateWeekNumber = 'j';
        if (dateWeekNumber === '5') dateWeekNumber = 'v';
        if (dateWeekNumber === '6') dateWeekNumber = 's';
        if (provider_has_service.workable.includes(dateWeekNumber)) filters.date = true;
        // ahora filtramos por hora
        if (parseInt(hour.replace(':', '')) > parseInt(provider_has_service.start.replace(':', '')) && parseInt(hour.replace(':', '')) < parseInt(provider_has_service.end.replace(':', ''))) filters.hour = true;
  
        // finalmente, comprobamos que todos los filtros sean true
        if (filters.date && filters.hour) potentialServices.push(provider_has_service)
  
        // devolvemos los filtros a estado false
        filters.date = false;
        filters.hour = false;
      }
    }

    resolve(potentialServices)
  })
}

servicesModel.requestService = async (data) => {
  const [requestedData] = await pool.query('INSERT INTO requested_services SET ?', [data])
  return requestedData
}

servicesModel.editOfferedServiceState = async (service) => {
  const [update] = await pool.query(`UPDATE provider_has_services SET ? WHERE provider_has_services_id = ?`, [service, service.provider_has_services_id])
  return update
}

servicesModel.cancelRequest = async (id) => {
  await pool.query("UPDATE requested_services SET state = 'cancelado' WHERE requested_service_id = ?", [id])
  return 'ok'
}


servicesModel.scheduleService = async (scheduleData, registerPaymentData) => {
  let conn = null;
  
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [row] = await pool.query('INSERT INTO scheduled_services SET ?', [scheduleData])
    const [scheduleService] = await pool.query('SELECT * FROM scheduled_services WHERE scheduled_services_id=?', [row.insertId])

    registerPaymentData.scheduled_services_scheduled_services_id = scheduleService[0].scheduled_services_id
    registerPaymentData.created_at = scheduleService[0].created_at

    const [row2] = await conn.query('INSERT INTO payments SET ?;', [registerPaymentData]);
    await conn.commit();
    return scheduleService[0]
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

servicesModel.getServicesBySuperCategoryTitle = async (super_category_title) => {
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, categories.title as 'category_title', categories.description 'category_description', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_category_description', commission FROM services INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE super_categories.title = ?`, [super_category_title]);
  return services
}

servicesModel.getSalesAmounth = async (start, end) => {
  const [salesAmounth] = await pool.query(`SELECT SUM(price) AS 'salesAmounth' FROM scheduled_services WHERE NOT state = 'cancelado' AND date BETWEEN ? AND ?;`, [start, end]);
  return salesAmounth[0]
}

servicesModel.getServicesPermitted = async (provider_id) => {
  const [services] = await pool.query("SELECT services.*, super_categories.title as `super_category` FROM services LEFT JOIN providers_permitted_services ON providers_permitted_services.services_service_id = services.service_id LEFT JOIN categories ON services.categories_category_id = categories.category_id LEFT JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE isBasic = 1 OR providers_permitted_services.services_service_id = services.service_id AND providers_provider_id = ?;", [provider_id]);
  return services
}

servicesModel.getBasicServices = async () => {
  const [basicServices] = await pool.query(`SELECT * FROM services WHERE isBasic = 1`);
  return basicServices
}

servicesModel.getServicesByCategoryId = async (id) => {
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, categories.title as 'category_title', categories.description 'category_description', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_category_description', commission FROM services INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE category_id=?`, [id]);
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
  const [services] = await pool.query(`SELECT provider_has_services.providers_provider_id, scheduled_services.*, services.title, services.description, services.price, services.isBasic, services.img_url, services.categories_category_id, commission FROM scheduled_services INNER JOIN provider_has_services ON scheduled_services.provider_has_services_provider_has_services_id = provider_has_services.provider_has_services_id INNER JOIN services ON provider_has_services.services_service_id = services.service_id WHERE clients_client_id = ? AND services.state NOT 'service canceled by timeout' ORDER BY scheduled_services_id DESC;`, [client_id]);
  for await (let service of services) {
    [provider] = await pool.query(`SELECT providers.provider_id, users.firstname, users.lastname, users.email, users.img_url, users.phone FROM users LEFT JOIN providers ON users.user_id = providers.users_user_id WHERE providers.provider_id = ?;`, service.providers_provider_id);
    service.provider = provider[0];
  }
  return services
}

servicesModel.getProviderServicesByDate = async (provider_id, date) => {
  const [services] = await pool.query(`SELECT provider_has_services.providers_provider_id, scheduled_services.*, services.title, services.description, services.price, services.isBasic, services.img_url, services.categories_category_id, commission FROM scheduled_services INNER JOIN provider_has_services ON scheduled_services.provider_has_services_provider_has_services_id = provider_has_services.provider_has_services_id INNER JOIN services ON provider_has_services.services_service_id = services.service_id WHERE provider_has_services.providers_provider_id = ? AND date BETWEEN ? AND ? ORDER BY scheduled_services_id DESC;`, [provider_id, date + ' 00:00:00', date + ' 23:59:59']);
  for await (let service of services) {
    [client] = await pool.query(`SELECT clients.client_id, users.firstname, users.lastname, users.email, users.img_url, users.phone FROM users LEFT JOIN clients ON users.user_id = clients.users_user_id WHERE clients.client_id = ?;`, service.clients_client_id);
    [address] = await pool.query(`SELECT * FROM addresses WHERE address_id = ?`, service.addresses_address_id);
    service.client = client[0];
    service.address = address[0];
  }
  return services
}

servicesModel.getProviderServicesHistory = async (provider_id, date) => {
  const [services] = await pool.query(`SELECT provider_has_services.providers_provider_id, scheduled_services.*, services.service_id, services.title, services.description, services.price, services.img_url, services.categories_category_id, services.commission FROM scheduled_services INNER JOIN provider_has_services ON scheduled_services.provider_has_services_provider_has_services_id = provider_has_services.provider_has_services_id INNER JOIN services ON provider_has_services.services_service_id = services.service_id WHERE provider_has_services.providers_provider_id = ? AND date <= ? ORDER BY scheduled_services_id DESC;`, [provider_id, date]);
  for await (let service of services) {
    [client] = await pool.query(`SELECT clients.client_id, users.firstname, users.lastname, users.email, users.img_url, users.phone FROM users LEFT JOIN clients ON users.user_id = clients.users_user_id WHERE clients.client_id = ?;`, service.clients_client_id);
    [address] = await pool.query(`SELECT * FROM addresses WHERE address_id = ?`, service.addresses_address_id);
    service.client = client[0];
    service.address = address[0];
  }
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
    superCategories.forEach(async superCategory => {
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
    const [isBasic] = await conn.query('SELECT isBasic FROM services WHERE service_id = ?;', [serviceToProvide.services_service_id]);
    const [canProvide] = await conn.query('SELECT * FROM providers_permitted_services WHERE services_service_id = ?', [serviceToProvide.services_service_id]);
    if (canProvide.length > 0 || isBasic[0].isBasic == 1) {
      const [newServiceProvided] = await conn.query('INSERT INTO provider_has_services SET ?', [serviceToProvide]);
      for await (let location of locationToProvide) {
        location.push(newServiceProvided.insertId)
      }
      await conn.query("INSERT INTO locations (`district`, `region`, `provider_has_services_provider_has_services_id`) VALUES ?", [locationToProvide]);
      // const [newServiceToProvide] = await conn.query('SELECT * FROM provider_has_services WHERE provider_has_services_id=?;', [newServiceProvided.insertId]);
      // const [locations] = await conn.query('SELECT * FROM locations WHERE =?;', [serviceToProvide.providers_provider_id,serviceToProvide.providers_users_user_id,serviceToProvide.services_service_id]);
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
  const [services] = await pool.query(`SELECT service_id, services.title, services.description, price, services.img_url, category_id, categories.title as 'category_title', categories.description 'category_description', super_category_id, super_categories.title as 'super_category_title', super_categories.description as 'super_category_description', commission FROM services INNER JOIN categories ON categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE super_category_id=?`, [id]);
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
  let i = 0;
  const [services] = await pool.query("SELECT services.*, provider_has_services.*, super_categories.title as `super_category` FROM provider_has_services INNER JOIN services ON services.service_id = provider_has_services.services_service_id INNER JOIN categories ON services.categories_category_id = categories.category_id INNER JOIN super_categories ON categories.super_categories_super_category_id = super_categories.super_category_id WHERE providers_provider_id = ?;", [user_id]);
  for await (let service of services) {
    const [locations] = await pool.query('SELECT * FROM locations WHERE provider_has_services_provider_has_services_id = ?;', [service.provider_has_services_id]);
    services[i].locations = locations
    i++
  }

  return services
}

servicesModel.changeOfferedServiceState = async (offeredService) => {
  const [res] = await pool.query('UPDATE provider_has_services SET state = ? WHERE provider_has_services_id = ?', [offeredService.state, offeredService.provider_has_services_id])
  return res
}

servicesModel.rankService = async (data) => {
  const [res] = await pool.query('UPDATE scheduled_services SET scheduled_services.rank = ? WHERE scheduled_services_id = ?', [data.rank, data.scheduled_services_id])
  return res
}

servicesModel.changeScheduleServiceState = async (scheduledService) => {
  
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [res] = await conn.query('UPDATE scheduled_services SET state = ? WHERE scheduled_services_id = ?', [scheduledService.state, scheduledService.scheduled_services_id])
console.log('scheduledService.state:', scheduledService.state)
    let state = null
    switch (scheduledService.state.toLowerCase()) {
      case 'terminado':
        state = 'por pagar'
        break
      case 'cancelado':
        state = 'cancelado'
        break
      case 'agendado':
        state = 'en proceso'
        break
    }
console.log('state:', state)

    if (state) await conn.query('UPDATE payments SET state = ? WHERE scheduled_services_scheduled_services_id = ?', [state, scheduledService.scheduled_services_id])

    await conn.commit();
    return res
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

servicesModel.deleteServicesOfferedByProviderIdAndProviderHasServicesId = async (provider_id, provider_has_services_id) => {
  const [res] = await pool.query('DELETE FROM table_name WHERE provider_id = ? AND provider_has_services_id = ?', [provider_id, provider_has_services_id])
  return res
}

module.exports = servicesModel;