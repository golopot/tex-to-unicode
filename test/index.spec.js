/* eslint-env jest */

const {translate} = require('../lib/index')
const symbols = require('../lib/symbols')

describe('translate', () => {
  test('Only translate selected parts', () => {
    const result = translate('a \\alpha, b \\beta', 0, 4, symbols)
    expect(result).toEqual({text: 'a α, b \\beta', cursor: 3})
  })

  test('Plays well with non-translatable macros', () => {
    expect(translate('\\frac{\\alpha}{\\beta}', 0, 20, symbols))
      .toEqual({text: '\\frac{α}{β}', cursor: 11})
  })

  test('Translate \\mathbb', () =>{
    expect(translate('a \\in \\mathbb{R}', 0, 16, symbols))
      .toEqual({text: 'a ∈ ℝ', cursor: 5})
  })

  test('Transalte \\not', () => {
    expect(translate('\\not\\equiv', 10, 10, symbols))
      .toEqual({text: '≢', cursor: 1})
  })
})
