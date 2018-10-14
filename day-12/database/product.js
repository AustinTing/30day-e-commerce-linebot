const airtable = require('./airtable.js')
const _ = require('lodash')

const toProduct = record => {
  const {fields} = record
  const {id, name, detail, price, images, is_show} = fields
  if (!(id, name && detail && price && images && images[0].url)) return console.log(`Some data in product id: ${id} is not correct`)
  return { id: record.id, name, detail, price, imgUrl: images[0].url, isShow: is_show } // Fix id to id: record.id
}

module.exports.readProducts = async ({offset} = {}) => {
  let result = await airtable.getRecords({
    table: 'product',
    offset,
    pageSize: 9,
    sort: [{field: 'id', direction: 'asc'}]
  })
  result['products'] = _.compact(_.map(result.records, toProduct))
  return result
}

module.exports.readProduct = async ({id} = {}) => {
  let result = await airtable.getRecord({table: 'product', id})
  return toProduct(result)
}
