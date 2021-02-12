const express = require('express');
const router = express.Router();
const servicesModel = require('../models/services.model');
const path = require('path');
const fs = require('fs');
const verifyRole = require('../libs/verifyRole');

/**
 * @swagger
 * /services/:
 *  get:
 *    tags:
 *    - name: services
 *    description: Get all services
 *    responses:
 *      '200':
 *        description: Returns a list containing all services.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/', /* verifyRole.admin, */ (req, res) => {
  servicesModel.getServices()
    .then(services => {
      res.status(200).json({
        success: true,
        message: 'all services.',
        services
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
 * /services/basics:
 *  get:
 *    tags:
 *    - name: services
 *    description: Get all basic services
 *    responses:
 *      '200':
 *        description: Returns a list containing all basic services.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/basics', /* verifyRole.admin, */ (req, res) => {
  servicesModel.getBasicServices()
    .then(basicServices => {
      res.status(200).json({
        success: true,
        message: 'all basic services.',
        basicServices
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
 * /services/category/{category_id}:
 *  get:
 *    tags:
 *    - name: services
 *    description: Get all services for the given category_id
 *    parameters:
 *    - in: path
 *      name: category_id
 *      schema:
 *        type: integer
 *        example: 1
 *      description: Numeric ID of the category to get.
 *    responses:
 *      '200':
 *        description: Returns the services for the given category_id.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/category/:category_id', /* verifyRole.admin, */ (req, res) => {
  const { category_id } = req.params;

  servicesModel.getServicesByCategoryId(category_id)
    .then(services => {
      res.status(200).json({
        success: true,
        message: `services for the category_id = ${category_id}.`,
        services
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
 * /services/super_category/{super_category_id}:
 *  get:
 *    tags:
 *    - name: services
 *    description: Get all services for the given super_category_id
 *    parameters:
 *    - in: path
 *      name: super_category_id
 *      schema:
 *        type: integer
 *        example: 1
 *      description: Numeric ID of the category to get.
 *    responses:
 *      '200':
 *        description: Returns the services for the given super_category_id.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/super_category/:super_category_id', /* verifyRole.admin, */ (req, res) => {
  const { super_category_id } = req.params;

  servicesModel.getServicesBySuperCategoryId(super_category_id)
    .then(services => {
      res.status(200).json({
        success: true,
        message: `services for the super_category_id = ${super_category_id}.`,
        services
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
 * /services/{id}:
 *  get:
 *    tags:
 *    - name: services
 *    description: Get service by id.
 *    parameters:
 *    - in: path
 *      name: service_id
 *      schema:
 *        type: integer
 *      required: true
 *      description: Numeric ID of the service to get.
 *    responses:
 *      '200':
 *        description: Returns the service for the given id.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/:id', /* verifyRole.admin, */ (req, res) => {
  const { id } = req.params;

  servicesModel.getServicesById(id)
    .then(service => {
      res.status(200).json({
        success: true,
        message: `Service with id ${service[0].service_id}.`,
        service: service[0]
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
 * /services/new-service:
 *  post:
 *    tags:
 *    - name: services
 *    description: Create a new service
 *    requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                example: Corte de pelo
 *              description:
 *                type: string
 *                example: Un corte de cabello describe el acortamiento o la modificación del tipo de peinado del cabello 
 *              price:
 *                type: number
 *                example: 9990
 *              categories_category_id:
 *                type: number
 *                example: 1
 *              isBasic:
 *                type: boolean
 *                example: true
 *              image:
 *                type: string
 *                format: binary
 *    responses:
 *      '200':
 *        description: Returns the new service
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/new-service', /* verifyRole.admin, */ async (req, res) => {
  const {
    title,
    description,
    price,
    categories_category_id,
    isBasic
  } = req.body
  const serviceImage = req.file
  const service = {
    title,
    description,
    price,
    categories_category_id,
    img_url: `api/public/images/${serviceImage.filename}`,
    created_at: new Date()
  }

  servicesModel.createService(service, isBasic)
    .then(newService => {
      res.status(200).json({
        success: true,
        message: 'Service created successfully',
        newService
      });
    })
    .catch(err => {

      // borramos la imagen del servicio
      try {
        fs.unlinkSync(path.join(__dirname, `../public/images/${serviceImage.filename}`))
      } catch(err) {
        console.error(err)
      }
      res.status(500).json({
        success: false,
        message: err.code || err.message
      })
    });
});



module.exports = router;