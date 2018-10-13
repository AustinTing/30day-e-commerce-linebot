const airtable = require('./airtable.js')
const _ = require('lodash')

module.exports.readProducts = async ({offset} = {}) => {
  let result = await airtable.get({
    table: 'product',
    offset,
    pageSize: 9,
    sort: [{field: 'id', direction: 'asc'}]
  })
  result['products'] = _.compact(_.map(result.records, record => {
    const {fields} = record
    const {id, name, detail, price, images} = fields
    if (!(name && detail && price && images && images[0].url)) return console.log(`Some data in product id: ${id} is not correct`)
    return { id, name, detail, price, imgUrl: images[0].url }
  }))
  console.log(JSON.stringify(result))
  return result
}
