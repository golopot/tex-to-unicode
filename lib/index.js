const symbols = require('./symbols')
const {findNodesBetweenNodes} = require('./tree')
const parser = require('./parser')

function overlaps([a, b], [c, d]){
  return c <= a && a < d ||
    c <= b-1 && b-1 < d ||
    a <= c && c < b ||
    a <= d-1 && d-1 < b
}

function convertChunk(str, options = {}) {
  const noCurly = (x) => {

    const removeCurly = x => x[0] === '{' &&  x[x.length-1] === '}'
      ? removeCurly(x.slice(1, x.length-1))
      : x

    return removeCurly(x.replace(/ /g, ''))
  }

  const oneCurly = x => `{${noCurly(x)}}`

  if (/^\\mathbb/.test(str)) {
    return symbols[`\\mathbb${oneCurly(str.slice(7))}`] || str
  }
  if (/^\\mathfrak/.test(str)) {
    return symbols[`\\mathfrak${oneCurly(str.slice(9))}`] || str
  }
  if (/^\\not/.test(str)) {
    return symbols[`\\not${noCurly(str.slice(4))}`] || str
  }
  if (/^\^.+/.test(str) && options.subscripts) {
    return Array.from(noCurly(str.slice(1)))
      .map(x => symbols[`^${x}`] || '')
      .reduce((a, b) => a + b, '')
  }
  if (/^_.+/.test(str) && options.subscripts) {
    return Array.from(noCurly(str.slice(1)))
      .map(x => symbols[`_${x}`] || '')
      .reduce((a, b) => a + b, '')
  }
  if (/^\\[a-zA-Z]+$/.test(str)) {
    return symbols[str] || str
  }

  return str
}

function convertText(text, selectStart, selectEnd, options = {}) {

  selectEnd = Math.min(selectEnd, text.length)

  const chunkIndexes = parser.tryParse(text)
    .map((() => {
      let start = 0
      return (chunk) => {
        return [start, start += chunk.length]
      }
    })())
  let cursor = -1
  let result = ''
  for (let [start, end] of chunkIndexes){
    let chunk = text.slice(start, end)
    result +=
      overlaps([selectStart, selectEnd], [start, end])
        ? convertChunk(chunk, options)
        : chunk

    if (selectEnd > start && selectEnd <= end){
      cursor = /[\\_^]/.test(chunk[0])
        ? result.length
        : result.length - (end - selectEnd)
    }
  }

  if (cursor === -1) throw new Error('Cursor error')

  return {
    text: result,
    cursor,
  }
}

// Convert TeX in textarea or "contentEditable", and then set cursor
function convertInputable(element, options) {
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    let textarea = element
    let {selectionStart, selectionEnd} = textarea
    const {text, cursor} = convertText(textarea.value, selectionStart, selectionEnd, options)
    textarea.value = text
    textarea.selectStart = textarea.selectionEnd = cursor
  }
  // contenteditable elements: ex. Gmail message body.
  else if (element.contentEditable) {

    const selection = element.ownerDocument.getSelection()

    const nodesBetweenNodes = findNodesBetweenNodes(
      selection.anchorNode,
      selection.focusNode
    )

    const startNode = nodesBetweenNodes[0]
    const endNode = nodesBetweenNodes[nodesBetweenNodes.length - 1]

    const selectionIsForward = (
      startNode === selection.anchorNode &&
      selection.anchorOffset <= selection.focusOffset
    )

    const [startCursor, endCursor] = selectionIsForward
      ? [selection.anchorOffset, selection.focusOffset]
      : [selection.focusOffset, selection.anchorOffset]

    const TEXT_NODE_TYPE = 3
    let _cursor
    for (let node of nodesBetweenNodes) {
      if (node.nodeType === TEXT_NODE_TYPE) {
        const selectionStart = (node === nodesBetweenNodes[0])
          ? startCursor
          : 0
        const selectionEnd = (node === nodesBetweenNodes[nodesBetweenNodes.length-1])
          ? endCursor
          : node.nodeValue.length
        const {text, cursor} = convertText(node.nodeValue, selectionStart, selectionEnd, options)
        node.nodeValue = text
        _cursor = cursor
      }
    }

    selection.collapse(endNode, _cursor)
  }

}


module.exports = {
  parser,
  convertText,
  convertInputable,
}
