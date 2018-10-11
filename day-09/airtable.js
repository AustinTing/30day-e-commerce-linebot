require('dotenv').config()
const rp = require('request-promise')

const test = async () => {
  const option = {
    headers: {
      'Authorization': 'Bearer ' + process.env.AIRTABLE_API_KEY
    },
    url: `https://api.airtable.com/v0/${process.env.AIRTABLE_API_ID}/product`,
    json: true
  }
  console.log(JSON.stringify(await rp(option)))
}
test()
