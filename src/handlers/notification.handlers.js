module.exports = (io, socket) => {
  // cuando una notificación es recibida, se envía al usuario
  socket.on('notification', data => {
    console.log({ type: data.type, emitter: data.emitter, destination: data.destination, state: data.state });
    if (data.destination) socket.to('user_id_' + data.destination).broadcast.emit('notification', data);
  });
}