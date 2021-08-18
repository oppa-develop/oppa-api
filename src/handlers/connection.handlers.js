module.exports = (io, socket) => {
  console.log('WS: User connected:', socket.handshake.query.firstname, socket.handshake.query.lastname);

  // agregamos al usuario a una sala de notificaciones
  socket.join('user_id_' + socket.handshake.query.user_id);

  // acciones al desconectar
  socket.on('disconnect', () => {
    console.log('WS: User disconnected:', socket.handshake.query.firstname, socket.handshake.query.lastname);
  });
}