const { LineHandler } = require('bottender')
const queryString = require('query-string')
const handleGeneralFlow = require('./handle_general_flow.js')
const handleShoppingFlow = require('./handle_shopping_flow.js')

const _ = require('lodash')

const init = context => {
  const {event} = context
  console.log(`\nstate: ${JSON.stringify(context.state)}`)
  if (event.isPostback) {
    console.log(`postback: ${JSON.stringify(event.postback)}`)
    event.postback['query'] = queryString.parse(event.postback.data)
    console.log('postback.query:', event.postback.query)
  }
  return false
}

const isGeneralFlow = context => {
  const {event} = context
  if (event.isPostback) {
    if (event.postback.query && event.postback.query.flow === 'general') return true
  }
  return false
}

const isShoppingFlow = context => {
  const {event} = context
  if (event.isPostback) {
    if (event.postback.query && event.postback.query.flow === 'shopping') return true
  }
  if (_.startsWith(context.state.flow, 'shopping')) return true
  return false
}

module.exports = new LineHandler()
  .on(init, context => console.log(`How do you get here!?`))
  .on(isGeneralFlow, handleGeneralFlow)
  .on(isShoppingFlow, handleShoppingFlow)
  .onEvent(context => {
    if (context.event.isText) return
    console.log('Uncaught event:', context.event.rawEvent)
  })
  .build()
