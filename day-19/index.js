require('dotenv').config()
const { LineBot, FileSessionStore } = require('bottender')
const { createServer } = require('bottender/express')
const handler = require('./handlers/handler.js')

const bot = new LineBot({
  accessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
  sessionStore: new FileSessionStore('./sessions', 365 * 24 * 60 * 10) // 10 years
})

bot.onEvent(handler)

const server = createServer(bot)

server.get('/payments/result', (req, res) => {
  console.log('/payments/result', req.query)
  res.send(`<h1>付款已完成 ${JSON.stringify(req.query)}</h1>`)
})

server.listen(process.env.PORT, () => {
  console.log(`server is running on ${process.env.PORT} port...`)
})
