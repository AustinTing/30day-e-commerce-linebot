
const { LineHandler } = require('bottender')
const _ = require('lodash')

const isNewMember = context => !context.state.member

const handleNewMember = async context => {
  context.state.member = {}
  context.state.flow = 'member_wait_input_name'
  await context.pushText('Ops～小商發現您還沒註冊過唷，小商需要您的聯絡資訊才能送貨唷')
  await context.pushText('請問您的姓名是？')
}

module.exports = new LineHandler()
  .on(isNewMember, handleNewMember)
  .onEvent(context => console.log('Uncaught event:', context.event.rawEvent))
  .build()
