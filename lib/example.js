const {translate} = require('./index')
const symbols = require('./symbols')
console.log(translate('\\alpha is big, \\beta is small', 0, 10, symbols))
