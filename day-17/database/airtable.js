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
  sort,
  filterByFormula
} = {}) => {
  const option = {
    headers: {
      'Authorization': 'Bearer ' + process.env.AIRTABLE_API_KEY
    },
    qs: {
      pageSize,
      sort,
      offset,
      filterByFormula
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

module.exports.createRecord = async ({
  table = requiredParam('table'),
  data = requiredParam('data')
} = {}) => {
  const option = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.AIRTABLE_API_KEY,
      'Content-type': 'application/json'
    },
    url: `https://api.airtable.com/v0/${process.env.AIRTABLE_API_ID}/${table}`,
    body: data,
    json: true
  }
  return rp(option)
}

module.exports.updateRecord = async ({
  table = requiredParam('table'),
  id = requiredParam('id'),
  data = requiredParam('data')
} = {}) => {
  const option = {
    method: 'PATCH',
    headers: {
      Authorization: 'Bearer ' + process.env.AIRTABLE_API_KEY,
      'Content-type': 'application/json'
    },
    url: `https://api.airtable.com/v0/${process.env.AIRTABLE_API_ID}/${table}/${id}`,
    body: data,
    json: true
  }
  return rp(option)
}
