const fs = require("fs")
const Discord = require('discord.js')

function signUp(msg) {
    let user = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    for (let i = 0; i < user.length; i++) {
        if (user[i].userId == msg.author) return msg.channel.send("이미 가입이 완료된 계정입니다.")
    }

    user.push({
        userId: msg.author.id,
        userName: msg.author.tag,
        coin: 10000000,
        stock: []
    })
    
    fs.writeFileSync("./data/user.json", JSON.stringify(user))
    msg.channel.send("가입이 성공적으로 완료되었습니다. \n기본급 1000만원이 지급됩니다.\n#설명서를 이용하여 명령어를 확인할 수 있습니다.")
}

function myAccount(msg) {
    let users = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    let stocks = JSON.parse(fs.readFileSync("./data/stocks.json", 'utf-8'))
    let user, totalPorM = 0
    for (users of users) {
        if (typeof users !== "object") continue
        if (users.userId == msg.author) user = users
    }
    if (typeof user !== "object") return msg.channel.send("먼저 '#가입'을 통해 가입을 해주세요.")
    
    let embed = new Discord.MessageEmbed().setTitle(`${user.userName}주식 [${new Date().toLocaleTimeString()}]`)
    .setColor(0x00D8FF)
    for (let i = 0; i < user.stock.length; i++) {
        let stock
        for (let j = 0; j < stocks.length; j++) if (user.stock[i].name === stocks[j].label) stock = stocks[j]
        if (user.stock[i].count >= 1) {
            const PorM = (stock.data.pop() * user.stock[i].count) - user.stock[i].principal
            let upDown
            if(PorM < 0) upDown = {simple:"-", emoji:"▼"}
            else if(PorM > 0) upDown = {simple:"+", emoji:"▲"}
            else upDown = {simple:"", emoji:""}
            totalPorM += PorM
            embed.addFields({
                name: `> ${user.stock[i].name}`,
                value: `\`\`\`${user.stock[i].count.toLocaleString('ko-KR')}주\`\`\``,
                inline: true
            })
            embed.addFields({
                name: `손익`,
                inline: true,
                value: `\`\`\`diff
${upDown.simple} ${Math.abs(PorM).toLocaleString('ko-KR')}원
\`\`\``,
            })
            embed.addFields({
                name: `원가`,
                inline: true,
                value: `\`\`\`${(user.stock[i].principal / user.stock[i].count).toFixed(1).toLocaleString('ko-KR')}원\`\`\``,
            })
        }
    }

    totalPorM = totalPorM > 0 ? numberToKorean(Math.abs(totalPorM)) : "- " + numberToKorean(Math.abs(totalPorM))
    
    embed.setDescription(`자본금 ${numberToKorean(user.coin)}원\n전체 손익 ${totalPorM}원\n도박 티켓 ${user.gambleTicket}장`)

    msg.channel.send({embeds: [embed]})
}

function numberToKorean(number){
    let inputNumber  = number < 0 ? false : number;
    let unitWords    = ['', '만', '억', '조', '경'];
    let splitUnit    = 10000;
    let splitCount   = unitWords.length;
    let resultArray  = [];
    let resultString = '';

    for (let i = 0; i < splitCount; i++){
         let unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
        unitResult = Math.floor(unitResult);
        if (unitResult > 0){
            resultArray[i] = unitResult;
        }
    }

    for (let i = 0; i < resultArray.length; i++){
        if(!resultArray[i]) continue;
        resultString = String(resultArray[i]) + unitWords[i] + resultString;
    }

    return resultString;
}

