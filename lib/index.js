function overlaps([a,b], [c,d]){
  return c <= a && a < d ||
    c <= b-1 && b-1 < d ||
    a <= c && c < b ||
    a <= d-1 && d-1 < b
}

function _mergeMacroWithArgument(text, segments){
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

function translate(text, selectStart, selectEnd, symbols){
  if (symbols === undefined) throw new Error('Expect four arguments.')
  selectEnd = Math.min(selectEnd, text.length)
  if (selectStart > selectEnd) throw new Error('selectStart is bigger than selectEnd.')

  const regexp = /\\[a-zA-Z]+/g
  const segments = []
  let loc = 0, match
  while ((match = regexp.exec(text)) !== null){
    segments.push([loc, match.index])
    segments.push([match.index, match.index + match[0].length])
    loc = match.index + match[0].length
  }
  segments.push([loc, text.length])

  const mergedSegments = _mergeMacroWithArgument(text, segments)

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

module.exports = {
  translate,
  _mergeMacroWithArgument
}
