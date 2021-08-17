const chatsModel = require('../models/chats.model');

module.exports = (io, socket) => {
  // se le asigna un chat según el data.chat
  socket.on('connectToChat', data => {
    console.log('WS: Connecting user to chat:', data.chat);
    if (data.chat) socket.join(data.chat)
  });

  // cuando un mensaje es recibido, se guarda el mensaje en la bdd
  socket.on('message', data => {
    console.log('WS: Message:', data);
    chatsModel.saveMessage({
        text: data.text,
        url: data.url,
        type: data.type,
        created_at: data.created_at,
        chats_chat_id: data.chats_chat_id,
        users_user_id: data.users_user_id
      })
      .then(async (chatUsers) => {
        // si se guarda correctamente, el mensaje también se envía por websockets
        socket.to(data.chats_chat_id).broadcast.emit('message', data);
        // notificamos al usuario del nuevo mensaje
        data.type = 'message'
        for await (let chatUser of chatUsers) {
          socket.to(chatUser.users_user_id).emit('notificateClient', data)
        }
      })
      .catch(err => {
        console.log('WS:', err);
      })
  });
}