/* eslint-env jest */

const {convertText, convertInputable} = require('../lib/index')
const tree = require('../lib/tree')

describe('convertText', () => {
  test('Only convert selected parts', () => {
    const result = convertText('a \\alpha, b \\beta', 0, 4)
    expect(result).toEqual({text: 'a α, b \\beta', cursor: 3})
  })

  test('Plays well with non-convertible macros', () => {
    expect(convertText('\\frac{\\alpha}{\\beta}', 0, 20))
      .toEqual({text: '\\frac{α}{β}', cursor: 11})
  })

  test('Convert \\mathbb', () =>{
    expect(convertText('a \\in \\mathbb{R}', 0, 16))
      .toEqual({text: 'a ∈ ℝ', cursor: 5})
  })

  test('Convert \\not', () => {
    expect(convertText('\\not\\equiv', 10, 10))
      .toEqual({text: '≢', cursor: 1})
  })
})

describe('Tree algorithms', () => {

  const Node = function() {
    const res = {childNodes: Array.from(arguments)}
    for (let node of arguments) {
      node.parentNode = res
    }
    return res
  }

  test('findNodesBetweenNodes', () => {
    const u = {nodeValue: 'u'}
    const v = {nodeValue: 'v'}

    Node(
      Node(
        u,
        Node()
      ),
      Node(),
      Node(
        Node(),
        v
      )
    )

    const nodes = tree.findNodesBetweenNodes(u, v)

    expect(nodes)
      .toHaveLength(6)

    expect(nodes[0])
      .toBe(u)

    expect(nodes[5])
      .toBe(v)

  })

  test('findLowestCommonAncestor', () => {
    const u = {nodeValue: 'u'}
    const v = {nodeValue: 'v'}

    const node = Node(
      Node(u),
      Node(
        Node(v)
      )
    )

    expect(tree.findLowestCommonAncestor(u, v))
      .toBe(node)
  })
})

describe('DOM test', () => {
  test('convert text in textarea', () => {
    document.body.innerHTML = `
      <textarea>\\alpha \\to \\beta</textarea>
    `
    const textarea = document.querySelector('textarea')
    textarea.select()
    convertInputable(textarea)
    expect(textarea.value)
      .toBe('α → β')
  })

  // Not testable because jsdom didn't implement document.getSelection()
  test.skip('convert text in contenteditable', () => {
    document.body.innerHTML = `
      <div contenteditable='true'>
        <div>\\alpha \\to </div>
        <div>\\beta</div>
      </div>
    `
  })
})
