
const { LineHandler } = require('bottender')

const isNewMember = context => !context.state.member

const handleNewMember = async context => {
  context.state.member = {}
  context.state.flow = 'member_wait_input_name'
  await context.pushText('Ops～小商發現您還沒註冊過唷，小商需要您的聯絡資訊才能送貨唷')
  await context.pushText('請問您的姓名是？')
}

const isWaitInputName = context => context.state.flow === 'member_wait_input_name'

const handleWaitInputName = async context => {
  const {event} = context
  if (!event.isText) return console.log(`Event is not text type. Evenet: ${event.rawEvent}`)
  context.state.member.name = event.text
  context.state.flow = 'member_wait_input_phone'
  await context.replyText('好的！')
  await context.pushText('當商品寄出時還需要您的手機號碼唷～請問您的手機號碼是？')
}

const isWaitInputPhone = context => context.state.flow === 'member_wait_input_phone'

const handleWaitInputPhone = async context => {
  const {event} = context
  if (!event.isText) return console.log(`Event is not text type. Evenet: ${event.rawEvent}`)
  context.state.member.phone = event.text
  context.state.flow = 'member_wait_input_address'
  await context.replyText('收到！')
  await context.pushText('請問您的收貨地址是？')
}

const isWaitInputAddress = context => context.state.flow === 'member_wait_input_address'

const handleWaitInputAddress = context => {
  const {event} = context
  if (!event.isText) return console.log(`Event is not text type. Evenet: ${event.rawEvent}`)
  context.state.member.address = event.text
  context.state.flow = null
  context.reply([
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
      }}])
}

const isWaitConfirm = context => {
  const {event} = context
  if (event.isPostback && event.postback.query && event.postback.query.flow === 'member') return true
  return false
}

const isConfirm = context => {
  const {event} = context
  return event.isPostback && event.postback.query && event.postback.query.action === 'confirm'
}

const handleConfirm = context => {
  context.state.flow = null
  context.replyText('會員資訊已確認囉，接下來...')
  // TODO: handleConfirm
}

const isTryAgain = context => {
  const {event} = context
  return event.isPostback && event.postback.query && event.postback.query.action === 'tryAgain'
}

const handleTryAgain = context => {
  context.state.flow = 'member_wait_input_name'
  context.replyText('真不好意思>"<，請問您的姓名是')
}

const isCancelOrder = context => {
  const {event} = context
  return event.isPostback && event.postback.query && event.postback.query.action === 'cancelOrder'
}

const handleCancelOrder = context => {
  context.state.flow = null
  context.state.order = null
  context.state.member = null
  context.replyText('嗚嗚～好的')
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
  .onEvent(context => console.log('Uncaught event:', context.event.rawEvent))
  .build()
