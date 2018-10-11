const { LineHandler } = require('bottender')
const Product = require('../database/product.js')
const _ = require('lodash')

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

const toColumns = products => {
  return _.map(products, product => {
    return {
      thumbnailImageUrl: product.imgUrl,
      imageBackgroundColor: '#FFFFFF',
      title: product.name,
      text: product.detail,
      defaultAction: {
        type: 'uri',
        label: 'View image',
        uri: product.imgUrl
      },
      actions: [
        {
          type: 'postback',
          label: '我想要買！',
          data: `flow=shoping&action=buy&productID=${product.id}`
        }
      ]
    }
  })
}

const handleGetProducts = async context => {
  const products = await Product.readProducts()
  let carouselProducts = {
    type: 'template',
    altText: '好吃好吃嚼嚼嚼',
    imageAspectRatio: 'rectangle',
    imageSize: 'cover',
    template: {
      type: 'carousel',
      columns: toColumns(products)
    }}
  context.reply([carouselProducts])
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
