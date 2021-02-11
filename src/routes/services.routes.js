const express = require('express');
const router = express.Router();
const servicesModel = require('../models/services.model');
const path = require('path');
const fs = require('fs');
const { body } = require('express-validator');

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
 * /services/categories:
 *  get:
 *    tags:
 *    - name: services
 *    description: Get all categories
 *    responses:
 *      '200':
 *        description: Returns a list containing all categories.
 */
router.get('/categories', /* verifyRole.admin, */ (req, res) => {
  servicesModel.getServicesCategories()
    .then(categories => {
      res.status(200).json({
        success: true,
        message: 'all categories.',
        categories
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
 *    description: Get all super categories
 *    responses:
 *      '200':
 *        description: Returns a list containing all super categories.
 */
router.get('/super-categories', /* verifyRole.admin, */ (req, res) => {
  servicesModel.getServicesSuperCategories()
    .then(superCategories => {
      res.status(200).json({
        success: true,
        message: 'all super categories.',
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
})

/**
 * @swagger
 * /services/new-super-category:
 *  post:
 *    tags:
 *    - name: services
 *    description: Create a new super category
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                example: Servicio de Acompañamiento
 *              description:
 *                type: string
 *                example: Servicios que se realizan en una locación diferente al domicilio del usuario
 *    responses:
 *      '200':
 *        description: Returns the new super category.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/new-super-category', async (req, res) => {
  const {
    title,
    description
  } = req.body
  const superCategory = {
    title,
    description
  }

  servicesModel.createSuperCategory(superCategory)
    .then(newSuperCategory => {
      res.status(200).json({
        success: true,
        message: 'Super category created successfully.',
        newSuperCategory
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.code || err.message
      });
    });
})

/**
 * @swagger
 * /services/new-category:
 *  post:
 *    tags:
 *    - name: services
 *    description: Create a new category
 *    requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                example: Peluquería
 *              description:
 *                type: string
 *                example: Servicios que incluyen el corte, lavado, painado, etc. del cabello
 *              super_categories_super_category_id:
 *                type: number
 *                example: 1
 *              image:
 *                type: string
 *                format: binary
 *    responses:
 *      '200':
 *        description: Returns the new super category.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/new-category', async (req, res) => {
  const {
    title,
    description,
    super_categories_super_category_id
  } = req.body
  const categoryImage = req.file
  const category = {
    title,
    description,
    super_categories_super_category_id,
    created_at: new Date()
  }

  servicesModel.createCategory(category)
    .then(newCategory => {
      
      /* servicesModel.createCategory(newCategory.insertId)
        .then(newCategory => {
          res.status(200).json({
            success: true,
            message: 'Category created successfully.',
            newCategory
          });
        })
        .catch(err => {
          throw err
        }) */
      res.status(200).json({
        success: true,
        message: 'Category created successfully.',
        newCategory
      });
    })
    .catch(err => {

      // borramos la imagen de la categoria
      try {
        fs.unlinkSync(path.join(__dirname, `../public/images/${categoryImage.filename}`))
      } catch(err) {
        console.error(err)
      }

      console.log(err);
      res.status(500).json({
        success: false,
        message: err.code || err.message
      });
    });
})

module.exports = router;