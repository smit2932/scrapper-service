var express = require('express')
var router = express.Router()
const { urlCons } = require('../lib/utils')
const { getScrappingDetails, updateScrapData } = require('../controllers/scrappingDetails')

/* POST Scrap data. */
router.post(urlCons.URL_POST_SCRAPPED_DETAILS, getScrappingDetails)

/* PUT Scrap listing. */
router.put(urlCons.URL_PUT_REFRESH_SCRAP_DATA, updateScrapData)

module.exports = router
