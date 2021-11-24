const pool = require('../libs/database');
let usersModel = {};

usersModel.getUsers = async () => {
  const [users] = await pool.query('SELECT admin_id, client_id, provider_id, users.*, (SELECT total FROM wallet_movements WHERE users_user_id = users.user_id ORDER BY wallet_movements.created_at DESC LIMIT 1) as credit FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id;');
  return users
}

usersModel.getClients = async () => {
  const [clients] = await pool.query("SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE client_id != 'null';");
  return clients
}
usersModel.getCreditByUserId = async (user_id) => {
  const [credit] = await pool.query('SELECT total FROM wallet_movements WHERE users_user_id = ? ORDER BY wallet_movements_id DESC LIMIT 1', [user_id]);
  return credit[0]?.total || 0
}

usersModel.getProviders = async () => {
  const [providers] = await pool.query("SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE provider_id != 'null';");
  return providers
}

usersModel.getUserById = async (id) => {
  const [user] = await pool.query('SELECT * FROM users WHERE user_id=?;', [id]);
  return user
}

usersModel.getQuanitityOfClients = async (start, end) => {
  const [clientsQuantity] = await pool.query(`SELECT COUNT(*) as 'quantity' FROM clients WHERE created_at BETWEEN ? AND ?;`, [start, end]);
  const [clientsTotal] = await pool.query(`SELECT COUNT(*) as 'total' FROM clients`);
  return {
    quantity: clientsQuantity[0]?.quantity || 0,
    total: clientsTotal[0]?.total || 0
  }
}

usersModel.getQuanitityOfAdmins = async (start, end) => {
  const [adminsQuantity] = await pool.query(`SELECT COUNT(*) as 'quantity' FROM admins WHERE created_at BETWEEN ? AND ?;`, [start, end]);
  const [adminsTotal] = await pool.query(`SELECT COUNT(*) as 'total' FROM clients`);
  return {
    quantity: adminsQuantity[0]?.quantity || 0,
    total: adminsTotal[0]?.total || 0
  }
}

usersModel.getQuanitityOfProviders = async (start, end) => {
  const [providersQuantity] = await pool.query(`SELECT COUNT(*) as 'quantity' FROM providers WHERE created_at BETWEEN ? AND ?;`, [start, end]);
  const [providersTotal] = await pool.query(`SELECT COUNT(*) as 'total' FROM clients`);
  return {
    quantity: providersQuantity[0]?.quantity || 0,
    total: providersTotal[0]?.total || 0
  }
}

