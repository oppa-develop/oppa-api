const express = require('express');
const router = express.Router();
const recordsModel = require('../models/records.model');

/**
 * @swagger
 * /records/{user_id}:
 *  get:
 *    tags:
 *    - name: records
 *    description: Get records by user_id.
 *    parameters:
 *    - in: path
 *      name: user_id
 *      schema:
 *        type: integer
 *        example: 4
 *      required: true
 *      description: Numeric ID of the user to get.
 *    responses:
 *      '200':
 *        description: Returns the records for the given id.
 *      '404':
 *        description: Error. User not found.
 */
router.get('/:user_id', (req, res) => {
  const {
    user_id
  } = req.params;

  recordsModel.getRecordsByUserId(user_id)
    .then(records => {
      res.status(200).json({
        success: true,
        message: 'Records for the given id.',
        records
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
 * /records/new-record:
 *  post:
 *    tags:
 *    - name: records
 *    description: Create new user's record.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                example: Paracetamol c/8 hrs
 *              description:
 *                type: string
 *                example: Se receta paracetamol cada 8 horas por congestión leve.
 *              icon:
 *                type: string
 *                example: pills
 *              icon_type:
 *                type: string
 *                example: custom-icon
 *              users_user_id:
 *                type: number
 *                example: 1
 *    responses:
 *      '200':
 *        description: Returns the new total amount of credits for the user.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/new-record', async (req, res) => {
  const {
    title,
    description,
    icon,
    icon_type,
    users_user_id
  } = req.body;
  const record = {
    title,
    description,
    icon,
    icon_type,
    users_user_id,
    created_at: new Date()
  }

  console.log(record);

  recordsModel.newRecord(record)
    .then(record => {
      res.status(200).json({
        success: true,
        message: 'Record saved successfully.',
        record
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.code || err.message
      });
    });
});

module.exports = router;