const fs = require("fs")

module.exports = (cmd, msg) => {
    switch (cmd[1]) {
        case "구매":
            buyTicket(cmd, msg)
            break
        default: gambling(cmd, msg)
    }
}

function buyTicket(cmd, msg) {
    let users = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    let idx = undefined
    const ticketPrice = 1000
    const count = Number(cmd[2]) || ""
    
    for (let i = 0; i < users.length; i++) {
        if (users[i].userId === msg.author.id) idx = i
    }
    
    if (typeof idx !== "number") return msg.channel.send("#가입을 먼저해 주십시오.")
    if (typeof count !== "number") return msg.channel.send("수량을 다시 한번 확인해 주십시오.")
    if (count < 10 || count & 1 !== 0) return msg.channel.send("최소 구매 수량은 10개입니다.")
    if (users[idx].coin < ticketPrice * count) return msg.channel.send(`자본금이 부족합니다. 자본금 ${users[idx].coin}  티켓값 ${ticketPrice * count}`)
    
    users[idx].coin -= ticketPrice * count
    users[idx].gambleTicket += count
    users[0].coin += ticketPrice * count
    
    fs.writeFileSync("./data/user.json", JSON.stringify(users))
    msg.channel.send(`구매에 성공하였습니다. 보유 티켓 ${users[idx].gambleTicket}  자본금 ${users[idx].coin}`)
}

function gambling(cmd, msg) {
    const percentage = Number(cmd[1]) || null
    let users = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    if(typeof percentage !== "number" || percentage > 5 || percentage < 1) return msg.channel.send(`잘못된 단계입니다. 도박의 단계은 1 ~ 5단계까지 있습니다.
\`\`\`
1단계 x1.5 / 70%
2단계 x2 / 50%
3단계 x10 / 1%
4단계 x0 ~ x20 / 7%
5단계 x0 ~ x100,000 / 0.1%
\`\`\``)
    let idx = undefined
    for (let i = 0; i < users.length; i++) {
        if (users[i].userId == msg.author.id) idx = i
    }
    if (typeof idx !== "number") return msg.channel.send("가입되어있지 않은 계정입니다. \"#가입\"을 눌러 가입 후 이용하여 주십시오.")
    if (!Number(cmd[2]) || Number(cmd[2]) < 1) return msg.channel.send(`투입 금액을 다시 한번 확인해 주십시오.`)
    if (cmd[2] > users[idx].coin) return msg.channel.send(`자본금[${(users[idx].coin).toLocaleString('ko-KR')}]을 초과하는 금액은 사용 불가합니다.`)
    if (users[idx].gambleTicket < 1) return msg.channel.send(`티켓 구매 후 도박을 진행할 수 있습니다.`)
    users[idx].gambleTicket--
    
    switch(percentage) {
        case 1:
        users[idx] = gamble(cmd[2], 1.5, 70, users[idx], msg) || users[idx]
        break
        case 2:
        users[idx] = gamble(cmd[2], 2, 50, users[idx], msg) || users[idx]
        break
        case 3:
        users[idx] = gamble(cmd[2], 10, 1, users[idx], msg) || users[idx]
        break
        case 4:
        const x = Math.floor(Math.random() * 21)
        users[idx] = gamble(cmd[2], x, 7, users[idx], msg) || users[idx]
        break
        case 5:
        const z = Math.floor(Math.random() * 100000)
        users[idx] = gamble(cmd[2], z, 0.1, users[idx], msg) || users[idx]
        break
        default :
        msg.channel.send(`잘못된 단계입니다. 도박의 단계은 1 ~ 4단계까지 있습니다.\n
\`\`\`
1단계 x1.5 / 70%
2단계 x2 / 50%
3단계 x10 / 1%
4단계 x0 ~ x20 / 7%
5단계 x0 ~ x100,000 / 0.1%
\`\`\``)
        return
    }
    
    fs.writeFileSync("./data/user.json", JSON.stringify(users))
}

//도박의 성공 유무
function gamble(gameMoney, x, perc, user, msg) {
    const random = (Math.random() * 100).toFixed(2)
    user.coin -= gameMoney
    if(random < perc) {
        user.coin += Math.round(gameMoney * x)
        msg.channel.send(`도박에 성공하셨습니다!\n배율 ${x.toLocaleString('ko-KR')}, 투입 금액 ${gameMoney.toLocaleString('ko-KR')}, 받은 금액 ${Math.round(gameMoney * x).toLocaleString('ko-KR')}, 자본금 ${(user.coin).toLocaleString('ko-KR')}`)
        return user
    }
    msg.channel.send(`도박에 실패하셨습니다.\n배율 ${x.toLocaleString('ko-KR')}, 투입 금액 ${gameMoney.toLocaleString('ko-KR')}, 자본금 ${(user.coin).toLocaleString('ko-KR')}`)
    return undefined
}