function donate(cmd, msg) {
    if (msg.mentions.users.values().next().value === undefined) return msg.channel.send("멘션을 재확인 해주십시오.")
    const mention = msg.mentions.users.values().next().value.id || undefined
    const price = Number(cmd[2]) || ""
    let users = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    
    if (typeof price !== "number" || price < 10000 || price % 1 !== 0) return msg.channel.send("송금액을 재확인 해주십시오. ex) #송금 유저멘션 송금액(최소 만원)")
    if (mention === undefined) return msg.channel.send("멘션을 재확인 해주십시오.")
    
    let commis = 0.07
    if (price > 500000 && price <= 10000000) commis = 0.03
    if (price > 10000000 && price <= 100000000) commis = 0.01 
    if (price > 100000000 && price <= 1000000000) commis = 0.001
    if (price > 1000000000) commis = 0
    
    const commission = Math.round(price * commis)
    
    for (let i = 0; i < users.length; i++) {
        if (users[i].userId === msg.author.id) {
            if (users[i].coin < price + commission) return msg.channel.send(`송금액이 자본금보다 많습니다. \n자본금 \`${users[i].coin}\` 수수료 \`${commission}\``)
            
            users[i].coin -= price + commission
            users[0].coin += commission
            for (let j = 0; j < users.length; j++) {
                if (users[j].userId == mention) {
                    users[j].coin += price
                    fs.writeFileSync('./data/user.json', JSON.stringify(users))
                    msg.channel.send(`${users[i].userName}님이 ${users[j].userName}님에게 \`${price.toLocaleString('ko-KR')}원\`을 송금하셨습니다.
\`${users[i].userName}\`님의 자본금은 이제 \`${users[i].coin.toLocaleString('ko-KR')}원\`이며 \`${users[j].userName}\`님의 자본금은 이제 \`${users[j].coin.toLocaleString('ko-KR')}원\`입니다.
수수료 ${commis}% \`${commission.toLocaleString('ko-KR')}원\`
`)
                    return
                }
            }
            return msg.channel.send("멘션한 유저가 가입되지 않은 유저이거나 없는 유저입니다.")
        }
    }    
    return msg.channel.send("#가입을 통해 가입을 먼저 해주십시오.")
}

function commissionList(msg) {
    msg.channel.send(`
수수료 가격표
\`\`\`
50만원이하: 7%
50만원 초과 ~ 1000만원 이하: 3%
1000만원 초과 ~ 1억 이하: 1%
1억 초과 ~ 10억 이하: 0.1%
10억 초과: 0%
\`\`\`
`)
}

function saveMoney(msg, cmd) {
    const users = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    let idx = null
    
    for (let i = 0; i < users.length; i++) {
        if (msg.author.id === users[i].userId) {
            idx = i
            break
        }
    }
    
    if (users[idx].coin < cmd[2]) return msg.channel.send(`입금은 자본금인 [${users[idx].coin.toLocaleString('ko-KR')}]보다 많이 할 수 없습니다.`)
    
    users[idx].coin -= Number(cmd[2])
    users[idx].bank += Number(cmd[2])
    
    fs.writeFileSync("./data/user.json", JSON.stringify(users))
    msg.channel.send(`입금이 정상적으로 처리되었습니다.`)
}

function withDraw(msg, cmd) {
    const users = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    let idx = null
    
    for (let i = 0; i < users.length; i++) {
        if (msg.author.id === users[i].userId) {
            idx = i
            break
        }
    }
    
    if (idx === null) return msg.channel.send("[#가입]을 먼저 진행해 주십시오.")
    if (users[idx].bank < cmd[2]) return msg.channel.send(`출금은 입금된 잔고인 [${users[idx].coin.toLocaleString('ko-KR')}]보다 많이 할 수 없습니다.`)
    
    users[idx].coin += Number(cmd[2])
    users[idx].bank -= Number(cmd[2])
    
    fs.writeFileSync("./data/user.json", JSON.stringify(users))
    msg.channel.send(`입금이 정상적으로 처리되었습니다.`)
}

