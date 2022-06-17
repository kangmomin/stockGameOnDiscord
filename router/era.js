function era(cmd, msg) {
    const users = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    let idx = null
    
    for (let i = 0; i < users.length; i++) {
        if (msg.author.id === users[i].userId) {
            idx = i
            break
        }
    }

    if (idx === null) return msg.channel.send("[#가입]을 먼저 진행해 주십시오.")
    if (users[idx].coin < 100 && users[idx].bank < 0 && users[idx].era > 0) {
        for (let i = 0; i < users[idx].stock.length; i++) {
            if (users[idx].stock[i] > 0) return msg.channel.send("긴급구제신청이 불가합니다.")
        }
    } else {
        return msg.channel.send("긴급구제신청이 불가합니다.")
    }

    users[idx].coin += 10000000
    users[idx].era--
    fs.writeFileSync("./data/user.json", JSON.stringify(users))
    msg.channel.send("긴급구제신청이 받아드려졌습니다. [#ㄴ]을 통해 자본금을 확인해주세요.")
}

module.exports = {
    era
}