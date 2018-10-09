require('dotenv').config()
const { LineBot, FileSessionStore } = require('bottender')
const { createServer } = require('bottender/express')

const bot = new LineBot({
  accessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
  sessionStore: new FileSessionStore('./sessions', 365 * 24 * 60 * 10) // 10 years
})

bot.onEvent(context => {
  if (context.event.isText) {
    return context.pushText(context.event.text)
  }
  context.pushText('??')
})

const server = createServer(bot)

server.listen(process.env.PORT, () => {
  console.log(`server is running on ${process.env.PORT} port...`)
})
