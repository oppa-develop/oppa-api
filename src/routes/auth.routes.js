const express = require('express');
const router = express.Router();
const authModel = require('../models/auth.model');
const jwt = require('jsonwebtoken');
const helpers = require('../libs/helpers');

router.get('/', (req, res) => {
  res.send(200).json({
    success:true,
    message: 'API works!'
  });
});

/**
 * @swagger
 * /auth/login-client:
 *  post:
 *    tags:
 *    - name: auth
 *    description: To login clients
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: t.client@example.com
 *              password:
 *                type: string
 *                example: test
 *            required:
 *              - email
 *              - password
 *    responses:
 *      '200':
 *        description: Returns the user data.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: true
 *            message:
 *              type: string
 *              example: login successful.
 *            userData:
 *              type: object
 *      '401':
 *        description: Unauthorized.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: false
 *            message:
 *              type: string
 *              example: Wrong credentials.
 */
router.post('/login-client', (req, res) => {
  const {
    email,
    password
  } = req.body;
  const login = {
    email,
    password
  }
  
  authModel.getClientByEmail(login.email)
    .then((userFound) => {
      if(userFound.state == 'active'){
        helpers.matchPassword(login.password, userFound.password)
        .then(async (success) => {
          if(success){
            delete userFound.password;
            const token = jwt.sign({ userFound }, process.env.SECRET);
            userFound.token = token;
            
            res.status(200).json({
              success: true,
              message: 'Loggin success.',
              user: userFound
            });
          }else {
            throw Error('Password wrong.')
          }
        })
        .catch(err => {
          res.status(401).json({
            success: false,
            message: err.message
          });
        });
      } else if (userFound[0].state == 'bloked') {
        throw Error('User blocked by the Administrator.')
      } else {
        throw Error('Unknown error.')
      }
    })
    .catch(err => {
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /auth/login-client/rut:
 *  post:
 *    tags:
 *    - name: auth
 *    description: To login clients
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              rut:
 *                type: string
 *                example: 12.345.678-9
 *              password:
 *                type: string
 *                example: test
 *            required:
 *              - rut
 *              - password
 *    responses:
 *      '200':
 *        description: Returns the user data.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: true
 *            message:
 *              type: string
 *              example: login successful.
 *            userData:
 *              type: object
 *      '401':
 *        description: Unauthorized.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: false
 *            message:
 *              type: string
 *              example: Wrong credentials.
 */
router.post('/login-client/rut', (req, res) => {
  const {
    rut,
    password
  } = req.body;
  const login = {
    rut,
    password
  }
  
  authModel.getClientByRut(login.rut)
    .then((userFound) => {
      if(userFound.state == 'active'){
        helpers.matchPassword(login.password, userFound.password)
        .then(async (success) => {
          if(success){
            delete userFound.password;
            const token = jwt.sign({ userFound }, process.env.SECRET);
            userFound.token = token;
            
            console.log({resDeletePasscode});
            res.status(200).json({
              success: true,
              message: 'Loggin success.',
              user: userFound
            });
          }else {
            throw Error('Password wrong.')
          }
        })
        .catch(err => {
          res.status(401).json({
            success: false,
            message: err.message
          });
        });
      } else if (userFound[0].state == 'bloked') {
        throw Error('User blocked by the Administrator.')
      } else {
        throw Error('Unknown error.')
      }
    })
    .catch(err => {
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /auth/login-provider:
 *  post:
 *    tags:
 *    - name: auth
 *    description: To login providers
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: t.provider@example.com
 *              password:
 *                type: string
 *                example: test
 *            required:
 *              - email
 *              - password
 *    responses:
 *      '200':
 *        description: Returns the user data.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: true
 *            message:
 *              type: string
 *              example: login successful.
 *            userData:
 *              type: object
 *      '401':
 *        description: Unauthorized.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: false
 *            message:
 *              type: string
 *              example: Wrong credentials.
 */
router.post('/login-provider', (req, res) => {
  const {
    email,
    password
  } = req.body;
  const login = {
    email,
    password
  }
  
  authModel.getProviderByEmail(login.email)
    .then((userFound) => {
      if(userFound.state == 'active'){
        helpers.matchPassword(login.password, userFound.password)
        .then(async (success) => {
          if(success){
            delete userFound.password;
            const token = jwt.sign({ userFound }, process.env.SECRET);
            userFound.token = token;
            
            res.status(200).json({
              success: true,
              message: 'Loggin success.',
              user: userFound
            });
          }else {
            throw Error('Password wrong.')
          }
        })
        .catch(err => {
          res.status(401).json({
            success: false,
            message: err.message
          });
        });
      } else if (userFound[0].state == 'bloked') {
        throw Error('User blocked by the Administrator.')
      } else {
        throw Error('Unknown error.')
      }
    })
    .catch(err => {
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /auth/login-admin:
 *  post:
 *    tags:
 *    - name: auth
 *    description: To login admins
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: t.admin@example.com
 *              password:
 *                type: string
 *                example: test
 *            required:
 *              - email
 *              - password
 *    responses:
 *      '200':
 *        description: Returns the user data.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: true
 *            message:
 *              type: string
 *              example: login successful.
 *            userData:
 *              type: object
 *      '401':
 *        description: Unauthorized.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: false
 *            message:
 *              type: string
 *              example: Wrong credentials.
 */
router.post('/login-admin', (req, res) => {
  const {
    email,
    password
  } = req.body;
  const login = {
    email,
    password
  }
  
  authModel.getAdminByEmail(login.email)
    .then((userFound) => {
      if(userFound.state == 'active'){
        helpers.matchPassword(login.password, userFound.password)
        .then(async (success) => {
          if(success){
            delete userFound.password;
            const token = jwt.sign({ userFound }, process.env.SECRET);
            userFound.token = token;
            
            res.status(200).json({
              success: true,
              message: 'Loggin success.',
              user: userFound
            });
          }else {
            throw Error('Password wrong.')
          }
        })
        .catch(err => {
          throw Error('Email or password wrong.')
        });
      } else if (userFound[0].state == 'bloked') {
        throw Error('User blocked by the Administrator.')
      } else {
        throw Error('Unknown error.')
      }
    })
    .catch(err => {
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /auth/recover-account:
 *  post:
 *    tags:
 *    - name: auth
 *    description: To recover an account
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              rut:
 *                type: string
 *                example: 1.123.123-1
 *            required:
 *              - rut
 *    responses:
 *      '200':
 *        description: Send a code to user over email.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: true
 *            message:
 *              type: string
 *              example: Code sent to email ejemplo@correo.cl.
 *            email:
 *              type: string
 *              example: ejemplo@correo.cl.
 */
router.post('/recover-account', (req, res) => {
  const {
    rut
  } = req.body;
  
  authModel.genPassCode(rut)
    .then(([supplicantUser, userFound, code]) => { // supplicantUser = usuario al que se le cambiará la clave; si el elder no tiene email, entonces userFound es el usuario apadrinador, de lo contrario userFound = NULL.
      // enviamos el código al email del usuario y notificamos al front que se le ha enviado el código.

      console.log({supplicantUser});
      const firstname = supplicantUser.firstname;
      const lastName = supplicantUser.lastName;
      const email = supplicantUser.email || userFound.email;
      const contentHTML = `<!doctype html>
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
        xmlns:o="urn:schemas-microsoft-com:office:office">
      
      <head>
        <title></title>
        <!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--<![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style type="text/css">
          #outlook a {
            padding: 0;
          }
      
          body {
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
      
          table,
          td {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
      
          img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
          }
      
          p {
            display: block;
            margin: 13px 0;
          }
        </style>
        <!--[if mso]>
              <noscript>
              <xml>
              <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
              </xml>
              </noscript>
              <![endif]-->
        <!--[if lte mso 11]>
              <style type="text/css">
                .mj-outlook-group-fix { width:100% !important; }
              </style>
              <![endif]-->
        <!--[if !mso]><!-->
        <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
        <style type="text/css">
          @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
        </style>
        <!--<![endif]-->
        <style type="text/css">
          @media only screen and (min-width:480px) {
            .mj-column-per-100 {
              width: 100% !important;
              max-width: 100%;
            }
          }
        </style>
        <style media="screen and (min-width:480px)">
          .moz-text-html .mj-column-per-100 {
            width: 100% !important;
            max-width: 100%;
          }
        </style>
        <style type="text/css">
          @media only screen and (max-width:480px) {
            table.mj-full-width-mobile {
              width: 100% !important;
            }
      
            td.mj-full-width-mobile {
              width: auto !important;
            }
          }
        </style>
      </head>
      
      <body style="word-spacing:normal;background-color:#f5f5f5;">
        <div style="background-color:#f5f5f5;">
          <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#FFFFFF" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
          <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
              style="background:#FFFFFF;background-color:#FFFFFF;width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:0px;text-align:center;">
                    <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                    <div class="mj-column-per-100 mj-outlook-group-fix"
                      style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                        <tbody>
                          <tr>
                            <td style="vertical-align:top;padding:0px;">
                              <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                <tbody>
                                  <tr>
                                    <td align="center" style="font-size:0px;padding:0px;word-break:break-word;">
                                      <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                        style="border-collapse:collapse;border-spacing:0px;">
                                        <tbody>
                                          <tr>
                                            <td style="width:600px;"><img height="auto"
                                                src="https://api.somosoppa.cl/api/public/images/assets/email_background_horizontal_logo.png"
                                                style="position: retalive; margin: 0 auto; background-size: cover; background-position: center; border: 0; display: block; outline: none; text-decoration: none; height: auto; font-size: 13px; width: 100%;"
                                                width="600"></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                  <!-- <mj-image align="center" src="./images/assets/email_background_vertical_logo.png" padding="0px"></mj-image> -->
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <!--[if mso | IE]></td></tr></table><![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" bgcolor="#FFFFFF" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
          <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
              style="background:#FFFFFF;background-color:#FFFFFF;width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:0px;padding-bottom:20px;padding-top:10px;text-align:center;">
                    <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                    <div class="mj-column-per-100 mj-outlook-group-fix"
                      style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                        <tbody>
                          <tr>
                            <td style="vertical-align:top;padding:0px;">
                              <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                <tbody>
                                  <tr>
                                    <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                      <div
                                        style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:20px;line-height:1;text-align:left;color:#1a232f;">
                                        <strong>Estimado cliente Oppa,</strong></div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td align="left" style="font-size:0px;padding:0 25px;word-break:break-word;">
                                      <div
                                        style="font-family:Arial;font-size:18px;line-height:1;text-align:left;color:#000000;">
                                        <br><br>Se ha solicitado reestablecer la contraseña de ${firstname}
                                        ${lastName}.<br><br>Para eso utilice el siguiente código:<br><br></div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td align="center" vertical-align="middle"
                                      style="font-size:0px;padding:20px 0 0 0;word-break:break-word;">
                                      <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                        style="border-collapse:separate;line-height:100%;">
                                        <tr>
                                          <td align="center" bgcolor="#1a232f" role="presentation"
                                            style="border:none;border-radius:3px;cursor:auto;mso-padding-alt:10px 25px;background:#1a232f;"
                                            valign="middle">
                                            <p
                                              style="display:inline-block;background:#1a232f;color:#ffffff;font-family:Arial, sans-serif;font-size:16px;font-weight:bold;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:3px;">
                                              ${code}</p>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td align="left" style="font-size:0px;padding:0 25px;word-break:break-word;">
                                      <div
                                        style="font-family:Arial;font-size:18px;line-height:1;text-align:left;color:#000000;">
                                        <br><br>Si usted no han hecho esta solicitud, puede omitir este mensaje.</div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td align="center"
                                      style="font-size:0px;padding:0 25px;padding-top:40px;word-break:break-word;">
                                      <div
                                        style="font-family:Arial, sans-serif;font-size:14px;line-height:1;text-align:center;color:#000000;">
                                        <hr>
                                        <p>Este mail ha sido generado automáticamente. Por favor no responder.</p>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <!--[if mso | IE]></td></tr></table><![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso | IE]></td></tr></table><![endif]-->
        </div>
      </body>
      
      </html>`

      const transporter = nodemailer.createTransport({
        host: 'mail.somosoppa.cl',
        port: 465,
        secure: false,
        auth: {
          user: 'cuentas@somosoppa.cl',
          pass: '0-TL8sa3~AZM',
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    
      const info = transporter.sendMail({
        from: "Cuentas SomosOppa <cuentas@somosoppa.cl>",
        to: email,
        subject: 'Solicitud de cambio de contraseña en Oppa App.',
        html: contentHTML
      });
    
      info
        .then(() => {
          console.log('Email enviado', info);
          res.status(200).json({
            success: true,
            message: `Code sended to ${userFound ? userFound.email : supplicantUser.email}`,
            email: userFound ? userFound.email : supplicantUser.email
          });
        })
        .catch(err => {
          console.log('Error al enviar email', err);
          throw Error('Error al enviar email.')
        });
    })
    .catch(err => {
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /auth/change-password:
 *  patch:
 *    tags:
 *    - name: auth
 *    description: To change user password
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              rut:
 *                type: string
 *                example: 1.111.111-1
 *              code:
 *                type: string
 *                example: o68e1zvjmz
 *              password:
 *                type: string
 *                example: contraseña
 *            required:
 *              - rut
 *              - code
 *              - password
 *    responses:
 *      '200':
 *        description: Password changed.
 */
router.patch('/change-password', (req, res) => {
  const {
    rut,
    code,
    password
  } = req.body;
  
  authModel.changePassword(rut, code, password)
    .then((response) => {
      if (response) {
        res.status(200).json({
          success: true,
          message: `Password changed successfully.`
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Password not changed.'
        });
      }
    })
    .catch(err => {
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

module.exports = router;