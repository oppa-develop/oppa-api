const express = require('express');
const router = express.Router();
const servicesModel = require('../models/services.model');
const path = require('path');
const fs = require('fs');
const verifyRole = require('../libs/verifyRole');
const multer = require('multer');
const dayjs = require('dayjs');

const storage = multer.diskStorage({
  destination: path.join(__dirname, `../public/images/services`),
  fileFilter: (req, file, callback) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimetype && extname) callback(null, true)
    callback('Error: File not valid.')
  },
  filename: (req, file, callback) => {
    /**
     * el req de multer solo muestra los datos que vengan ANTES de la imagen,
     * por lo que es recomendable mandar la imagen al final del JSON
     */
    console.log('services', {req});
    callback(null, req.body.title.replace(/ /g, '_') + path.extname(file.originalname).toLowerCase());
  }
});

const upload = multer({ 
  storage
}).single('image')

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
 * /services/history/client/{client_id}:
 *  get:
 *    tags:
 *    - name: services
 *    description: Get all services that the client has schedule
 *    parameters:
 *    - in: path
 *      name: client_id
 *      schema:
 *        type: integer
 *        example: 1
 *      description: Numeric ID of the client to get services history.
 *    responses:
 *      '200':
 *        description: Returns a list containing all services.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/history/client/:client_id', /* verifyRole.admin, */ (req, res) => {
  const { client_id } = req.params;

  servicesModel.getServicesHistory(client_id)
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
 * /services/history/provider/{provider_id}:
 *  get:
 *    tags:
 *    - name: services
 *    description: Get all services that the provider has schedule
 *    parameters:
 *    - in: path
 *      name: provider_id
 *      schema:
 *        type: integer
 *        example: 1
 *      description: Numeric ID of the provider to get services history.
 *    responses:
 *      '200':
 *        description: Returns a list containing all services.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/history/provider/:provider_id', /* verifyRole.admin, */ (req, res) => {
  const { provider_id } = req.params;

  servicesModel.getProviderServicesHistory(provider_id)
    .then(services => {
      res.status(200).json({
        success: true,
        message: `all services for the provider ${provider_id}`,
        services
      });
    })
    .catch(err => {
      console.log(err);
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
router.get('/super-category/title/:super_category_title', /* verifyRole.admin, */ (req, res) => {
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
router.get('/super-category/id/:super_category_id', /* verifyRole.admin, */ (req, res) => {
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
 * /services/{service_id}:
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
router.get('/:service_id', /* verifyRole.admin, */ (req, res) => {
  const { service_id } = req.params;

  servicesModel.getServicesById(service_id)
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
 * /services/{service_id}/providers:
 *  get:
 *    tags:
 *    - name: services
 *    description: Get all services availables to schedule
 *    parameters:
 *    - in: path
 *      name: service_id
 *      schema:
 *        type: integer
 *        example: 1
 *      required: true
 *    responses:
 *      '200':
 *        description: Returns a list containing all services availables to schedule.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/:service_id/providers', (req, res) => {
  const { service_id } = req.params;

  servicesModel.getProvidersHasServices(service_id)
    .then(services => {
      console.log(services);
      res.status(200).json({
        success: true,
        message: 'Services',
        services
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        success: false,
        message: err.code || err.message
      })
    })
});

/**
 * @swagger
 * /services/offered/provider/{provider_id}:
 *  get:
 *    tags:
 *    - name: services
 *    description: Get all services offered by provider_id
 *    parameters:
 *    - in: path
 *      name: provider_id
 *      schema:
 *        type: integer
 *        example: 2
 *      required: true
 *    responses:
 *      '200':
 *        description: Returns a list containing all services provided by user with the given provider_id.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/offered/provider/:provider_id', (req, res) => {
  const { provider_id } = req.params;

  servicesModel.getServicesOfferedByUserId(provider_id)
    .then(services => {
      res.status(200).json({
        success: true,
        message: 'Services provided by user with provider_id: ' + provider_id,
        services
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        success: false,
        message: err.code || err.message
      })
    })
});

/**
 * @swagger
 * /services/permitted/provider/{provider_id}:
 *  get:
 *    tags:
 *    - name: services
 *    description: Get all services permitted for provider_id
 *    parameters:
 *    - in: path
 *      name: provider_id
 *      schema:
 *        type: integer
 *        example: 1
 *      required: true
 *    responses:
 *      '200':
 *        description: Returns a list containing all services provided by user with the given provider_id.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/permitted/provider/:provider_id', (req, res) => {
  const { provider_id } = req.params;

  servicesModel.getServicesPermitted(provider_id)
    .then(services => {
      res.status(200).json({
        success: true,
        message: 'Services permitted to user with provider_id: ' + provider_id,
        services
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        success: false,
        message: err.code || err.message
      })
    })
});

/**
 * @swagger
 * /services/schedule:
 *  post:
 *    tags:
 *    - name: services
 *    description: Schedule a service
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              client_id:
 *                type: number
 *                example: 1
 *              user_id:
 *                type: number
 *                example: 2
 *              date:
 *                type: datetime
 *                example: 2021-03-05 22:52:35
 *              start:
 *                type: time
 *                example: 09:00:00
 *              end:
 *                type: time
 *                example: "18:00:00"
 *              provider_has_services_id:
 *                type: number
 *                example: 1
 *    responses:
 *      '200':
 *        description: Returns the new service
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/schedule', async (req, res) => {
  const {
    client_id,
    user_id,
    date,
    start,
    end,
    address_id,
    category_id,
    service_id,
    receptor
  } = req.body
  const scheduleData = {
    clients_client_id: client_id,
    clients_users_user_id: user_id,
    services_service_id: service_id,
    services_categories_category_id: category_id,
    start,
    end,
    date,
    created_at: new Date()
  }

  servicesModel.getProvidersHasServices(service_id)
    .then(possibleServices => { // recibimos todos los servicios ofrecidos correspondientes con el service_id
      let possibleServicesFiltered = []
      
      // filtramos los servicios en una nueva lista con solo los servicios que cumplen los requisitos de genero, fecha y hora
      possibleServices.forEach(service => {
        const genderCorrect = (receptor.gender == service.gender || service.gender.toLowerCase() == 'unisex');
        const dateCorrect = (dayjs(scheduleData.start).format('HH:mm:ss') > service.start && dayjs(scheduleData.start).format('HH:mm:ss') < service.end)
        
        if (genderCorrect && dateCorrect) {
          possibleServicesFiltered.push(service)
        }
      });

      // si al filtrar no queda ningun servicio, lanzamos una excepción 
      if (possibleServicesFiltered.length == 0) {
        throw Error('No service found');
      }

      // de todos los servicios q cumplen con las condiciones dadas, se selecciona uno al azar
      // let serviceRequested = possibleServicesFiltered[Math.floor(Math.random() * possibleServicesFiltered.length)];

      // reordenamos el areglo de posibles proveedores aleatoriamente
      let serviceRequested = shuffleArray(possibleServicesFiltered);

      // ahora comenzamos con el proceso de registrar la solicitud del servicio
      servicesModel.requestService(scheduleData)
        .then(possibleNewService => {
          console.log(possibleNewService);
          serviceRequested.requested_service_id = possibleNewService.insertId
          res.status(200).json({
            success: true,
            message: 'Possible new service schedule successfully',
            serviceRequested
          });
        })
        .catch(async err => {
          console.log(err);

          // borramos la solicitud de la bdd
          await servicesModel.cancelRequest(possibleNewService.insertId);

          res.status(400).json({
            success: false,
            message: err
          })
        });
    })
    .catch(err => {
      console.log(err);
      res.status(400).json({
        success: false,
        message: err
      })
    })
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
router.post('/new-service', upload, async (req, res) => {
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
    img_url: `api/public/images/services/${serviceImage.filename}`,
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
      console.log(err);
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
 *              service_id:
 *                type: integer
 *                example: 1
 *              category_id:
 *                type: integer
 *                example: 1
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
        message: 'Service permitted successfully',
        newServicePermitted
      });
    })
    .catch(err => {
      console.log(err);
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
 *              category_id:
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
 *                example: mujer
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
    category_id,
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
    services_categories_category_id: category_id,
    workable,
    state,
    gender,
    start,
    end,
    created_at: new Date()
  }
  const locationToProvide = [];

  if(districts){
    districts.forEach(district => {
      locationToProvide.push([
        district,
        region,
      ]);
    });
  } else {
    locationToProvide.push([
      null,
      region,
    ]);
  }

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

router.patch('/offered/change-state', async (req, res) => {
  const {
    provider_id,
    user_id,
    service_id,
    state
  } = req.body
  const offeredService = {
    state,
    provider_id,
    user_id,
    service_id
  }

  servicesModel.changeOfferedServiceState(offeredService)
    .then(offeredService => {
      res.status(200).json({
        success: true,
        message: 'Service created successfully',
        offeredService
      });
    })
    .catch(err => {
      console.log(err.sqlMessage)
      res.status(500).json({
        success: false,
        message: err.code || err.message
      });
    });
})

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

module.exports = router;