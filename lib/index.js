const symbols = require('./symbols')
const {findNodesBetweenNodes} = require('./tree')

function overlaps([a,b], [c,d]){
  return c <= a && a < d ||
    c <= b-1 && b-1 < d ||
    a <= c && c < b ||
    a <= d-1 && d-1 < b
}

// Glue together "\\mathbb" and "{R}"
function mergeMacroWithArugment(text, segments){
  const mergedSegments = []
  let macro
  for (let [start, end] of segments){
    if (start === end) continue
    let str = text.substring(start, end)
    if (!macro){
      if (str === '\\not' || str === '\\mathbb' || str === '\\mathfrak'){
        macro = [start, end]
      }
      else {
        mergedSegments.push([start, end])
      }
    }
    else if (macro){
      if ( /^ *$/.test(str)) {
        continue
      }
      else if (str[0] === '\\') {
        mergedSegments.push([macro[0], end])
        macro = null
      }
      else if (/^ *{\w*}/.exec(str)) {
        let len = /^ *{\w*}/.exec(str)[0].length
        mergedSegments.push([macro[0], start + len])
        mergedSegments.push([start + len, end])
        macro = null
      }
      else{
        mergedSegments.push([macro[0], start+1])
        mergedSegments.push([start+1, end])
        macro = null
      }
    }
  }
  return mergedSegments
}

function normalizeMacro(str){
  const match = /(\\[a-zA-Z]+) *({.})/.exec(str)
    || /(\\not+) *(\\[a-zA-Z]+)/.exec(str)
  if (match){
    return match[1] + match[2]
  }
  else{
    return str
  }
}

function convertText(text, selectStart, selectEnd) {

  selectEnd = Math.min(selectEnd, text.length)

  const regexp = /\\[a-zA-Z]+/g
  const segments = []
  let loc = 0, match
  while ((match = regexp.exec(text)) !== null){
    segments.push([loc, match.index])
    segments.push([match.index, match.index + match[0].length])
    loc = match.index + match[0].length
  }
  segments.push([loc, text.length])

  const mergedSegments = mergeMacroWithArugment(text, segments)

  let cursor = -1
  let result = ''
  for (let [start, end] of mergedSegments){
    let str = text.substring(start, end)
    result += symbols[normalizeMacro(str)] && overlaps([selectStart, selectEnd], [start, end])
      ? symbols[normalizeMacro(str)]
      : str

    if (selectEnd > start && selectEnd <= end){
      cursor = text[start] === '\\'
        ? result.length
        : result.length - (end - selectEnd)
    }
  }

  if (cursor === -1) throw new Error('Cursor error')

  return {
    text: result,
    cursor: cursor
  }
}

// Convert TeX in textarea or "contentEditable", and then set cursor
function convertInputable(element) {
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    let textarea = element
    let {selectionStart, selectionEnd} = textarea
    const {text, cursor} = convertText(textarea.value, selectionStart, selectionEnd)
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
        const {text, cursor} = convertText(node.nodeValue, selectionStart, selectionEnd)
        node.nodeValue = text
        _cursor = cursor
      }
    }

    selection.collapse(endNode, _cursor)
  }

}


module.exports = {
  convertText,
  convertInputable,
}
