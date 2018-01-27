const {translate} = require('./index')
const symbols = require('./symbols')

console.log(translate('\\not\\equiv', 0, 10, symbols))

console.log(symbols)
