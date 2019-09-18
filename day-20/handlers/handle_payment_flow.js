require('dotenv').config()
const { LineHandler } = require('bottender')
const rp = require('request-promise')
const Product = require('../database/product')

const requiredParam = param => {
  const requiredParamError = new Error(`Required parameter, "${param}" is missing.`)
  // preserve original stack trace
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(requiredParamError, requiredParam)
  }
  throw requiredParamError
}

const isStart = context => {
  if (context.state.flow === 'payment_start') {
    console.log('handle_payment_flow, isStart, true')
    return true
  }
  return false
}

const getPaymentUrl = async ({
  orderNo = requiredParam('orderNo'),
  product = requiredParam('product'),
  quantity = requiredParam('quantity')
} = {}) => {
  const option = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-LINE-ChannelId': process.env.LINE_PAY_CHANNEL_ID,
      'X-LINE-ChannelSecret': process.env.LINE_PAY_CHANNEL_SECRET_KEY
    },
    url: `https://sandbox-api-pay.line.me/v2/payments/request`,
    json: true,
    body: {
      productName: product.name,
      productImageUrl: product.imgUrl,
      amount: product.price * quantity,
      currency: 'TWD',
      confirmUrl: process.env.APP_URL + '/payments/result',
      orderId: orderNo
    }
  }
  const result = await rp(option)
  if (result && result.returnCode === '0000') {
    const paymentUrl = result.info && result.info.paymentUrl && result.info.paymentUrl.web
    return paymentUrl
  }
  console.log(`getPaymentUrl fail, retult: `, result)
  return null
}
// TODO: 加入error handling 以及相關回覆
const handleStart = async context => {
  console.log('handle_payment_flow, handleStart')
  const { productID: orderProductId, quantity } = context.state.order
  if (!orderProductId) throw new Error('There is no orderProductId')
  if (!quantity) throw new Error('There is no quantity')
  const product = await Product.readProduct({ id: context.state.order.productID })
  if (!product) throw new Error(`There is no product with id: ${context.state.order.productID}`)
  // console.log(`handle_payment_flow, product: `, product)
  const orderNo = Date.now()
  // Add orderNo to context.state.order
  // Check what prop inside the order
  console.log(`handle_payment_flow, context.state.order: `, context.state.order)
  const paymentUrl = await getPaymentUrl({ orderNo, product, quantity })
  if (!paymentUrl) {
    return console.log(`handle_payment_flow, handleStart, getPaymentUrl fail`)
  }
  context.reply([{
    type: 'template',
    altText: '那我們去結帳吧！',
    template: {
      type: 'confirm',
      text: '那我們去結帳吧！',
      actions: [{
        type: 'uri',
        label: '結帳去！',
        uri: paymentUrl
      }, {
        type: 'postback',
        label: '還是算了',
        data: 'flow=payment&action=cancel'
      }]
    }
  }])
  context.state.flow = 'payment_wait_checkout'
  console.log('handle_payment_flow, handleStart, reply confirm')
  console.log('handle_payment_flow, handleStart, final state: ', context.state)
}

const isCancel = context => {
  const { event } = context
  if (context.state.flow !== 'payment_wait_checkout') return false
  if (event.isPostback && event.postback.query && event.postback.query.action === 'cancel') {
    console.log('handle_payment_flow, isCancel, true')
    return true
  }
  return false
}

const handleCancel = context => {
  console.log('handle_payment_flow, handleCancel')
  context.state.flow = null
  context.state.order = null
  context.replyText('好喔 T^T')
  console.log('handle_payment_flow, handleCancel, reply OK')
  console.log('handle_payment_flow, handleCancel, final state: ', context.state)
}

module.exports = new LineHandler()
  .on(isStart, handleStart)
  .on(isCancel, handleCancel)
  .onEvent(context => console.log('handle_payment_flow, uncaught event:', context.event.rawEvent))
  .build()
