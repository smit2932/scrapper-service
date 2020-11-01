'use strict'

require('../models/scrap-v_1_0_0_0')
const { logger, dbCons } = require('../lib/utils')
const { getFinalQueryJson } = require('./db-operation')

const saveScrapDetails = async (data, tenant) => {
  try {
    const db = await global.db.connect(tenant)
    const ScrapMOdel = db.model(dbCons.COLLECTION_SCRAPS)
    const scrapModel = new ScrapMOdel(data)
    const response = await scrapModel.save()
    return response
  } catch (error) {
    logger.warn('Error in fetching scrap Details Repository: %s %j', error, error)
    throw error
  }
}
const fetchScrapDetails = async (query, projection, tenant) => {
  try {
    const db = await global.db.connect(tenant)
    const scrapModel = db.model(dbCons.COLLECTION_SCRAPS)
    const scrapDetails = await scrapModel.find(getFinalQueryJson(query), projection).sort({ _id: -1 })
    return scrapDetails
  } catch (error) {
    logger.warn('Error in fetching scrap Details Repository: %s %j', error, error)
    throw error
  }
}

const removeScrappedData = async (tenant) => {
  try {
    const db = await global.db.connect(tenant)
    const scrapModel = db.model(dbCons.COLLECTION_SCRAPS)
    const scrapDetails = await scrapModel.remove({})
    console.log(scrapDetails)
    return scrapDetails
  } catch (error) {
    logger.warn('Error in fetching scrap Details Repository: %s %j', error, error)
    throw error
  }
}

const upsertScrapDetails = async (query, data, tenant) => {
  try {
    const db = await global.db.connect(tenant)
    const scrapModel = db.model(dbCons.COLLECTION_SCRAPS)
    const scrapDetails = await scrapModel.findOneAndUpdate(getFinalQueryJson(query), data, { new: true, upsert: true }).sort({ _id: -1 })
    return scrapDetails
  } catch (error) {
    logger.warn('Error in upserting scrap Details Repository: %s %j', error, error)
    throw error
  }
}

module.exports = {
  saveScrapDetails,
  fetchScrapDetails,
  removeScrappedData,
  upsertScrapDetails
}