function showBankMoney(msg) {
    const users = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    let idx = null,
        creditRating = 0
    
    for (let i = 0; i < users.length; i++) {
        if (msg.author.id === users[i].userId) {
            idx = i
            break
        }
    }
    
    if (idx === null) return msg.channel.send("[#가입]을 먼저 진행해 주십시오.")
    if (users[idx].tax >= 100000000000000000n) creditRating = 10
    else if (users[idx].tax >= 10000000000000000n) creditRating = 9
    else if (users[idx].tax >= 1000000000000000) creditRating = 8
    else if (users[idx].tax >= 100000000000000) creditRating = 7
    else if (users[idx].tax >= 10000000000000) creditRating = 6
    else if (users[idx].tax >= 1000000000000) creditRating = 5
    else if (users[idx].tax >= 100000000000) creditRating = 4
    else if (users[idx].tax >= 10000000000) creditRating = 3
    else if (users[idx].tax >= 1000000000) creditRating = 2
    else if (users[idx].tax >= 100000000) creditRating = 1
    else creditRating = 0
    
    msg.channel.send(`고객님의 은행 잔고는 ${users[idx].bank.toLocaleString('ko-KR')}원 입니다.
신용 등급 [${creditRating}]단계    연속 세금 ${numberToKorean(users[idx].tax)}원 
`)
}

function loan(msg, cmd) {
    const users = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    let idx = null,
    creditRating = 0,
    //기본 대출 가능 금핵 천만원
    loanLimit = 10000000
    
    for (let i = 0; i < users.length; i++) {
        if (msg.author.id === users[i].userId) {
            idx = i
            break
        }
    }
    
    if (idx === null) return msg.channel.send("[#가입]을 먼저 진행해 주십시오.")
    if (users[idx].tax >= 100000000000000000n) creditRating = 10
    else if (users[idx].tax >= 10000000000000000n) creditRating = 9
    else if (users[idx].tax >= 1000000000000000) creditRating = 8
    else if (users[idx].tax >= 100000000000000) creditRating = 7
    else if (users[idx].tax >= 10000000000000) creditRating = 6
    else if (users[idx].tax >= 1000000000000) creditRating = 5
    else if (users[idx].tax >= 100000000000) creditRating = 4
    else if (users[idx].tax >= 10000000000) creditRating = 3
    else if (users[idx].tax >= 1000000000) creditRating = 2
    else if (users[idx].tax >= 100000000) creditRating = 1
    else creditRating = 0
    
    if (Number(cmd[2]) > creditRating || creditRating === 0) return msg.channel.send(`대출 한도를 다시 확인해 주세요. 신용등급[${creditRating}]`)
    
    const loanAmount = (creditRating ** 10) * loanLimit / 10
    users[idx].coin += loanAmount
    users[idx].tax = users[idx].tax - loanAmount

    fs.writeFileSync("./data/user.json", JSON.stringify(users))

    msg.channel.send(`대출을 성공적으로 받았습니다. 대출금 ${(loanAmount).toLocaleString("ko-KR")}원
자본금 ${users[idx].coin.toLocaleString("ko-KR")}    신용등급 ${creditRating}
`)
}

module.exports = (cmd, msg) => {
    if (cmd[0] === "송금" && cmd.length < 2) return commissionList(msg)
    
    switch(cmd[0]) {
        case "가입":
            signUp(msg)
        break
        case "ㄴ":
            myAccount(msg)
        break
        case "송금":
            donate(cmd, msg)
        break
    }
    if (cmd[0] === "은행") {
        switch(cmd[1]) {
            case "입금":
                saveMoney(msg, cmd)
                break
            case "출금":
                withDraw(msg, cmd)
                break
            case "통장":
                showBankMoney(msg)
                break
            case "대출":
                loan(msg, cmd)
                break
            case "한도":
                msg.channel.send(`\`\`\`
대출 한도입니다.
1단계 최대 1억
2단계 최대 10억
3단계 최대 100억
4단계 최대 100억
5단계 최대 1조
6단계 최대 10조
7단계 최대 100조
8단계 최대 100조
9단계 최대 1경
10단계 최대 10경
\`\`\`
`)
            
        }
    }
}