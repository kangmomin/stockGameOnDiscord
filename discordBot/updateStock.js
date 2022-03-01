const fs = require('fs')

function getNewStock(last) {
    let x = last > 12000 ? 4 : 3
    if (last > 15000) x = 5
    if (last > 17000) x = 6
    if (last > 20000) x = 10
    
    const PorMrandom = Math.floor((Math.random() * x))
    if(PorMrandom === 2) {
        let random = Math.ceil(Math.random() * 500)
        if (random > 499) random = Math.ceil(Math.random() * 1500)
        else if(random > 350) random = Math.ceil(Math.random() * 500)
        return last + random
    } else if (PorMrandom === 0) {
        return last
    } else if (PorMrandom > 2 || PorMrandom === 1) {
        if (last < 1) return 0
        let random = Math.ceil(Math.random() * -700)
        if (Math.ceil(Math.random() * 100000) === 1) return 0
        if (random < -699) random = Math.ceil(Math.random() * -3000)
        else if (random < -650) random = Math.ceil(Math.random() * -2000)
        else if(random < -400) random = Math.ceil(Math.random() * -800)
        return last + random
    }     
}
module.exports = () => {
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
        
        stocks[i].data.shift()
        stocks[i].date.shift()
    }
    fs.writeFileSync("./data/stocks.json", JSON.stringify(stocks))
    fs.writeFileSync("./data/user.json", JSON.stringify(user))
    return stocks
}