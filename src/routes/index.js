const { urlCons } = require('../lib/utils')
const scrapper = require('./scrapper')

module.exports = function (app) {
  app.use(urlCons.PARAM_API_PRIFIX, scrapper)
}
