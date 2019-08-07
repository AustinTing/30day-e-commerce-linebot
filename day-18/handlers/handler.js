const { LineHandler } = require('bottender')
const queryString = require('query-string')
const handleGeneralFlow = require('./handle_general_flow.js')
const handleShoppingFlow = require('./handle_shopping_flow.js')
const handleMemberFlow = require('./handle_member_flow')
const _ = require('lodash')

const init = context => {
  const { event } = context
  console.log(`\n`)
  if (event.isText) console.log(`user input: ${event.text}`)
  if (event.isPostback) {
    console.log(`user postback: ${JSON.stringify(event.postback)}`)
    event.postback['query'] = queryString.parse(event.postback.data)
    console.log('postback.query:', event.postback.query)
  }
  console.log(`state: ${JSON.stringify(context.state)}`)
  return false
}

const isReset = context => {
  const { event } = context
  if (event.isText && event.text === 'Reset') {
    console.log(`handler, isReset`)
    return true
  }
  return false
}

const handleReset = context => {
  delete context.state.flow
  delete context.state.order
  delete context.state.member
  console.log(`handler, handleReset: reset state`)
  context.replyText('已重置')
  console.log(`reply 已重置`)
  console.log(`state: `, context.state)
}

const isGeneralFlow = context => {
  const { event } = context
  if (event.isPostback) {
    if (event.postback.query && event.postback.query.flow === 'general') {
      console.log(`handler, isGeneralFlow`)
      return true
    }
  }
  return false
}

const isShoppingFlow = context => {
  const { event } = context
  if (event.isPostback) {
    if (event.postback.query && event.postback.query.flow === 'shopping') {
      console.log(`handler, isShoppingFlow`)
      return true
    }
  }
  if (_.startsWith(context.state.flow, 'shopping')) {
    console.log(`handler, isShoppingFlow`)
    return true
  }
  return false
}

const isMemberFlow = context => {
  const { event } = context
  if (_.startsWith(context.state.flow, 'member')) {
    console.log(`handler, isMemberFlow`)
    return true
  }
  if (event.isPostback) {
    if (event.postback.query && event.postback.query.flow === 'member') {
      console.log(`handler, isMemberFlow`)
      return true
    }
  }
  return false
}

module.exports = new LineHandler()
  .on(init, context => console.log(`How do you get here!?`))
  // TODO: move here
  .on(isReset, handleReset)
  .on(isGeneralFlow, handleGeneralFlow)
  .on(isShoppingFlow, handleShoppingFlow)
  .on(isMemberFlow, handleMemberFlow)
  .onEvent(context => {
    if (context.event.isText) return
    console.log('Uncaught event:', context.event.rawEvent)
  })
  .build()
