const { Client, Intents } = require("discord.js")
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
const stockRoute = require('./router/stocks')
const {
    updateStock,
    collectionTax,
    interest
} = require('./router/iterable.js')
const account = require('./router/account')
const gambling = require("./router/gambling")
require('dotenv').config()

setInterval(() => {
    const time = new Date()
    if (time.getSeconds() === 0) updateStock()
    if ((time.getHours() === 12 && time.getMinutes() === 0) || (time.getMinutes() === 0 && time.getHours() === 0)) {
        collectionTax()
        interest()
    }
}, 1000)

client.on("ready", () => {
    client.user.setActivity('#설명서', { type: 'WATCHING' })
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
    if (cmd[0] === "은행") account(cmd, msg)
    if (cmd[0] === "긴급구제신청") ERA(cmd, msg)
    if (cmd[0] === "설명서") msg.channel.send(`
\`\`\`
세금: 매일 0시와 12시에 10억이상을 보유한 유저에게서 보유금의 0.05%를 징수해간다.

가입: #가입                           // 가입한다. 기본금 1000만원을 획득한다.

주식: #주식                           // 주식의 변동과 현재 가격을 보여준다.
주식 2: #주식 구매 [주식 이름] [수량] // 주식을 수량만큼 구매한다. 수량에 "다"를 입력하여 풀매수를 땡길 수 있다.
주식 3: #주식 판매 [주식 이름] [수량] // 주식을 수량만큼 판매한다. 수량에 "다"를 입력하여 풀매도를 할 수 있다. 
주식 4: #주식 차트                    // 모든 주식의 변동 사항을 차트로 나타낸다.
주식 5: #주식 차트 [주식 이름]        // 해당 주식의 변동사항만 차트로 나타낸다.
    *주의 주식은 10만분의 1확률로 원가에 상관없이 상장폐지 당할 수 있습니다.

도박: #도박                           // 각 단계의 확률을 표시해준다.
도박 3: #도박 구매 [수량(최소 10장)]  // 도박장 이용 티켓을 구매한다. 장당 1000원
도박 2: #도박 [단계] [가격]           // 도박을 진행한다. 티켓이 없으면 도박을 할 수 없다.

ㄴ: #ㄴ                               // 내가 가진 주식, 주식들의 총손익, 도박 티켓, 자본금을 보여준다
송금: #송금                           // 송금 수수료 표시.
송금: #송금 [멘션] [가격(최소 만원)]  // 멘션한 유저에게 돈을 송금한다.

은행 1: #은행 입금 [입금액]           // 은행에 돈을 입금한다.
    *은행의 일 이자율을 0.0001%이다.
은행 2: #은행 출금 [출금액]           // 은행에서 돈을 출금한다.
은행 3: #은행 통장                    // 현재 은행에 입금되어있는 금액확인 및 신용등급 확인
은행 4: #은행 한도                    // 각 단계별 한도 확인
은행 5: #은행 대출                    // 은행에서 대출을 한다.
은행 6: #은행 납부 [금액]             // 내 의지대로 세금을 납부한다.
    *유의 사항: 세금 수금은 매일 0시에 진행된다. 돈이 없을 시 신용등급은 한 단계식 하락한다.

긴급구제신청: 가입후 단 3번 자신의 자산이 없고 현금이 50원 미만으로 존재할 때 신청가능하다. 1천만원을 받는다.
\`\`\``)
})

client.login(process.env.TOCKEN)
