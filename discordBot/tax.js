const fs = require('fs')

function CollectionTax() {
    const users = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    
    for (let i = 0; i < users.length; i++) {
        if (users[i].coin < 1000000000) {
            users[i].tax = 0
            continue
        }
        users[i].tax = users[i].coin / 100000

        // 10억 이상의 금액을 소유하고있으면 0.001%의 금액을 세금으로서 징수
        users[i].coin -= users[i].coin / 100000
    }
    
    fs.writeFileSync("./data/user.json", JSON.stringify(users))
}

module.exports = CollectionTax