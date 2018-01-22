function overlaps([a,b], [c,d]){
  return c <= a && a < d ||
    c <= b-1 && b-1 < d ||
    a <= c && c < b ||
    a <= d-1 && d-1 < b
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

  let cursor = -1
  let result = ''
  for (let [start, end] of segments){
    let str = text.substring(start, end)
    result += symbols[str] && overlaps([selectStart, selectEnd], [start, end])
      ? symbols[str]
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
  translate
}
