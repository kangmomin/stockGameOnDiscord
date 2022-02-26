const fs = require("fs")

module.exports = (cmd, msg) => {
    const percentage = Number(cmd[1]) || null
    let users = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    if(typeof percentage !== "number" || percentage > 5 || percentage < 1) return msg.channel.send("잘못된 명령어 입니다.\n#도박 1 ~ 4 도박 금액")
    let idx = undefined
    for (let i = 0; i < users.length; i++) {
        if (users[i].userId == msg.author.id) idx = i
    }
    if (typeof idx !== "number") return msg.channel.send("가입되어있지 않은 계정입니다. \"#가입\"을 눌러 가입 후 이용하여 주십시오.")
    if (cmd[2] > users[idx]) return msg.channel.send(`자본금[${users[idx].coin}]을 초과하는 금액은 사용 불가합니다.`)
    
    switch(percentage) {
        case 1:
        users[idx] = gamble(cmd[2], 1.3, 70, users[idx], msg) || users[idx]
        break
        case 2:
        users[idx] = gamble(cmd[2], 2, 50, users[idx], msg) || users[idx]
        break
        case 3:
        users[idx] = gamble(cmd[2], 10, 1, users[idx], msg) || users[idx]
        break
        case 4:
        const x = Math.floor(Math.random() * 21)
        users[idx] = gamble(cmd[2], x, 30, users[idx], msg) || users[idx]
        break
        default :
        msg.channel.send("잘못된 단계입니다. 도박의 단계은 1 ~ 4단계까지 있습니다.")
        return
    }
    
    fs.writeFileSync("./data/user.json", JSON.stringify(users))
}

//도박의 성공 유무
function gamble(gameMoney, x, perc, user, msg) {
    const random = Math.floor(Math.random() * 100)
    user.coin -= gameMoney
    if(random < perc) {
        user.coin += Math.round(gameMoney * x)
        msg.channel.send(`도박에 성공하셨습니다!\n배율 ${x}, 투입 금액 ${gameMoney}, 받은 금액 ${Math.round(gameMoney * x)}, 자본금 ${user.coin}`)
        return user
    }
    msg.channel.send(`도박에 실패하셨습니다.\n배율 ${x}, 투입 금액 ${gameMoney}, 자본금 ${user.coin}`)
    return undefined
}