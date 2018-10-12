const airtable = require('./airtable.js')
const _ = require('lodash')

module.exports.readProducts = async () => {
  const result = await airtable.get({
    table: 'product',
    pageSize: 10,
    sort: [{field: 'id', direction: 'asc'}]
  })
  console.log(JSON.stringify(result))
  return _.compact(_.map(result.records, record => {
    const {fields} = record
    const {id, name, detail, price, images} = fields
    if (!(name && detail && price && images && images[0].url)) return console.log(`Some data in product id: ${id} is not correct`)
    return { id, name, detail, price, imgUrl: images[0].url }
  }))
}
