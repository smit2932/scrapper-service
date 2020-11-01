'use strict'

const mongoose = require('mongoose')
const config = require('config')
require('mongoose-long')(mongoose)
const utils = require('../lib/utils')
const Schema = mongoose.Schema
const SchemaTypes = mongoose.Schema.Types

const scrapDetails = new Schema({
  id: SchemaTypes.Long,
  url: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: false
  },
  images: [String],
  description: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  is_deleted: {
    type: Boolean,
    required: true,
    default: false
  },
  updated_on: {
    type: Date,
    default: Date.now
  },
  created_by: {
    type: String,
    default: config.database.defaults.createdBy
  },
  updated_by: {
    type: String,
    default: config.database.defaults.updatedBy
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  additional_attributes: [{
    name: {
      type: String
    },
    value: {
      type: String
    }
  }]
}, {
  collection: 'scraps'
})

// scrapDetails.plugin(global.db.autoIncrement, {
//   model: 'scraps',
//   field: 'id',
//   startAt: 1
// })

module.exports = mongoose.model(utils.dbCons.COLLECTION_SCRAPS, scrapDetails)
