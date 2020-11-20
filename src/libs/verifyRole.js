const jwt = require('jsonwebtoken');
let verifyRole = {};

verifyRole.admin = function (req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined'){
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken
    
    let userData = jwt.verify(bearerToken, process.env.SECRET).userFound[0];
    req.requester_id = userData.user_id;
    req.requester_role = userData.role;
    if(userData.role == 'admin'){
      next();
    }else {
      res.status(403).json({
        success: false,
        message: 'Route access denied.'
      });
    }
  } else {
    res.status(403).json({
      success: false,
      message: 'Route access denied.'
    });
  }
}