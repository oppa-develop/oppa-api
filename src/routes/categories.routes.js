const express = require('express');
const router = express.Router();
const categoriesModel = require('../models/categories.model');
const path = require('path');
const fs = require('fs');
const verifyRole = require('../libs/verifyRole');

/**
 * @swagger
 * /categories/:
 *  get:
 *    tags:
 *    - name: categories
 *    description: Get all categories
 *    responses:
 *      '200':
 *        description: Returns a list containing all categories.
 */
router.get('/', /* verifyRole.admin, */ (req, res) => {
  categoriesModel.getCategories()
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
 * /categories/{category_id}:
 *  get:
 *    tags:
 *    - name: categories
 *    description: Get category by id.
 *    parameters:
 *    - in: path
 *      name: category_id
 *      schema:
 *        type: integer
 *        example: 1
 *      required: true
 *      description: Numeric ID of the user to get.
 *    responses:
 *      '200':
 *        description: Returns the category for the given id.
 */
router.get('/:category_id', /* verifyRole.admin, */ (req, res) => {
  const { category_id } = req.params;
  console.log(req.params);

  categoriesModel.getCategoryById(category_id)
    .then(category => {
      res.status(200).json({
        success: true,
        message: `Category with id ${category_id}.`,
        category
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
 * /categories/new-super-category:
 *  post:
 *    tags:
 *    - name: categories
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

  categoriesModel.createSuperCategory(superCategory)
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
});

/**
 * @swagger
 * /categories/new-category:
 *  post:
 *    tags:
 *    - name: categories
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

  categoriesModel.createCategory(category)
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
});

module.exports = router;