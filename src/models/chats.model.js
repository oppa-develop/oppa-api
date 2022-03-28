const pool = require('../libs/database');
let chatsModel = {};

chatsModel.createChat = async (newChat, users_ids) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    console.log(conn.format('INSERT INTO chats SET ?', [newChat]))
    const [chat] = await conn.query('INSERT INTO chats SET ?', [newChat])
    let new_user_has_chat = []
    for await (let id of users_ids) {
      new_user_has_chat.push([
        id,
        chat.insertId
      ])
    }
    console.log(conn.format('INSERT INTO users_has_chats (users_user_id, chats_chat_id) VALUES ?', [new_user_has_chat]), { new_user_has_chat });
    await conn.query('INSERT INTO users_has_chats (users_user_id, chats_chat_id) VALUES ?', [new_user_has_chat])
    await conn.commit();
    return chat
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

chatsModel.getChatsByUserId = async (user_id) => {
  const [chats] = await pool.query("SELECT chats.* FROM chats INNER JOIN users_has_chats ON users_has_chats.chats_chat_id = chats.chat_id WHERE users_user_id = ? ORDER BY chats.created_at desc;", [user_id]);
  /* const [last_msg] = await pool.query("SELECT * FROM messages WHERE chats_chat_id = ? ORDER BY message_id DESC LIMIT 1", [chats[0].chat_id]);
  chats.last_msg = last_msg[0]
  console.log(chats); */

  for await (let chat of chats) {
    const [last_msg] = await pool.query("SELECT * FROM messages WHERE chats_chat_id = ? ORDER BY message_id DESC LIMIT 1", [chat.chat_id]);
    chat.last_msg = last_msg[0]
  }
  return chats
}

chatsModel.getMessagesByChatId = async (chat_id) => {
  const [rows] = await pool.query("SELECT message_id, text, url, type, messages.created_at, chats_chat_id, users_user_id, firstname, lastname FROM messages INNER JOIN users ON messages.users_user_id = users.user_id WHERE chats_chat_id = ? ORDER BY messages.created_at ASC;", [chat_id]);
  return rows
}

chatsModel.saveMessage = async (message) => {
  await pool.query("INSERT INTO messages SET ?", [message]);
  const [chatUsers] = await pool.query("SELECT * FROM users_has_chats WHERE chats_chat_id = ? AND users_user_id != ?;", [message.chats_chat_id, message.users_user_id])
  return chatUsers
}

chatsModel.changeStateToInactiveByScheduledServicesId = async (scheduled_services_id) =>{
  await pool.query("UPDATE chats INNER JOIN scheduled_services ON chats.scheduled_services_scheduled_services_id=scheduled_services.scheduled_services_id INNER JOIN users ON users.user_id=scheduled_services.clients_users_user_id SET chats.state = 'inactive' WHERE scheduled_services.scheduled_services_id = ?;",[scheduled_services_id]);
}

module.exports = chatsModel;