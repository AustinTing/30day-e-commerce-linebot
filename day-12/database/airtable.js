require('dotenv').config()
const rp = require('request-promise')

const requiredParam = param => {
  const requiredParamError = new Error(`Required parameter, "${param}" is missing.`)
  // preserve original stack trace
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(requiredParamError, requiredParam)
  }
  throw requiredParamError
}

module.exports.getRecords = async ({
  table = requiredParam('table'),
  pageSize,
  offset,
  sort
} = {}) => {
  const option = {
    headers: {
      'Authorization': 'Bearer ' + process.env.AIRTABLE_API_KEY
    },
    qs: {
      pageSize,
      sort,
      offset
    },
    url: `https://api.airtable.com/v0/${process.env.AIRTABLE_API_ID}/${table}`,
    json: true
  }
  return rp(option)
}

module.exports.getRecord = async ({
  table = requiredParam('table'),
  id = requiredParam('id')
} = {}) => {
  const option = {
    headers: {
      'Authorization': 'Bearer ' + process.env.AIRTABLE_API_KEY
    },
    url: `https://api.airtable.com/v0/${process.env.AIRTABLE_API_ID}/${table}/${id}`,
    json: true
  }
  return rp(option)
}
