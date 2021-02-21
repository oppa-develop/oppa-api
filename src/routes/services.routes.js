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
 * /services/super-category/{super_category_title}:
 *  get:
 *    tags:
 *    - name: services
 *    description: Get all services for the given super_category_title
 *    parameters:
 *    - in: path
 *      name: super_category_title
 *      schema:
 *        type: string
 *        example: Servicio a Domicilio
 *      description: Title of the category to get.
 *    responses:
 *      '200':
 *        description: Returns the services for the given super_category_title.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/super-category/:super_category_title', /* verifyRole.admin, */ (req, res) => {
  const { super_category_title } = req.params;

  servicesModel.getServicesBySuperCategoryTitle(super_category_title)
    .then(services => {
      res.status(200).json({
        success: true,
        message: `services for the super category = ${super_category_title}.`,
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
 * /services/super-category/{super_category_id}:
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
router.get('/super-category/:super_category_id', /* verifyRole.admin, */ (req, res) => {
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
 * /services/super-categories:
 *  get:
 *    tags:
 *    - name: services
 *    description: Get 5 services for all the super categories
 *    responses:
 *      '200':
 *        description: Returns 5 services for all the super categories.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/super-categories', /* verifyRole.admin, */ (req, res) => {

  servicesModel.getSuperCategoriesBestServices()
    .then(superCategories => {
      res.status(200).json({
        success: true,
        message: `Super categories with their services.`,
        superCategories
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
    isBasic: isBasic ? 1:0,
    img_url: `api/public/images/${serviceImage.filename}`,
    created_at: new Date()
  }

  servicesModel.createService(service)
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
      let errMessage, errHttpCode;
      switch(err.code) {
        case 'ER_NO_REFERENCED_ROW_2':
          errHttpCode = 400;
          errMessage = 'The categories_category_id probably does not exist.'
        break
        default:
          errHttpCode = 500;
          errMessage = err.code || err.message
        break
      }
      res.status(errHttpCode).json({
        success: false,
        message: errMessage
      })
    });
});

/**
 * @swagger
 * /services/give-permission:
 *  post:
 *    tags:
 *    - name: services
 *    description: Give a provider permission to offer a service.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              provider_id:
 *                type: integer
 *                example: 1
 *              user_id:
 *                type: integer
 *                example: 1
 *              services:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    service_id:
 *                      type: integer
 *                      example: 1
 *                    category_id:
 *                      type: integer
 *                      example: 1
 *    responses:
 *      '200':
 *        description: Returns a list of services allowed for this provider
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/give-permission', /* verifyRole.admin, */ async (req, res) => {
  const {
    service_id,
    category_id,
    provider_id,
    user_id
  } = req.body
  const service = {
    services_service_id: service_id,
    services_categories_category_id: category_id,
    providers_provider_id: provider_id,
    providers_users_user_id: user_id,
    created_at: new Date()
  } 

  servicesModel.givePermission(service)
    .then(newServicePermitted => {
      res.status(200).json({
        success: true,
        message: 'Service permited successfully',
        newServicePermitted
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.code || err.message
      })
    });
});

/**
 * @swagger
 * /services/provide-service:
 *  post:
 *    tags:
 *    - name: services
 *    description: To offer a service.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              provider_id:
 *                type: integer
 *                example: 1
 *              user_id:
 *                type: integer
 *                example: 1
 *              service_id:
 *                type: integer
 *                example: 1
 *              workable:
 *                type: string
 *                example: lmxjvsd
 *              state:
 *                type: string
 *                example: active
 *              gender:
 *                type: string
 *                example: female
 *              start:
 *                type: string
 *                example: "09:00:00"
 *              end:
 *                type: string
 *                example: "18:00:00"
 *              districts:
 *                type: array
 *                items:
 *                  type: string
 *              region:
 *                type: string
 *                example: "Región Metropolitana"
 *    responses:
 *      '200':
 *        description: Returns the new service provided
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/provide-service', /* verifyRole.admin, */ async (req, res) => {
  const {
    provider_id,
    user_id,
    service_id,
    workable,
    state,
    gender,
    start,
    end,
    districts,
    region
  } = req.body
  const serviceToProvide = {
    providers_provider_id: provider_id,
    providers_users_user_id: user_id,
    services_service_id: service_id,
    workable,
    state,
    gender,
    start,
    end,
    created_at: new Date()
  }
  const locationToProvide = [];

  districts.forEach(district => {
    locationToProvide.push([
      district,
      region,
      provider_id,
      user_id,
      service_id
    ]);
  });

  servicesModel.provideService(serviceToProvide, locationToProvide)
    .then(newServicePermitted => {
      res.status(200).json({
        success: true,
        message: 'Service created successfully',
        newServicePermitted
      });
    })
    .catch(err => {
      console.log(err.sqlMessage)
      res.status(500).json({
        success: false,
        message: err.code || err.message
      });
    });
});



module.exports = router;