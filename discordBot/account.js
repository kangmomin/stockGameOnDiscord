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
    msg.channel.send("가입이 성공적으로 완료되었습니다. \n기본급 10만원이 지급됩니다.")
}

function myAccount(msg) {
    let users = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    let stocks = JSON.parse(fs.readFileSync("./data/stocks.json", 'utf-8'))
    let user
    for (users of users) {
        if (users.userId == msg.author) user = users
    }
    if (typeof user !== "object") return msg.channel.send("먼저 '#가입'을 통해 가입을 해주세요.")
    
    let embed = new Discord.MessageEmbed().setTitle(`${user.userName}주식 [${new Date().toLocaleTimeString()}]`)
    .setColor(0x00D8FF)
    .setDescription(`자본금 ${user.coin}원`)
    for (let i = 0; i < user.stock.length; i++) {
        let stock
        for (let j = 0; j < stocks.length; j++) if (user.stock[i].name === stocks[j].label) stock = stocks[j]
        if (user.stock[i].count >= 1) {
            const PorM = (stock.data.pop() * user.stock[i].count) - user.stock[i].principal
            let upDown
            if(PorM < 0) upDown = {simple:"-", emoji:"▼"}
            else if(PorM > 0) upDown = {simple:"+", emoji:"▲"}
            else upDown = {simple:"", emoji:""}
            embed.addFields({
                name: `> ${user.stock[i].name}`,
                value: `\`\`\`${user.stock[i].count}주\`\`\``,
                inline: true
            })
            embed.addFields({
                name: `손익`,
                inline: true,
                value: `\`\`\`diff
${upDown.simple} ${Math.abs(PorM)}원
\`\`\``,
            })
            embed.addFields({
                name: `원가`,
                inline: true,
                value: `\`\`\`${user.stock[i].principal}원\`\`\``,
            })
        }
    }

    msg.channel.send({embeds: [embed]})
}

module.exports = (cmd, msg) => {
    switch(cmd[0]) {
        case "가입":
            signUp(msg)
            break
        case "ㄴ":
            myAccount(msg)
            break
    }
}