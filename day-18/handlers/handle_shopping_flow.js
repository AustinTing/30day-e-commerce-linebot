const { LineHandler } = require('bottender')
const _ = require('lodash')
const Product = require('../database/product.js')
const handleMemberFlow = require('./handle_member_flow.js')

const isBuy = context => {
  const { event } = context
  if (event.isPostback && event.postback.query && event.postback.query.action === 'buy') return true
  return false
}

const handleBuy = async context => {
  const { productID } = context.event.postback.query
  if (!productID) return console.log('there is no productID in postback!')
  const product = await Product.readProduct({ id: productID })
  if (!product || !product.isShow) return context.replyText('不好意思，已經買不到囉')
  context.setState({ flow: 'shopping_wait_input_quantity', order: { productID: product.id } })
  context.replyText(`想買${product.name}，好的，您想要買幾個呢？ (請輸入阿拉伯數字)`)
}

const isWaitInputQuantityState = context => {
  if (context.state.flow === 'shopping_wait_input_quantity') return true
  return false
}

const cancelBuy = context => {
  context.setState({ flow: null, order: null })
  context.pushText('購買已先幫您取消囉')
  context.pushText('再看看有沒有其他喜歡的吧～')
  // TODO: 再推一次商品列表
}

const handleWaitInputQuantityState = async context => {
  const { event } = context
  if (!event.isText || !/\d{1,}/g.test(event.text)) {
    context.replyText('不好意思，小商只懂得0~9 >"<')
    return
  }
  const quantity = _.toInteger(event.text)
  if (quantity === 0) return cancelBuy(context)
  const product = await Product.readProduct({ id: context.state.order.productID })
  if (!product || !product.isShow) return context.replyText('不好意思，已經買不到囉')
  context.state.order['quantity'] = quantity
  context.state.flow = 'shopping_wait_confirm'
  context.reply([{
    type: 'template',
    altText: '我確認一下唷～',
    template: {
      type: 'buttons',
      thumbnailImageUrl: product.imgUrl,
      imageBackgroundColor: '#FFFFFF',
      title: '我確認一下唷～',
      text: `您想要購買 ${product.name} ${quantity} 個，對吧？`,
      actions: [
        {
          type: 'postback',
          label: '沒錯！',
          displayText: '沒錯！',
          data: `flow=shopping&action=confirm`
        }, {
          type: 'postback',
          label: '不對唷～',
          displayText: '不對唷～',
          data: `flow=shopping&action=cancel`
        }
      ]
    } }])
}

const isWaitConfirm = context => {
  if (context.state.flow === 'shopping_wait_confirm') return true
  return false
}

const handleWaitConfirm = async context => {
  const { event } = context
  if (event.isPostback && event.postback.query && event.postback.query.action === 'confirm') {
    await context.replyText('購買資訊已確認，接下來...')
    if (!context.state.member) return handleMemberFlow(context)
    return // TODO: handlePayingFlow
  }
  if (event.isPostback && event.postback.query && event.postback.query.action === 'cancel') {
    cancelBuy(context)
  }
}

module.exports = new LineHandler()
  .on(isBuy, handleBuy)
  .on(isWaitInputQuantityState, handleWaitInputQuantityState)
  .on(isWaitConfirm, handleWaitConfirm)
  .onEvent(context => console.log('Uncaught event:', context.event.rawEvent))
  .build()
