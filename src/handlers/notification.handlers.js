module.exports = (io, socket) => {
  // cuando una notificación es recibida, se envía al usuario
  socket.on('notification', data => {
    console.log('WS: notification: ', data);
    if (data.destination) socket.to('user_id_' + data.destination).broadcast.emit('notification', data);  
  });
}