usersModel.addSenior = async (addData) => {
  let conn = null;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.query('INSERT INTO clients_has_clients SET ?;', [addData]);
    const [clientSeniors] = await conn.query('SELECT users.* FROM clients_has_clients INNER JOIN clients ON clients.client_id = senior_client_id INNER JOIN users ON users_user_id = users.user_id WHERE user_client_id = ?;', [addData.user_client_id])
    await conn.commit();
    return clientSeniors
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

usersModel.getUserSeniors = async (user_client_id) => {
  const [clientSeniors] = await pool.query('SELECT users.* FROM clients_has_clients INNER JOIN clients ON clients.client_id = senior_client_id INNER JOIN users ON users_user_id = users.user_id WHERE user_client_id = ?;', [user_client_id])
  return clientSeniors
}

usersModel.checkDuplicates = async (rut, email) => {
  let conn = null
  try {
    conn = await pool.getConnection()
    const [dupEntry] = await conn.query("SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE rut=? OR email=?;", [
      [rut],
      [email]
    ]);
    return dupEntry
  } catch (error) {
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

usersModel.checkIsElder = async (client_id) => {
  let conn = null
  try {
    conn = await pool.getConnection()
    const [elder] = await conn.query('SELECT * FROM clients_has_clients WHERE senior_client_id', [client_id]);
    return elder
  } catch (error) {
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

usersModel.createElder = async (newUser, user_client_id) => {
  let conn = null;

  // verificamos que el usuario no exista previamente en la bdd
  await usersModel.checkDuplicates(newUser.rut, newUser.email)
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [userData] = await conn.query("INSERT INTO users SET ?", [newUser]);
    const [clientData] = await conn.query("INSERT INTO clients SET ?", [{
      users_user_id: userData.insertId
    }]);
    await conn.query("INSERT INTO clients_has_clients SET ?", [{
      user_client_id: user_client_id,
      senior_client_id: clientData.insertId,
      created_at: newUser.created_at
    }]);
    const [finalUserData] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE user_id=?;', [userData.insertId])
    await conn.commit();
    return finalUserData[0]
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

usersModel.createClient = async (newUser) => {
  let conn = null;

  // verificamos que el usuario no exista previamente en la bdd
  const [dupEntry] = await usersModel.checkDuplicates(newUser.rut, newUser.email)

  if (dupEntry && !dupEntry?.client_id) { // si el usuario ya existe y no es un cliente, lo asignamos como cliente
    // create client id
    conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.query("INSERT INTO clients SET ?", [{
      users_user_id: dupEntry.user_id
    }]);
    const [finalUserData] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE user_id=?;', [dupEntry.user_id])
    await conn.commit();
    return finalUserData[0]
  } else if (dupEntry && dupEntry?.client_id) { // si el usuario ya existe, denegamos la creación de un nuevo cliente
    throw new Error('Elders can not have another role')
  } else { // si el usuario no existe, lo creamos
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();
      const [userData] = await conn.query("INSERT INTO users SET ?", [newUser]);
      await conn.query("INSERT INTO clients SET ?", [{
        users_user_id: userData.insertId
      }]);
      const [finalUserData] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE user_id=?;', [userData.insertId])
      await conn.commit();
      return finalUserData[0]
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) await conn.release();
    }
  }
}

usersModel.createProvider = async (newUser) => {
  let conn = null;

  // verificamos que el usuario no exista previamente en la bdd
  const [dupEntry] = await usersModel.checkDuplicates(newUser.rut, newUser.email)
  // verificamos que el usuario no sea elder
  const elder = await usersModel.checkIsElder(dupEntry?.client_id)

  if (dupEntry?.email && elder.length === 0) { // si el usuario ya existe y no es un elder, lo asignamos como proveedor
    // create provider id
    conn = await pool.getConnection();
    await conn.beginTransaction();

    await conn.query("INSERT INTO providers SET ?", [{users_user_id: dupEntry.user_id}]);
    const [finalUserData] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE user_id=?;', [dupEntry.user_id])
    await conn.commit(); 

    return finalUserData[0]
  } else if (elder.length) { // si el usuario ya existe y es un elder, denegamos la creación de un nuevo proveedor
    throw new Error('Elders can not have another role')
  } else { // si el usuario no existe, lo creamos
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();
      const [userData] = await conn.query("INSERT INTO users SET ?", [newUser]);
      await conn.query("INSERT INTO providers SET ?", [{
        users_user_id: userData.insertId
      }]);
      const [finalUserData] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE user_id=?;', [userData.insertId])
      await conn.commit();
      return finalUserData[0]
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) await conn.release();
    }
  }
}

usersModel.createAdmin = async (newUser) => {
  let conn = null;

  // verificamos que el usuario no exista previamente en la bdd
  const [dupEntry] = await usersModel.checkDuplicates(newUser.rut, newUser.email)
  if (dupEntry?.length > 1) {
    throw new Error('The new userData is duplicate')
  } else if (dupEntry?.length === 1 && dupEntry.email) {
    // create admin id
    conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.query("INSERT INTO admins SET ?", [{
      users_user_id: dupEntry[0].user_id
    }]);
    const [finalUserData] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE user_id=?;', [dupEntry[0].user_id])
    await conn.commit();
    return finalUserData[0]
  } else if (dupEntry?.length === 1 && !dupEntry.email) {
    throw new Error('Elders can not have another role')
  } else {
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();
      const [userData] = await conn.query("INSERT INTO users SET ?", [newUser]);
      await conn.query("INSERT INTO admins SET ?", [{
        users_user_id: userData.insertId
      }]);
      const [finalUserData] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE user_id=?;', [userData.insertId])
      await conn.commit();
      return finalUserData[0]
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) await conn.release();
    }
  }
}

usersModel.editUser = async (userData) => {
  if (userData.img_url === null) {
    await pool.query("UPDATE users SET firstname = ?, lastname = ?, gender = ?, birthdate = ?, updated_at = ? WHERE user_id = ?", [userData.firstname, userData.lastname, userData.gender, userData.birthdate, userData.updated_at, userData.user_id]);
  } else {
    await pool.query("UPDATE users SET firstname = ?, lastname = ?, gender = ?, birthdate = ?, updated_at = ?, img_url = ? WHERE user_id = ?", [userData.firstname, userData.lastname, userData.gender, userData.birthdate, userData.updated_at, userData.img_url, userData.user_id]);
  }

  const [newUserData] = await pool.query('SELECT admin_id, client_id, provider_id, users.*, (SELECT total FROM wallet_movements WHERE users_user_id = users.user_id ORDER BY wallet_movements.created_at DESC LIMIT 1) as credit FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE user_id = ?;', [userData.user_id])
  return newUserData[0]
}

module.exports = usersModel;