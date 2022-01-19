const pool = require('../libs/database');
let walletsModel = {};
const dayjs = require('dayjs');

walletsModel.getWalletMovements = async (user_id) => {
  const [walletsMovements] = await pool.query('SELECT * FROM wallet_movements WHERE users_user_id = ? ORDER BY created_at DESC;', [user_id]);
  return walletsMovements
}

walletsModel.updateCredits = async (movement) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [beforeWallet] = await conn.query('SELECT total FROM wallet_movements WHERE users_user_id = ? ORDER BY wallet_movements_id DESC LIMIT 1', [movement.users_user_id]);
    movement.total = movement.type == 'ingreso' ? parseInt((beforeWallet[0]?.total || 0)) + parseInt(movement.amount) : parseInt((beforeWallet[0]?.total || 0)) - movement.amount;

    // lanzamos un error si el movimiento fuera a dejar el monedero en negativo
    if (movement.total < 0) throw Error("There isn't enough money to do this operation");

    // realizamos el movimiento en el monedero
    await conn.query('INSERT INTO wallet_movements SET ?;', [movement]);

    // seleccionamos el nuevo total del monedero
    const [credit] = await conn.query('SELECT total FROM wallet_movements WHERE users_user_id = ? ORDER BY wallet_movements_id DESC LIMIT 1', [movement.users_user_id]);

    await conn.commit();
    return credit[0]
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

walletsModel.scheduleService = async (scheduleServiceData) => {
  scheduleServiceData.start = dayjs(scheduleServiceData.start).format('HH:mm')
  const [scheduled_services] = await conn.query('INSERT INTO scheduled_services SET ?;', [scheduleServiceData]);
  scheduleService = scheduled_services
}

module.exports = walletsModel;