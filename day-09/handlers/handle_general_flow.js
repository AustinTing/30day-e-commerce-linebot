const { LineHandler } = require('bottender')

const isGetOrders = context => {
  const {event} = context
  if (event.postback.query.action && event.postback.query.action === 'getOrders') return true
  return false
}

const handleGetOrders = context => {
  context.replyText('You click getOrders')
}

const isGetProducts = context => {
  const {event} = context
  if (event.postback.query.action && event.postback.query.action === 'getProducts') return true
  return false
}

const handleGetProducts = context => {
  context.replyText('You click getProducts')
}
const isGetMemberInfo = context => {
  const {event} = context
  if (event.postback.query.action && event.postback.query.action === 'getMemberInfo') return true
  return false
}

const handleGetMemberInfo = context => {
  context.replyText('You click getMemberInfo')
}

module.exports = new LineHandler()
  .on(isGetOrders, handleGetOrders)
  .on(isGetMemberInfo, handleGetMemberInfo)
  .on(isGetProducts, handleGetProducts)
  .onEvent(context => console.log('Uncaught event:', context.event.rawEvent))
  .build()
