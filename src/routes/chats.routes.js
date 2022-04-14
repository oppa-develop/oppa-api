const express = require('express');
const router = express.Router();
const chatsModel = require('../models/chats.model');

/**
 * @swagger
 * /chats/{user_id}:
 *  get:
 *    tags:
 *    - name: chats
 *    description: Get all chats
 *    parameters:
 *    - in: path
 *      name: user_id
 *      schema:
 *        type: integer
 *        example: 1
 *    responses:
 *      '200':
 *        description: Returns a list containing all chats.
 */
 router.get('/:user_id', /* verifyRole.admin, */ (req, res) => {
  const { user_id } = req.params;

  chatsModel.getChatsByUserId(user_id)
    .then(chats => {
      res.status(200).json({
        success: true,
        message: 'all chats.',
        chats
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /chats/{chat_id}/messages:
 *  get:
 *    tags:
 *    - name: chats
 *    description: Get all messages for the given chat_id
 *    parameters:
 *    - in: path
 *      name: chat_id
 *      schema:
 *        type: integer
 *        example: 1
 *    responses:
 *      '200':
 *        description: Returns a list containing all messages for the given chat_id.
 */
 router.get('/:chat_id/messages', /* verifyRole.admin, */ (req, res) => {
  const { chat_id } = req.params;

  chatsModel.getMessagesByChatId(chat_id)
    .then(chatMessages => {
      res.status(200).json({
        success: true,
        message: 'all chats.',
        chatMessages
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /chats/update-to-inactive-chat-by-scheduled-service-id/{scheduled_services_id}:
 *  patch:
 *    tags:
 *    - name: chats
 *    description: Update chat's state to inactive for the given scheduled_services_id
 *    parameters:
 *    - in: path
 *      name: scheduled_services_id
 *      schema:
 *        type: integer
 *        example: 1
 *    responses:
 *      '200':
 *        description: Update chat's state to inactive for the given scheduled_services_id.
 */

router.patch('/update-to-inactive-chat-by-scheduled-service-id/:scheduled_services_id', async (req,res) => {

const {scheduled_services_id} = req.params

  chatsModel.changeStateToInactiveByScheduledServicesId(scheduled_services_id)
      .then(state => {
        res.status(200).json({
          success: true,
          message: 'state updated to inactive.',
          state
        });
      })
      .catch(err => {
        res.status(500).json({
          success: false,
          message: err.message
        });
      });
})

/**
 * @swagger
 * /chats/new-chat:
 *  post:
 *    tags:
 *    - name: chats
 *    description: Create a new chats
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              users_ids:
 *                type: array
 *              receptor_img_url:
 *                type: string
 *              provider_img_url:
 *                type: string
 *              receptor_name:
 *                type: string
 *                example: 'Juan Ramirez'
 *              provider_name:
 *                type: string
 *                example: 'Carla Jara'
 *              title:
 *                type: string
 *                example: 'Corte de Pelo'
 *    responses:
 *      '200':
 *        description: Returns the new chat.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/new-chat', async (req, res) => {
  const {
    users_ids,
    receptor_img_url,
    provider_img_url,
    receptor_name,
    provider_name,
    title,
    scheduled_services_scheduled_services_id,
  } = req.body
  const newChat = {
    receptor_img_url,
    provider_img_url,
    receptor_name,
    provider_name,
    title,
    scheduled_services_scheduled_services_id,
    created_at: new Date(),
    state: 'active'
  }

  chatsModel.createChat(newChat, users_ids)
    .then(newChat => {
      res.status(200).json({
        success: true,
        message: 'Chat created successfully.',
        newChat
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        success: false,
        message: err.code || err.message
      });
    });
});



module.exports = router;