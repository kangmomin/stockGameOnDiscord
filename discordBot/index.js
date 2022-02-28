const { Client, Intents } = require("discord.js")
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
const stockRoute = require('./stocks')
const updateStock = require('./updateStock')
const account = require('./account')
const gambling = require("./gambling")
require('dotenv').config()

setInterval(() => {
    updateStock()
}, 1000 * 60 * 1)

client.on("ready", () => {
    console.log("all ready")
})

client.on("message", msg => {
    if (!msg.content.startsWith("#")) return //만약 해당 봇에 내리는 명령문이 아니라면 함수 종료
    if(msg.author.bot) return 0 //봇이 친 커맨드라면 무시
    const cmd = msg.content.slice(1).split(" ")
    
    if (cmd[0] === "주식") stockRoute(cmd, msg)
    if (cmd[0] === "가입") account(cmd, msg)
    if (cmd[0] === "도박") gambling(cmd, msg)
    if (cmd[0] === "ㄴ") account(cmd, msg)
    if (cmd[0] === "송금") account(cmd, msg)
})

client.login(process.env.TOCKEN)