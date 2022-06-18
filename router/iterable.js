const fs = require('fs')

function collectionTax() {
    const users = JSON.parse(fs.readFileSync("./data/user.json", 'utf-8'))
    
    for (let i = 0; i < users.length; i++) {
        if (users[i].coin < 1000000000) {
            users[i].tax -= 10000000
            if (users[i].tax < 0) users[i].tax = 0
            continue
        }
        users[i].tax += Math.round(users[i].coin / 50000)

        // 10억 이상의 금액을 소유하고있으면 0.001%의 금액을 세금으로서 징수
        users[i].coin -= Math.round(users[i].coin / 50000)
    }
    
    fs.writeFileSync("./data/user.json", JSON.stringify(users))
}

function getNewStock(last) {
    let x = last > 12000 ? 4 : 3
    if (last > 15000) x = 5
    if (last > 17000) x = 6
    if (last > 20000) x = 10
    
    const PorMrandom = Math.floor((Math.random() * x))
    if(PorMrandom === 1) {
        let random = Math.ceil(Math.random() * 500)
        if (random > 490) random = Math.ceil(Math.random() * 1500)
        return last + random
    } else if (PorMrandom === 0) {
        return last
    } else {
        if (last < 1) return 0
        let random = Math.ceil(Math.random() * -700)
        if (Math.ceil(Math.random() * 100000) === 1) return 0
        else if(random < -400) random = Math.ceil(Math.random() * -800)
        if (last + random === 0) random = Math.ceil(Math.random() * 100)
        return last + random
    }
}

function updateStock() {
    let stocks = JSON.parse(fs.readFileSync("./data/stocks.json", "utf-8"))
    let user = JSON.parse(fs.readFileSync("./data/user.json", "utf-8"))
    const Day = new Date()
    const date = Day.getHours() + ":" + Day.getMinutes()
    
    for (let i = 0; i < stocks.length; i++) {
        const newPrice = getNewStock(stocks[i].data[stocks[i].data.length - 1])
        if (newPrice < 1) {
            stocks[i].data.push(0)
            for (let j = 0; j < user.length; j++) {
                for(let k = 0; k < user[j].stock.length; k++) {
                    if (user[j].stock[k].name == stocks[i].label) {
                        user[j].stock[k].count = 0
                        user[j].stock[k].principal = 0
                    }
                }
            }
        }
        else stocks[i].data.push(newPrice)
        stocks[i].date.push(date)
    }
    fs.writeFileSync("./data/stocks.json", JSON.stringify(stocks))
    fs.writeFileSync("./data/user.json", JSON.stringify(user))
    return stocks
}

function interest() {
    let user = JSON.parse(fs.readFileSync("./data/user.json", "utf-8"))
    
    for (let i = 0; i < user.length; i++) {
        user[i].bank += Math.round(user[i].bank/1000000)
    }

    fs.writeFileSync("./data/user.json", JSON.stringify(user))
}

module.exports = {
    collectionTax,
    updateStock,
    interest
}