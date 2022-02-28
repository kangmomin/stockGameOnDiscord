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
        coin: 100000,
        stock: []
    })
    
    fs.writeFileSync("./data/user.json", JSON.stringify(user))
    msg.channel.send("가입이 성공적으로 완료되었습니다. \n기본급 10만원이 지급됩니다.\n#설명서를 이용하여 명령어를 확인할 수 있습니다.")
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
                value: `\`\`\`${(user.stock[i].principal / user.stock[i].count).toLocaleString('ko-KR')}원\`\`\``,
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
    
    const commission = 100000000 <= price ? 0 : Math.round(price * 0.07)
    
    for (let i = 0; i < users.length; i++) {
        if (users[i].userId === msg.author.id) {
            if (users[i].coin < price + commission) return msg.channel.send(`송금액이 자본금보다 많습니다. \n자본금 \`${users[i].coin}\` 수수료 \`${commission}\``)
            
            users[i].coin -= price + commission
            for (let j = 0; j < users.length; j++) {
                if (users[j].userId == mention) {
                    users[j].coin += price
                    fs.writeFileSync('./data/user.json', JSON.stringify(users))
                    msg.channel.send(`${users[i].userName}님이 ${users[j].userName}님에게 \`${price.toLocaleString('ko-KR')}원\`을 송금하셨습니다.
\`${users[i].userName}\`님의 자본금은 이제 \`${users[i].coin.toLocaleString('ko-KR')}원\`이며 \`${users[j].userName}\`님의 자본금은 이제 \`${users[j].coin.toLocaleString('ko-KR')}원\`입니다.
수수료 ${commission === 0 ? 0 : 7}% \`${commission.toLocaleString('ko-KR')}원\`
`)
                    return
                }
            }
            return msg.channel.send("멘션한 유저가 가입되지 않은 유저이거나 없는 유저입니다.")
        }
    }    
    return msg.channel.send("#가입을 통해 가입을 먼저 해주십시오.")
}

module.exports = (cmd, msg) => {
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
}