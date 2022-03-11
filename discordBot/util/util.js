function numberToKorean(number){
    if (number == 0) return 0

    let inputNumber  = number < 0 ? false : number;
    let unitWords    = ['', '만', '억', '조', '경', '해', '자'];
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

module.exports = {
    numberToKorean
}