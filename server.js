const express = require('express')
const cron = require('node-cron')
const fetch = require('node-fetch')
const Discord = require('discord.js')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const hook = new Discord.WebhookClient(
  process.env.WEBHOOK_ID,
  process.env.WEBHOOK_TOKEN
)

const client = new Discord.Client()

const PORT = process.env.PORT || 3000

const sadWords = ['sad', 'depressed', 'unhappy', 'angry', 'lonely']
const encouragements = [
  'Cheer up!',
  'Hang in there.',
  'You are a great person / bot!',
]

function getQuote() {
  return fetch('https://zenquotes.io/api/random')
    .then((res) => res.json())
    .then((data) => data[0]['q'] + ' -' + data[0]['a'])
}

function getCoinPrice(coin) {
  return fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`
  )
    .then((res) => res.json())
    .then((data) => data[coin]?.usd || null)
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', (msg) => {
  if (msg.author.bot) return

  if (msg.content === 'ping') {
    msg.reply('pong')
  }
  if (msg.content.toLowerCase() === 'cheeks') {
    msg.reply('YEEKS')
  }

  if (msg.content === '$inspire') {
    getQuote().then((quote) => msg.channel.send(quote))
  }

  if (sadWords.some((word) => msg.content.toLowerCase().includes(word))) {
    const encouragement =
      encouragements[Math.floor(Math.random() * encouragements.length)]
    msg.reply(encouragement)
  }

  if (msg.content.includes('$crypto:')) {
    const [tag, coin] = msg.content.split('$crypto:')
    getCoinPrice(coin).then((price) => {
      if (!price) {
        msg.reply(
          "Cannot find price for that coin. It probably isn't a real coin, nerd."
        )
      } else {
        if (coin === 'dogecoin' && price > 0.1) {
          msg.reply(`${coin} is $${price}. This is unreasonably high, WTF!`)
        } else {
          msg.reply(`${coin} is $${price}.`)
        }
      }
    })
  }
})

const server = express()

server.all('/', (req, res) => {
  res.send('Scotts Bots is running!')
})

cron.schedule('30 18 * * 4,7', () => {
  hook.send('30 minutes until tots, get ready!')
})

function keepAlive() {
  client.login(process.env.TOKEN)
  server.listen(PORT, () => {
    console.log('Server is ready')
  })
}

keepAlive()
