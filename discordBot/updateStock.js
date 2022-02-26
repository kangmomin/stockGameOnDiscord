const fs = require('fs')

function getNewStock(last) {
    if((Math.random() * 2) > 1) {
        let random = Math.ceil(Math.random() * 700)
        if(random > 400) random = Math.ceil(Math.random() * 700)
        return last + random
    } else {
        if (last < 1) return 0
        let random = Math.ceil(Math.random() * -700)
        if(random < -400) random = Math.ceil(Math.random() * -700)
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