const express = require('express');
const router = express.Router();
const superCategoriesModel = require('../models/super-categories.model');
const path = require('path');
const fs = require('fs');
const verifyRole = require('../libs/verifyRole');

/**
 * @swagger
 * /superCategories/:
 *  get:
 *    tags:
 *    - name: superCategories
 *    description: Get all categories
 *    responses:
 *      '200':
 *        description: Returns a list containing all categories.
 */
router.get('/', /* verifyRole.admin, */ (req, res) => {
  superCategoriesModel.getSuperCategories()
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
 * /superCategories/{super_category_id}:
 *  get:
 *    tags:
 *    - name: superCategories
 *    description: Get super category by id.
 *    parameters:
 *    - in: path
 *      name: super_category_id
 *      schema:
 *        type: integer
 *        example: 1
 *      required: true
 *      description: Numeric ID of the user to get.
 *    responses:
 *      '200':
 *        description: Returns the super category for the given id.
 */
router.get('/:super_category_id', /* verifyRole.admin, */ (req, res) => {
  const { super_category_id } = req.params;
  console.log(req.params);

  superCategoriesModel.getSuperCategoryById(super_category_id)
    .then(superCategory => {
      res.status(200).json({
        success: true,
        message: `Super category with id ${super_category_id}.`,
        superCategory
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
 * /superCategories/new-super-category:
 *  post:
 *    tags:
 *    - name: superCategories
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

  superCategoriesModel.createSuperCategory(superCategory)
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

module.exports = router;