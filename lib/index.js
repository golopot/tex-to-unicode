const symbols = require('./symbols');
const {findNodesBetweenNodes} = require('./tree');
const parser = require('./parser');

/**
 * @typedef {{subscripts?: boolean}} Options
 */

/**
 * Check if two interval overlaps.
 *
 * @param {[number, number]} i
 * @param {[number, number]} j
 * @returns {boolean}
 */
function overlaps([a, b], [c, d]) {
  return (
    (c <= a && a < d) ||
    (c <= b - 1 && b - 1 < d) ||
    (a <= c && c < b) ||
    (a <= d - 1 && d - 1 < b)
  );
}

/** @param {string} s */
function debrackets(s) {
  s = s.trim();
  if (s[0] === '{' && s[s.length - 1] === '}') {
    return debrackets(s.slice(1, s.length - 1));
  }
  return s;
}

/**
 * @param {string} source
 * @param {any} node
 * @returns {string}
 */
function printSource(source, node) {
  return source.slice(node.start, node.end);
}

/**
 * @param {string} source
 * @param {any} node
 * @param {Options} options
 * @returns {string}
 */
function printNode(source, node, options = {}) {
  switch (node.type) {
    case 'PlainText':
    case 'CurlyGroup': {
      return printSource(source, node);
    }
    case 'UnaryMacro': {
      const arugmentText = printSource(source, node.argument);

      const key =
        node.macro === '\\not'
          ? `${node.macro}${debrackets(arugmentText)}`
          : `${node.macro}{${debrackets(arugmentText)}}`;

      return symbols[key] || printSource(source, node);
    }
    case 'NullaryMacro': {
      return symbols[node.macro] || printSource(source, node);
    }
    case 'Subscript':
    case 'Superscript': {
      if (!options.subscripts) {
        return printSource(source, node);
      }

      let r = '';
      for (const c of debrackets(node.content)) {
        const h = node.type === 'Subscript' ? '_' : '^';
        const v = symbols[`${h}${c}`];
        if (v === undefined) {
          return printSource(source, node);
        }
        r += v;
      }
      return r;
    }
  }

  console.error(node);
  throw new Error('unhandled case');
}

function print(source, ast, selectStart, selectEnd, options = {}) {
  const nodes = ast.body;
  let cursor = -1;
  let output = '';
  for (const node of nodes) {
    if (overlaps([selectStart, selectEnd], [node.start, node.end])) {
      output += printNode(source, node, options);
    } else {
      output += source.slice(node.start, node.end);
    }

    if (node.start < selectEnd && selectEnd <= node.end) {
      cursor =
        node.type !== 'PlainText'
          ? output.length
          : output.length - (node.end - selectEnd);
    }
  }

  return {
    text: output,
    cursor,
  };
}

/**
 * @param {string} text
 * @param {number} selectStart
 * @param {number} selectEnd
 * @param {Options} options
 * @returns {{
 *  text: string,
 *  cursor: number,
 * }}
 */
function convertText(text, selectStart, selectEnd, options = {}) {
  selectEnd = Math.min(selectEnd, text.length);
  // The parser is not supposed to throw error by design.
  const ast = parser.tryParse(text);
  return print(text, ast, selectStart, selectEnd, options);
}

/**
 * Convert TeX in textarea or "contentEditable", and then set cursor.
 *
 * @param {HTMLElement} element
 * @param {Options} options
 * @returns {void}
 */
function convertInputable(element, options) {
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    const /** @type {any} */ textarea = element;
    const {selectionStart, selectionEnd} = textarea;
    const {text, cursor} = convertText(
      textarea.value,
      selectionStart,
      selectionEnd,
      options
    );
    textarea.select();
    element.ownerDocument.execCommand('insertText', false, text);
    textarea.selectStart = textarea.selectionEnd = cursor;
  }
  // contenteditable elements: ex. Gmail message body.
  else if (element.contentEditable) {
    const selection = element.ownerDocument.getSelection();
    if (!selection) {
      return;
    }
    const nodesBetweenNodes = findNodesBetweenNodes(
      selection.anchorNode,
      selection.focusNode
    );

    const [startNode] = nodesBetweenNodes;
    const endNode = nodesBetweenNodes[nodesBetweenNodes.length - 1];

    const selectionIsForward =
      startNode === selection.anchorNode &&
      selection.anchorOffset <= selection.focusOffset;

    const [startCursor, endCursor] = selectionIsForward
      ? [selection.anchorOffset, selection.focusOffset]
      : [selection.focusOffset, selection.anchorOffset];

    const TEXT_NODE_TYPE = 3;
    let _cursor;
    for (const node of nodesBetweenNodes) {
      if (node.nodeType === TEXT_NODE_TYPE) {
        const selectionStart = node === nodesBetweenNodes[0] ? startCursor : 0;
        const selectionEnd =
          node === nodesBetweenNodes[nodesBetweenNodes.length - 1]
            ? endCursor
            : node.nodeValue.length;
        const {text, cursor} = convertText(
          node.nodeValue,
          selectionStart,
          selectionEnd,
          options
        );
        node.nodeValue = text;
        _cursor = cursor;
      }
    }

    selection.collapse(endNode, _cursor);
  }
}

module.exports = {
  parser,
  convertText,
  convertInputable,
};
