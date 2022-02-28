const { Client, Intents } = require("discord.js")
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
const stockRoute = require('./stocks')
const updateStock = require('./updateStock')
const account = require('./account')
const gambling = require("./gambling")
require('dotenv').config()

setInterval(() => {
    const time = new Date().getSeconds()
    if (time == 0) updateStock()
}, 1000)

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
    if (cmd[0] === "설명서") msg.channel.send(`
\`\`\`
가입: #가입 //가입한다. 기본금 10만원을 획득한다.

주식: #주식 //주식의 변동과 현재 가격을 보여준다.
주식 2: #주식 구매 [주식 이름] [수량] //주식을 수량만큼 구매한다. 수량에 "다"를 입력하여 풀매수를 땡길 수 있다.
주식 3: #주식 판매 [주식 이름] [수량] //주식을 수량만큼 판매한다. 수량에 "다"를 입력하여 풀매도를 할 수 있다. 
주식 4: #주식 차트 //모든 주식의 변동 사항을 차트로 나타낸다.
주식 5: #주식 차트 [주식 이름] //해당 주식의 변동사항만 차트로 나타낸다.

도박: #도박 //각 단계의 확률을 표시해준다.
도박 3: #도박 구매 [수량(최소 10장)] //도박장 이용 티켓을 구매한다. 장당 1000원
도박 2: #도박 [단계] [가격] //도박을 진행한다. 티켓이 없으면 도박을 할 수 없다.

ㄴ: #ㄴ //내가 가진 주식, 주식들의 총손익, 도박 티켓, 자본금을 보여준다
송금: #송금 //송금 수수료 표시.
송금: #송금 [멘션] [가격(최소 만원)] //멘션한 유저에게 돈을 송금한다.
\`\`\``)
})

client.login(process.env.TOCKEN)