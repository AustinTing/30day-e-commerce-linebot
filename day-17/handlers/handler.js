const { LineHandler } = require('bottender')
const queryString = require('query-string')
const handleGeneralFlow = require('./handle_general_flow.js')
const handleShoppingFlow = require('./handle_shopping_flow.js')
const handleMemberFlow = require('./handle_member_flow')
const _ = require('lodash')

const init = context => {
  console.log(`\nstate: ${JSON.stringify(context.state)}`)
  const { event } = context
  if (event.isPostback) {
    console.log(`postback: ${JSON.stringify(event.postback)}`)
    event.postback['query'] = queryString.parse(event.postback.data)
    console.log('postback.query:', event.postback.query)
  }
  return false
}

const isReset = context => {
  const { event } = context
  if (event.isText && event.text === 'Reset') return true
  return false
}

const handleReset = context => {
  context.state.flow = null
  context.state.order = null
  context.state.member = null
  context.replyText('已重置')
}

const isGeneralFlow = context => {
  const { event } = context
  if (event.isPostback) {
    if (event.postback.query && event.postback.query.flow === 'general') return true
  }
  return false
}

const isShoppingFlow = context => {
  const { event } = context
  if (event.isPostback) {
    if (event.postback.query && event.postback.query.flow === 'shopping') return true
  }
  if (_.startsWith(context.state.flow, 'shopping')) return true
  return false
}

const isMemberFlow = context => {
  const { event } = context
  if (_.startsWith(context.state.flow, 'member')) return true
  if (event.isPostback) {
    if (event.postback.query && event.postback.query.flow === 'member') return true
  }
  return false
}

module.exports = new LineHandler()
  .on(init, context => console.log(`How do you get here!?`))
  .on(isReset, handleReset)
  .on(isGeneralFlow, handleGeneralFlow)
  .on(isShoppingFlow, handleShoppingFlow)
  .on(isMemberFlow, handleMemberFlow)
  .onEvent(context => {
    if (context.event.isText) return
    console.log('Uncaught event:', context.event.rawEvent)
  })
  .build()
