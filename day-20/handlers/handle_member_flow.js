
const { LineHandler } = require('bottender')
const Member = require('../database/member.js')
const handlePaymentFlow = require('./handle_payment_flow')

const isNewMember = context => {
  if (!context.state.member) {
    console.log('handle_member_flow, isNewMember, true')
    return true
  }
  return false
}

const handleNewMember = async context => {
  console.log('handle_member_flow, handleNewMember')
  context.state.member = {}
  context.state.flow = 'member_wait_input_name'
  await context.pushText('Ops～小商發現您還沒註冊過唷，小商需要您的聯絡資訊才能送貨唷')
  await context.pushText('請問您的姓名是？')
  console.log('handle_member_flow, reply ask name')
  console.log('handle_member_flow, final state: ', context.state)
}

const isWaitInputName = context => {
  if (context.state.flow === 'member_wait_input_name') {
    console.log('handle_member_flow, isWaitInputName, true')
    return true
  }
  return false
}

const handleWaitInputName = async context => {
  console.log('handle_member_flow, handleWaitInputName')
  const { event } = context
  if (!event.isText) return console.log(`Event is not text type. Evenet: ${event.rawEvent}`)
  context.state.member.name = event.text
  context.state.flow = 'member_wait_input_phone'
  await context.replyText('好的！')
  await context.pushText('當商品寄出時還需要您的手機號碼唷～請問您的手機號碼是？')
  console.log('handle_member_flow, reply ask phone number')
  console.log('handle_member_flow, final state: ', context.state)
}

const isWaitInputPhone = context => {
  if (context.state.flow === 'member_wait_input_phone') {
    console.log('handle_member_flow, isWaitInputPhone, true')
    return true
  }
  return false
}

const handleWaitInputPhone = async context => {
  console.log('handle_member_flow, handleWaitInputPhone')
  const { event } = context
  if (!event.isText) return console.log(`Event is not text type. Evenet: ${event.rawEvent}`)
  context.state.member.phone = event.text
  context.state.flow = 'member_wait_input_address'
  await context.replyText('收到！')
  await context.pushText('請問您的收貨地址是？')
  console.log('handle_member_flow, reply ask address')
  console.log('handle_member_flow, final state: ', context.state)
}

const isWaitInputAddress = context => {
  if (context.state.flow === 'member_wait_input_address') {
    console.log('handle_member_flow, isWaitInputAddress, true')
    return true
  }
  return false
}

const handleWaitInputAddress = async context => {
  console.log('handle_member_flow, handleWaitInputAddress')
  const { event } = context
  if (!event.isText) return console.log(`handle_member_flow, Event is not text type. Evenet: ${event.rawEvent}`)
  context.state.member.address = event.text
  context.state.flow = null
  await context.reply([
    {
      type: 'template',
      altText: '～',
      template: {
        type: 'buttons',
        thumbnailImageUrl: 'https://i.imgur.com/dvYQD8J.jpg',
        imageBackgroundColor: '#FFFFFF',
        title: '聯絡資訊如下，我有記錯嗎？',
        text: `姓名：${context.state.member.name}
手機：${context.state.member.phone}
寄件地址：${context.state.member.address}
沒錯吧？`,
        actions: [
          {
            type: 'postback',
            label: '沒錯！',
            displayText: '沒錯！',
            data: `flow=member&action=confirm`
          }, {
            type: 'postback',
            label: '不對唷～給我重來！',
            displayText: '不對唷～給我重來！',
            data: `flow=member&action=tryAgain`
          },
          {
            type: 'postback',
            label: '算了～下次再買吧～',
            displayText: '算了～下次再買吧～',
            data: `flow=member&action=cancelOrder`
          }
        ]
      } }])
  console.log('handle_member_flow, reply ask confirm')
  console.log('handle_member_flow, final state: ', context.state)
}

const isWaitConfirm = context => {
  const { event } = context
  if (event.isPostback && event.postback.query && event.postback.query.flow === 'member') {
    console.log('handle_member_flow, isWaitConfirm, true')
    return true
  }
  return false
}

const isConfirm = context => {
  const { event } = context
  if (event.isPostback && event.postback.query && event.postback.query.action === 'confirm') {
    console.log('handle_member_flow, isConfirm, true')
    return true
  }
  return false
}

const handleConfirm = async context => {
  console.log('handle_member_flow, handleConfirm')
  context.state.flow = null
  context.state.member.lineID = context.session.user.id
  // console.log(`member: ${JSON.stringify(context.state.member)}`)
  // TODO: Update member checking
  const newMember = await Member.createMember(context.state.member)
  if (newMember) {
    context.state.member = newMember
  }
  context.state.flow = 'payment_start'
  return handlePaymentFlow(context)
}

const isTryAgain = context => {
  const { event } = context
  if (event.isPostback && event.postback.query && event.postback.query.action === 'tryAgain') {
    console.log('handle_member_flow, isTryAgain, true')
    return true
  }
  return false
}

const handleTryAgain = context => {
  console.log('handle_member_flow, handleTryAgain')
  context.state.flow = 'member_wait_input_name'
  context.replyText('真不好意思>"<，請問您的姓名是')
  console.log('handle_member_flow, reply ask name again')
  console.log('handle_member_flow, final state: ', context.state)
}

const isCancelOrder = context => {
  const { event } = context
  if (event.isPostback && event.postback.query && event.postback.query.action === 'cancelOrder') {
    console.log('handle_member_flow, isCancelOrder, true')
    return true
  }
  return false
}

const handleCancelOrder = context => {
  console.log('handle_member_flow, handleCancelOrder')
  context.state({ flow: null, order: null })
  context.replyText('嗚嗚～好的')
  console.log('handle_member_flow, reply confirm cancel order')
  console.log('handle_member_flow, final state: ', context.state)
}

const handleWaitConfirm = new LineHandler()
  .on(isConfirm, handleConfirm)
  .on(isTryAgain, handleTryAgain)
  .on(isCancelOrder, handleCancelOrder)

module.exports = new LineHandler()
  .on(isNewMember, handleNewMember)
  .on(isWaitConfirm, handleWaitConfirm)
  .on(isWaitInputName, handleWaitInputName)
  .on(isWaitInputPhone, handleWaitInputPhone)
  .on(isWaitInputAddress, handleWaitInputAddress)
  .onEvent(context => console.log('handle_member_flow, uncaught event:', context.event.rawEvent))
  .build()
