var TexToUnicode;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const symbols = __webpack_require__(1);
const {findNodesBetweenNodes} = __webpack_require__(2);
const parser = __webpack_require__(3);

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
  symbols,
  convertText,
  convertInputable,
};


/***/ }),
/* 1 */
/***/ ((module) => {

const symbols = {
  '\\Alpha': 'Α',
  '\\Beta': 'Β',
  '\\Gamma': 'Γ',
  '\\Delta': 'Δ',
  '\\Epsilon': 'Ε',
  '\\Zeta': 'Ζ',
  '\\Eta': 'Η',
  '\\Theta': 'Θ',
  '\\Iota': 'I',
  '\\Kappa': 'Κ',
  '\\Lambda': 'Λ',
  '\\Mu': 'Μ',
  '\\Nu': 'Ν',
  '\\Xi': 'Ξ',
  '\\Omicron': 'Ο',
  '\\Pi': 'Π',
  '\\Rho': 'Ρ',
  '\\Sigma': 'Σ',
  '\\Tau': 'Τ',
  '\\Upsilon': 'Υ',
  '\\Phi': 'Φ',
  '\\Chi': 'Χ',
  '\\Psi': 'Ψ',
  '\\Omega': 'Ω',

  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\epsilon': 'ϵ',
  '\\zeta': 'ζ',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\iota': 'ι',
  '\\kappa': 'κ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\nu': 'ν',
  '\\xi': 'ξ',
  '\\omicron': 'ο',
  '\\pi': 'π',
  '\\rho': 'ρ',
  '\\sigma': 'σ',
  '\\tau': 'τ',
  '\\upsilon': 'υ',
  '\\phi': 'ϕ',
  '\\chi': 'χ',
  '\\psi': 'ψ',
  '\\omega': 'ω',

  '\\varepsilon': 'ε',
  '\\varnothing': '∅',
  '\\varkappa': 'ϰ',
  '\\varphi': 'φ',
  '\\varpi': 'ϖ',
  '\\varrho': 'ϱ',
  '\\varsigma': 'ς',
  '\\vartheta': 'ϑ',
  '\\neq': '≠',
  '\\equiv': '≡',
  '\\not\\equiv': '≢',
  '\\leq': '≤',
  '\\geq': '≥',
  '\\leqq': '≦',
  '\\geqq': '≧',
  '\\lneqq': '≨',
  '\\gneqq': '≩',
  '\\leqslant': '⩽',
  '\\geqslant': '⩾',
  '\\ll': '≪',
  '\\gg': '≫',
  '\\nless': '≮',
  '\\ngtr': '≯',
  '\\nleq': '≰',
  '\\ngeq': '≱',
  '\\lessequivlnt': '≲',
  '\\greaterequivlnt': '≳',
  '\\prec': '≺',
  '\\succ': '≻',
  '\\preccurlyeq': '≼',
  '\\succcurlyeq': '≽',
  '\\precapprox': '≾',
  '\\succapprox': '≿',
  '\\nprec': '⊀',
  '\\nsucc': '⊁',
  '\\sim': '∼',
  '\\not\\sim': '≁',
  '\\simeq': '≃',
  '\\not\\simeq': '≄',
  '\\backsim': '∽',
  '\\lazysinv': '∾',
  '\\wr': '≀',
  '\\cong': '≅',
  '\\not\\cong': '≇',
  '\\approx': '≈',
  '\\not\\approx': '≉',
  '\\approxeq': '≊',
  '\\approxnotequal': '≆',
  '\\tildetrpl': '≋',
  '\\allequal': '≌',
  '\\asymp': '≍',
  '\\doteq': '≐',
  '\\doteqdot': '≑',
  '\\lneq': '⪇',
  '\\gneq': '⪈',
  '\\preceq': '⪯',
  '\\succeq': '⪰',
  '\\precneqq': '⪵',
  '\\succneqq': '⪶',
  '\\emptyset': '∅',
  '\\in': '∈',
  '\\notin': '∉',
  '\\not\\in': '∉',
  '\\ni': '∋',
  '\\not\\ni': '∌',
  '\\subset': '⊂',
  '\\subseteq': '⊆',
  '\\not\\subset': '⊄',
  '\\not\\subseteq': '⊈',
  '\\supset': '⊃',
  '\\supseteq': '⊇',
  '\\not\\supset': '⊅',
  '\\not\\supseteq': '⊉',
  '\\subsetneq': '⊊',
  '\\supsetneq': '⊋',
  '\\exists': '∃',
  '\\nexists': '∄',
  '\\not\\exists': '∄',
  '\\forall': '∀',
  '\\aleph': 'ℵ',
  '\\beth': 'ℶ',
  '\\neg': '¬',
  '\\wedge': '∧',
  '\\vee': '∨',
  '\\veebar': '⊻',
  '\\land': '∧',
  '\\lor': '∨',
  '\\top': '⊤',
  '\\bot': '⊥',
  '\\cup': '∪',
  '\\cap': '∩',
  '\\bigcup': '⋃',
  '\\bigcap': '⋂',
  '\\setminus': '∖',
  '\\therefore': '∴',
  '\\because': '∵',
  '\\Box': '□',
  '\\models': '⊨',
  '\\vdash': '⊢',

  '\\rightarrow': '→',
  '\\Rightarrow': '⇒',
  '\\leftarrow': '←',
  '\\Leftarrow': '⇐',
  '\\uparrow': '↑',
  '\\Uparrow': '⇑',
  '\\downarrow': '↓',
  '\\Downarrow': '⇓',
  '\\nwarrow': '↖',
  '\\nearrow': '↗',
  '\\searrow': '↘',
  '\\swarrow': '↙',
  '\\mapsto': '↦',
  '\\to': '→',
  '\\leftrightarrow': '↔',
  '\\hookleftarrow': '↩',
  '\\Leftrightarrow': '⇔',
  '\\rightarrowtail': '↣',
  '\\leftarrowtail': '↢',
  '\\twoheadrightarrow': '↠',
  '\\twoheadleftarrow': '↞',
  '\\hookrightarrow': '↪',
  '\\rightsquigarrow': '⇝',
  '\\rightleftharpoons': '⇌',
  '\\leftrightharpoons': '⇋',
  '\\rightharpoonup': '⇀',
  '\\rightharpoondown': '⇁',

  '\\times': '×',
  '\\div': '÷',
  '\\infty': '∞',
  '\\nabla': '∇',
  '\\partial': '∂',
  '\\sum': '∑',
  '\\prod': '∏',
  '\\coprod': '∐',
  '\\int': '∫',
  '\\iint': '∬',
  '\\iiint': '∭',
  '\\iiiint': '⨌',
  '\\oint': '∮',
  '\\surfintegral': '∯',
  '\\volintegral': '∰',
  '\\Re': 'ℜ',
  '\\Im': 'ℑ',
  '\\wp': '℘',
  '\\mp': '∓',
  '\\langle': '⟨',
  '\\rangle': '⟩',
  '\\lfloor': '⌊',
  '\\rfloor': '⌋',
  '\\lceil': '⌈',
  '\\rceil': '⌉',
  '\\|': '‖',

  '\\mathbb{a}': '𝕒',
  '\\mathbb{A}': '𝔸',
  '\\mathbb{b}': '𝕓',
  '\\mathbb{B}': '𝔹',
  '\\mathbb{c}': '𝕔',
  '\\mathbb{C}': 'ℂ',
  '\\mathbb{d}': '𝕕',
  '\\mathbb{D}': '𝔻',
  '\\mathbb{e}': '𝕖',
  '\\mathbb{E}': '𝔼',
  '\\mathbb{f}': '𝕗',
  '\\mathbb{F}': '𝔽',
  '\\mathbb{g}': '𝕘',
  '\\mathbb{G}': '𝔾',
  '\\mathbb{h}': '𝕙',
  '\\mathbb{H}': 'ℍ',
  '\\mathbb{i}': '𝕚',
  '\\mathbb{I}': '𝕀',
  '\\mathbb{j}': '𝕛',
  '\\mathbb{J}': '𝕁',
  '\\mathbb{k}': '𝕜',
  '\\mathbb{K}': '𝕂',
  '\\mathbb{l}': '𝕝',
  '\\mathbb{L}': '𝕃',
  '\\mathbb{m}': '𝕞',
  '\\mathbb{M}': '𝕄',
  '\\mathbb{n}': '𝕟',
  '\\mathbb{N}': 'ℕ',
  '\\mathbb{o}': '𝕠',
  '\\mathbb{O}': '𝕆',
  '\\mathbb{p}': '𝕡',
  '\\mathbb{P}': 'ℙ',
  '\\mathbb{q}': '𝕢',
  '\\mathbb{Q}': 'ℚ',
  '\\mathbb{r}': '𝕣',
  '\\mathbb{R}': 'ℝ',
  '\\mathbb{s}': '𝕤',
  '\\mathbb{S}': '𝕊',
  '\\mathbb{t}': '𝕥',
  '\\mathbb{T}': '𝕋',
  '\\mathbb{u}': '𝕦',
  '\\mathbb{U}': '𝕌',
  '\\mathbb{v}': '𝕧',
  '\\mathbb{V}': '𝕍',
  '\\mathbb{x}': '𝕩',
  '\\mathbb{X}': '𝕏',
  '\\mathbb{y}': '𝕪',
  '\\mathbb{Y}': '𝕐',
  '\\mathbb{z}': '𝕫',
  '\\mathbb{Z}': 'ℤ',
  '\\mathbb{0}': '𝟘',
  '\\mathbb{1}': '𝟙',
  '\\mathbb{2}': '𝟚',
  '\\mathbb{3}': '𝟛',
  '\\mathbb{4}': '𝟜',
  '\\mathbb{5}': '𝟝',
  '\\mathbb{6}': '𝟞',
  '\\mathbb{7}': '𝟟',
  '\\mathbb{8}': '𝟠',
  '\\mathbb{9}': '𝟡',

  '\\mathfrak{a}': '𝔞',
  '\\mathfrak{A}': '𝔄',
  '\\mathfrak{b}': '𝔟',
  '\\mathfrak{B}': '𝔅',
  '\\mathfrak{c}': '𝔠',
  '\\mathfrak{C}': 'ℭ',
  '\\mathfrak{d}': '𝔡',
  '\\mathfrak{D}': '𝔇',
  '\\mathfrak{e}': '𝔢',
  '\\mathfrak{E}': '𝔈',
  '\\mathfrak{f}': '𝔣',
  '\\mathfrak{F}': '𝔉',
  '\\mathfrak{g}': '𝔤',
  '\\mathfrak{G}': '𝔊',
  '\\mathfrak{h}': '𝔥',
  '\\mathfrak{H}': 'ℌ',
  '\\mathfrak{i}': '𝔦',
  '\\mathfrak{I}': 'ℑ',
  '\\mathfrak{j}': '𝔧',
  '\\mathfrak{J}': '𝔍',
  '\\mathfrak{k}': '𝔨',
  '\\mathfrak{K}': '𝔎',
  '\\mathfrak{l}': '𝔩',
  '\\mathfrak{L}': '𝔏',
  '\\mathfrak{m}': '𝔪',
  '\\mathfrak{M}': '𝔐',
  '\\mathfrak{n}': '𝔫',
  '\\mathfrak{N}': '𝔑',
  '\\mathfrak{o}': '𝔬',
  '\\mathfrak{O}': '𝔒',
  '\\mathfrak{p}': '𝔭',
  '\\mathfrak{P}': '𝔓',
  '\\mathfrak{q}': '𝔮',
  '\\mathfrak{Q}': '𝔔',
  '\\mathfrak{r}': '𝔯',
  '\\mathfrak{R}': 'ℜ',
  '\\mathfrak{s}': '𝔰',
  '\\mathfrak{S}': '𝔖',
  '\\mathfrak{t}': '𝔱',
  '\\mathfrak{T}': '𝔗',
  '\\mathfrak{u}': '𝔲',
  '\\mathfrak{U}': '𝔘',
  '\\mathfrak{v}': '𝔳',
  '\\mathfrak{V}': '𝔙',
  '\\mathfrak{x}': '𝔵',
  '\\mathfrak{X}': '𝔛',
  '\\mathfrak{y}': '𝔶',
  '\\mathfrak{Y}': '𝔜',
  '\\mathfrak{z}': '𝔷',
  '\\mathfrak{Z}': 'ℨ',

  '\\mathcal{a}': '𝒶',
  '\\mathcal{A}': '𝒜',
  '\\mathcal{b}': '𝒷',
  '\\mathcal{B}': 'ℬ',
  '\\mathcal{c}': '𝒸',
  '\\mathcal{C}': '𝒞',
  '\\mathcal{d}': '𝒹',
  '\\mathcal{D}': '𝒟',
  '\\mathcal{e}': 'ℯ',
  '\\mathcal{E}': 'ℰ',
  '\\mathcal{f}': '𝒻',
  '\\mathcal{F}': 'ℱ',
  '\\mathcal{g}': 'ℊ',
  '\\mathcal{G}': '𝒢',
  '\\mathcal{h}': '𝒽',
  '\\mathcal{H}': 'ℋ',
  '\\mathcal{i}': '𝒾',
  '\\mathcal{I}': 'ℐ',
  '\\mathcal{j}': '𝒿',
  '\\mathcal{J}': '𝒥',
  '\\mathcal{k}': '𝓀',
  '\\mathcal{K}': '𝒦',
  '\\mathcal{l}': '𝓁',
  '\\mathcal{L}': 'ℒ',
  '\\mathcal{m}': '𝓂',
  '\\mathcal{M}': 'ℳ',
  '\\mathcal{n}': '𝓃',
  '\\mathcal{N}': '𝒩',
  '\\mathcal{o}': 'ℴ',
  '\\mathcal{O}': '𝒪',
  '\\mathcal{p}': '𝓅',
  '\\mathcal{P}': '𝒫',
  '\\mathcal{q}': '𝓆',
  '\\mathcal{Q}': '𝒬',
  '\\mathcal{r}': '𝓇',
  '\\mathcal{R}': 'ℛ',
  '\\mathcal{s}': '𝓈',
  '\\mathcal{S}': '𝒮',
  '\\mathcal{t}': '𝓉',
  '\\mathcal{T}': '𝒯',
  '\\mathcal{u}': '𝓊',
  '\\mathcal{U}': '𝒰',
  '\\mathcal{v}': '𝓋',
  '\\mathcal{V}': '𝒱',
  '\\mathcal{w}': '𝓌',
  '\\mathcal{W}': '𝒲',
  '\\mathcal{x}': '𝓍',
  '\\mathcal{X}': '𝒳',
  '\\mathcal{y}': '𝓎',
  '\\mathcal{Y}': '𝒴',
  '\\mathcal{z}': '𝓏',
  '\\mathcal{Z}': '𝒵',

  _0: '₀',
  _1: '₁',
  _2: '₂',
  _3: '₃',
  _4: '₄',
  _5: '₅',
  _6: '₆',
  _7: '₇',
  _8: '₈',
  _9: '₉',
  '^0': '⁰',
  '^1': '¹',
  '^2': '²',
  '^3': '³',
  '^4': '⁴',
  '^5': '⁵',
  '^6': '⁶',
  '^7': '⁷',
  '^8': '⁸',
  '^9': '⁹',

  '_+': '₊',
  '_-': '₋',
  '_(': '₍',
  '_)': '₎',
  '^+': '⁺',
  '^-': '⁻',
  '^(': '⁽',
  '^)': '⁾',

  _a: 'ₐ',
  _e: 'ₑ',
  _h: 'ₕ',
  _i: 'ᵢ',
  _j: 'ⱼ',
  _k: 'ₖ',
  _l: 'ₗ',
  _m: 'ₘ',
  _n: 'ₙ',
  _o: 'ₒ',
  _p: 'ₚ',
  _r: 'ᵣ',
  _s: 'ₛ',
  _t: 'ₜ',
  _u: 'ᵤ',
  _v: 'ᵥ',
  _x: 'ₓ',
  '^a': 'ᵃ',
  '^b': 'ᵇ',
  '^c': 'ᶜ',
  '^d': 'ᵈ',
  '^e': 'ᵉ',
  '^f': 'ᶠ',
  '^g': 'ᵍ',
  '^h': 'ʰ',
  '^i': '^i',
  '^j': 'ʲ',
  '^k': 'ᵏ',
  '^l': 'ˡ',
  '^m': 'ᵐ',
  '^n': 'ⁿ',
  '^o': 'ᵒ',
  '^p': 'ᵖ',
  '^r': 'ʳ',
  '^s': 'ˢ',
  '^t': 'ᵗ',
  '^u': 'ᵘ',
  '^v': 'ᵛ',
  '^w': 'ʷ',
  '^x': 'ˣ',
  '^y': 'ʸ',
  '^z': 'ᶻ',

  '\\pm': '±',
  '\\dotplus': '∔',
  '\\bullet': '∙',
  '\\cdot': '⋅',
  '\\oplus': '⊕',
  '\\ominus': '⊖',
  '\\otimes': '⊗',
  '\\oslash': '⊘',
  '\\odot': '⊙',
  '\\circ': '∘',
  '\\surd': '√',
  '\\propto': '∝',
  '\\angle': '∠',
  '\\measuredangle': '∡',
  '\\sphericalangle': '∢',
  '\\mid': '∣',
  '\\nmid': '∤',
  '\\not\\mid': '∤',
  '\\parallel': '∥',
  '\\nparallel': '∦',
  '\\not\\parallel': '∦',
  '\\flat': '♭',
  '\\natural': '♮',
  '\\sharp': '♯',
};

module.exports = symbols;


/***/ }),
/* 2 */
/***/ ((module) => {

// Used to find all DOM nodes in window.getSelection()
function findNodesBetweenNodes(u, v) {
  const ancestor = findLowestCommonAncestor(u, v);
  const childrenList = findChildrenList(ancestor);
  const [i, j] = [childrenList.indexOf(u), childrenList.indexOf(v)].sort();
  return childrenList.slice(i, j + 1);
}

function findAncestorChain(node) {
  const chain = [];
  chain.push(node);
  while (node.parentNode) {
    node = node.parentNode;
    chain.push(node);
  }
  return chain.reverse();
}

function findLowestCommonAncestor(u, v) {
  const uChain = findAncestorChain(u);
  const vChain = findAncestorChain(v);

  let i = 0;
  for (; i < uChain.length; i++) {
    if (uChain[i] !== vChain[i]) {
      break;
    }
  }
  return uChain[i - 1];
}

function findChildrenList(node) {
  const list = [];
  const find = (n) => {
    if (!n) return;
    list.push(n);
    for (const child of Array.from(n.childNodes || [])) {
      find(child);
    }
  };
  find(node);
  return list;
}

module.exports = {
  findLowestCommonAncestor,
  findNodesBetweenNodes,
  findChildrenList,
  findAncestorChain,
};


/***/ }),
/* 3 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Parsimmon = __webpack_require__(4);

function makeNode(type) {
  return function makeNodeWrapper(parser) {
    return Parsimmon.seqMap(
      Parsimmon.index,
      parser,
      Parsimmon.index,
      function makeNode_(start, value, end) {
        return {
          type,
          start: start.offset,
          end: end.offset,
          ...value,
        };
      }
    );
  };
}

const Lang = Parsimmon.createLanguage({
  Program: (r) =>
    Parsimmon.alt(
      r.Superscript,
      r.Subscript,
      r.UnaryMacro,
      r.NullaryMacro,
      r.Illegal,
      r.PlainText
    )
      .many()
      .map((nodes) => {
        return {
          body: nodes,
        };
      })
      .thru(makeNode('Program')),

  Superscript: () =>
    Parsimmon.seq(
      Parsimmon.regexp(/\^\s*/),
      Parsimmon.alt(
        Parsimmon.regexp(/{[a-zA-Z0-9+-]+}/),
        Parsimmon.regexp(/[a-zA-Z0-9+-]/)
      )
    )
      .map(([, b]) => ({
        content: b,
      }))
      .thru(makeNode('Superscript')),

  Subscript: () =>
    Parsimmon.seq(
      Parsimmon.regexp(/_\s*/),
      Parsimmon.alt(
        Parsimmon.regexp(/{[a-zA-Z0-9+-]+}/),
        Parsimmon.regexp(/[a-zA-Z0-9+-]/)
      )
    )
      .map(([_, b]) => {
        return {
          content: b,
        };
      })
      .thru(makeNode('Subscript')),

  UnaryMacro: (r) =>
    Parsimmon.seq(
      Parsimmon.alt(
        Parsimmon.regexp(/\\mathbb(?![a-zA-Z])/),
        Parsimmon.regexp(/\\mathfrak(?![a-zA-Z])/),
        Parsimmon.regexp(/\\mathcal(?![a-zA-Z])/),
        Parsimmon.regexp(/\\not(?![a-zA-Z])/)
      ),
      r._,
      Parsimmon.alt(
        r.CurlyGroup,
        r.NullaryMacro,
        Parsimmon.regexp(/[a-zA-Z0-9]/)
          .map((x) => ({value: x}))
          .thru(makeNode('PlainText'))
      )
    )
      .map(([a, _, c]) => ({
        macro: a,
        argument: c,
      }))
      .thru(makeNode('UnaryMacro')),

  NullaryMacro: () =>
    Parsimmon.alt(Parsimmon.regexp(/\\[a-zA-Z]+/), Parsimmon.regexp(/\\\|/))
      .map((x) => {
        return {
          macro: x,
        };
      })
      .thru(makeNode('NullaryMacro')),

  Illegal: () =>
    Parsimmon.regexp(/[\^_\\]/)
      .map((r) => ({
        value: r,
      }))
      .thru(makeNode('PlainText')),

  PlainText: () =>
    Parsimmon.regexp(/[^_^\\]+/)
      .map((x) => ({value: x}))
      .thru(makeNode('PlainText')),

  CurlyGroup: () =>
    Parsimmon.regexp(/\{.*?\}/)
      .map((x) => ({value: x}))
      .thru(makeNode('CurlyGroup')),

  _: () => Parsimmon.regexp(/\s*/),
});

module.exports = Lang.Program;


/***/ }),
/* 4 */
/***/ (function(module) {

!function(n,t){ true?module.exports=t():0}("undefined"!=typeof self?self:this,function(){return function(n){var t={};function r(e){if(t[e])return t[e].exports;var u=t[e]={i:e,l:!1,exports:{}};return n[e].call(u.exports,u,u.exports,r),u.l=!0,u.exports}return r.m=n,r.c=t,r.d=function(n,t,e){r.o(n,t)||Object.defineProperty(n,t,{configurable:!1,enumerable:!0,get:e})},r.r=function(n){Object.defineProperty(n,"__esModule",{value:!0})},r.n=function(n){var t=n&&n.__esModule?function(){return n.default}:function(){return n};return r.d(t,"a",t),t},r.o=function(n,t){return Object.prototype.hasOwnProperty.call(n,t)},r.p="",r(r.s=0)}([function(n,t,r){"use strict";function e(n){if(!(this instanceof e))return new e(n);this._=n}var u=e.prototype;function o(n,t){for(var r=0;r<n;r++)t(r)}function i(n,t,r){return function(n,t){o(t.length,function(r){n(t[r],r,t)})}(function(r,e,u){t=n(t,r,e,u)},r),t}function a(n,t){return i(function(t,r,e,u){return t.concat([n(r,e,u)])},[],t)}function f(n,t){var r={v:0,buf:t};return o(n,function(){var n;r={v:r.v<<1|(n=r.buf,n[0]>>7),buf:function(n){var t=i(function(n,t,r,e){return n.concat(r===e.length-1?Buffer.from([t,0]).readUInt16BE(0):e.readUInt16BE(r))},[],n);return Buffer.from(a(function(n){return(n<<1&65535)>>8},t))}(r.buf)}}),r}function c(){return"undefined"!=typeof Buffer}function s(){if(!c())throw new Error("Buffer global does not exist; please use webpack if you need to parse Buffers in the browser.")}function l(n){s();var t=i(function(n,t){return n+t},0,n);if(t%8!=0)throw new Error("The bits ["+n.join(", ")+"] add up to "+t+" which is not an even number of bytes; the total should be divisible by 8");var r,u=t/8,o=(r=function(n){return n>48},i(function(n,t){return n||(r(t)?t:n)},null,n));if(o)throw new Error(o+" bit range requested exceeds 48 bit (6 byte) Number max.");return new e(function(t,r){var e=u+r;return e>t.length?x(r,u.toString()+" bytes"):b(e,i(function(n,t){var r=f(t,n.buf);return{coll:n.coll.concat(r.v),buf:r.buf}},{coll:[],buf:t.slice(r,e)},n).coll)})}function h(n,t){return new e(function(r,e){return s(),e+t>r.length?x(e,t+" bytes for "+n):b(e+t,r.slice(e,e+t))})}function p(n,t){if("number"!=typeof(r=t)||Math.floor(r)!==r||t<0||t>6)throw new Error(n+" requires integer length in range [0, 6].");var r}function d(n){return p("uintBE",n),h("uintBE("+n+")",n).map(function(t){return t.readUIntBE(0,n)})}function v(n){return p("uintLE",n),h("uintLE("+n+")",n).map(function(t){return t.readUIntLE(0,n)})}function g(n){return p("intBE",n),h("intBE("+n+")",n).map(function(t){return t.readIntBE(0,n)})}function m(n){return p("intLE",n),h("intLE("+n+")",n).map(function(t){return t.readIntLE(0,n)})}function y(n){return n instanceof e}function E(n){return"[object Array]"==={}.toString.call(n)}function w(n){return c()&&Buffer.isBuffer(n)}function b(n,t){return{status:!0,index:n,value:t,furthest:-1,expected:[]}}function x(n,t){return E(t)||(t=[t]),{status:!1,index:-1,value:null,furthest:n,expected:t}}function B(n,t){if(!t)return n;if(n.furthest>t.furthest)return n;var r=n.furthest===t.furthest?function(n,t){if(function(){if(void 0!==e._supportsSet)return e._supportsSet;var n="undefined"!=typeof Set;return e._supportsSet=n,n}()&&Array.from){for(var r=new Set(n),u=0;u<t.length;u++)r.add(t[u]);var o=Array.from(r);return o.sort(),o}for(var i={},a=0;a<n.length;a++)i[n[a]]=!0;for(var f=0;f<t.length;f++)i[t[f]]=!0;var c=[];for(var s in i)({}).hasOwnProperty.call(i,s)&&c.push(s);return c.sort(),c}(n.expected,t.expected):t.expected;return{status:n.status,index:n.index,value:n.value,furthest:t.furthest,expected:r}}var j={};function S(n,t){if(w(n))return{offset:t,line:-1,column:-1};n in j||(j[n]={});for(var r=j[n],e=0,u=0,o=0,i=t;i>=0;){if(i in r){e=r[i].line,0===o&&(o=r[i].lineStart);break}("\n"===n.charAt(i)||"\r"===n.charAt(i)&&"\n"!==n.charAt(i+1))&&(u++,0===o&&(o=i+1)),i--}var a=e+u,f=t-o;return r[t]={line:a,lineStart:o},{offset:t,line:a+1,column:f+1}}function _(n){if(!y(n))throw new Error("not a parser: "+n)}function L(n,t){return"string"==typeof n?n.charAt(t):n[t]}function O(n){if("number"!=typeof n)throw new Error("not a number: "+n)}function k(n){if("function"!=typeof n)throw new Error("not a function: "+n)}function P(n){if("string"!=typeof n)throw new Error("not a string: "+n)}var q=2,A=3,I=8,F=5*I,M=4*I,z="  ";function R(n,t){return new Array(t+1).join(n)}function U(n,t,r){var e=t-n.length;return e<=0?n:R(r,e)+n}function W(n,t,r,e){return{from:n-t>0?n-t:0,to:n+r>e?e:n+r}}function D(n,t){var r,e,u,o,f,c=t.index,s=c.offset,l=1;if(s===n.length)return"Got the end of the input";if(w(n)){var h=s-s%I,p=s-h,d=W(h,F,M+I,n.length),v=a(function(n){return a(function(n){return U(n.toString(16),2,"0")},n)},function(n,t){var r=n.length,e=[],u=0;if(r<=t)return[n.slice()];for(var o=0;o<r;o++)e[u]||e.push([]),e[u].push(n[o]),(o+1)%t==0&&u++;return e}(n.slice(d.from,d.to).toJSON().data,I));o=function(n){return 0===n.from&&1===n.to?{from:n.from,to:n.to}:{from:n.from/I,to:Math.floor(n.to/I)}}(d),e=h/I,r=3*p,p>=4&&(r+=1),l=2,u=a(function(n){return n.length<=4?n.join(" "):n.slice(0,4).join(" ")+"  "+n.slice(4).join(" ")},v),(f=(8*(o.to>0?o.to-1:o.to)).toString(16).length)<2&&(f=2)}else{var g=n.split(/\r\n|[\n\r\u2028\u2029]/);r=c.column-1,e=c.line-1,o=W(e,q,A,g.length),u=g.slice(o.from,o.to),f=o.to.toString().length}var m=e-o.from;return w(n)&&(f=(8*(o.to>0?o.to-1:o.to)).toString(16).length)<2&&(f=2),i(function(t,e,u){var i,a=u===m,c=a?"> ":z;return i=w(n)?U((8*(o.from+u)).toString(16),f,"0"):U((o.from+u+1).toString(),f," "),[].concat(t,[c+i+" | "+e],a?[z+R(" ",f)+" | "+U("",r," ")+R("^",l)]:[])},[],u).join("\n")}function N(n,t){return["\n","-- PARSING FAILED "+R("-",50),"\n\n",D(n,t),"\n\n",(r=t.expected,1===r.length?"Expected:\n\n"+r[0]:"Expected one of the following: \n\n"+r.join(", ")),"\n"].join("");var r}function G(n){return void 0!==n.flags?n.flags:[n.global?"g":"",n.ignoreCase?"i":"",n.multiline?"m":"",n.unicode?"u":"",n.sticky?"y":""].join("")}function C(){for(var n=[].slice.call(arguments),t=n.length,r=0;r<t;r+=1)_(n[r]);return e(function(r,e){for(var u,o=new Array(t),i=0;i<t;i+=1){if(!(u=B(n[i]._(r,e),u)).status)return u;o[i]=u.value,e=u.index}return B(b(e,o),u)})}function J(){var n=[].slice.call(arguments);if(0===n.length)throw new Error("seqMap needs at least one argument");var t=n.pop();return k(t),C.apply(null,n).map(function(n){return t.apply(null,n)})}function T(){var n=[].slice.call(arguments),t=n.length;if(0===t)return Y("zero alternates");for(var r=0;r<t;r+=1)_(n[r]);return e(function(t,r){for(var e,u=0;u<n.length;u+=1)if((e=B(n[u]._(t,r),e)).status)return e;return e})}function V(n,t){return H(n,t).or(X([]))}function H(n,t){return _(n),_(t),J(n,t.then(n).many(),function(n,t){return[n].concat(t)})}function K(n){P(n);var t="'"+n+"'";return e(function(r,e){var u=e+n.length,o=r.slice(e,u);return o===n?b(u,o):x(e,t)})}function Q(n,t){!function(n){if(!(n instanceof RegExp))throw new Error("not a regexp: "+n);for(var t=G(n),r=0;r<t.length;r++){var e=t.charAt(r);if("i"!==e&&"m"!==e&&"u"!==e&&"s"!==e)throw new Error('unsupported regexp flag "'+e+'": '+n)}}(n),arguments.length>=2?O(t):t=0;var r=function(n){return RegExp("^(?:"+n.source+")",G(n))}(n),u=""+n;return e(function(n,e){var o=r.exec(n.slice(e));if(o){if(0<=t&&t<=o.length){var i=o[0],a=o[t];return b(e+i.length,a)}return x(e,"valid match group (0 to "+o.length+") in "+u)}return x(e,u)})}function X(n){return e(function(t,r){return b(r,n)})}function Y(n){return e(function(t,r){return x(r,n)})}function Z(n){if(y(n))return e(function(t,r){var e=n._(t,r);return e.index=r,e.value="",e});if("string"==typeof n)return Z(K(n));if(n instanceof RegExp)return Z(Q(n));throw new Error("not a string, regexp, or parser: "+n)}function $(n){return _(n),e(function(t,r){var e=n._(t,r),u=t.slice(r,e.index);return e.status?x(r,'not "'+u+'"'):b(r,null)})}function nn(n){return k(n),e(function(t,r){var e=L(t,r);return r<t.length&&n(e)?b(r+1,e):x(r,"a character/byte matching "+n)})}function tn(n,t){arguments.length<2&&(t=n,n=void 0);var r=e(function(n,e){return r._=t()._,r._(n,e)});return n?r.desc(n):r}function rn(){return Y("fantasy-land/empty")}u.parse=function(n){if("string"!=typeof n&&!w(n))throw new Error(".parse must be called with a string or Buffer as its argument");var t,r=this.skip(an)._(n,0);return t=r.status?{status:!0,value:r.value}:{status:!1,index:S(n,r.furthest),expected:r.expected},delete j[n],t},u.tryParse=function(n){var t=this.parse(n);if(t.status)return t.value;var r=N(n,t),e=new Error(r);throw e.type="ParsimmonError",e.result=t,e},u.assert=function(n,t){return this.chain(function(r){return n(r)?X(r):Y(t)})},u.or=function(n){return T(this,n)},u.trim=function(n){return this.wrap(n,n)},u.wrap=function(n,t){return J(n,this,t,function(n,t){return t})},u.thru=function(n){return n(this)},u.then=function(n){return _(n),C(this,n).map(function(n){return n[1]})},u.many=function(){var n=this;return e(function(t,r){for(var e=[],u=void 0;;){if(!(u=B(n._(t,r),u)).status)return B(b(r,e),u);if(r===u.index)throw new Error("infinite loop detected in .many() parser --- calling .many() on a parser which can accept zero characters is usually the cause");r=u.index,e.push(u.value)}})},u.tieWith=function(n){return P(n),this.map(function(t){if(function(n){if(!E(n))throw new Error("not an array: "+n)}(t),t.length){P(t[0]);for(var r=t[0],e=1;e<t.length;e++)P(t[e]),r+=n+t[e];return r}return""})},u.tie=function(){return this.tieWith("")},u.times=function(n,t){var r=this;return arguments.length<2&&(t=n),O(n),O(t),e(function(e,u){for(var o=[],i=void 0,a=void 0,f=0;f<n;f+=1){if(a=B(i=r._(e,u),a),!i.status)return a;u=i.index,o.push(i.value)}for(;f<t&&(a=B(i=r._(e,u),a),i.status);f+=1)u=i.index,o.push(i.value);return B(b(u,o),a)})},u.result=function(n){return this.map(function(){return n})},u.atMost=function(n){return this.times(0,n)},u.atLeast=function(n){return J(this.times(n),this.many(),function(n,t){return n.concat(t)})},u.map=function(n){k(n);var t=this;return e(function(r,e){var u=t._(r,e);return u.status?B(b(u.index,n(u.value)),u):u})},u.contramap=function(n){k(n);var t=this;return e(function(r,e){var u=t.parse(n(r.slice(e)));return u.status?b(e+r.length,u.value):u})},u.promap=function(n,t){return k(n),k(t),this.contramap(n).map(t)},u.skip=function(n){return C(this,n).map(function(n){return n[0]})},u.mark=function(){return J(en,this,en,function(n,t,r){return{start:n,value:t,end:r}})},u.node=function(n){return J(en,this,en,function(t,r,e){return{name:n,value:r,start:t,end:e}})},u.sepBy=function(n){return V(this,n)},u.sepBy1=function(n){return H(this,n)},u.lookahead=function(n){return this.skip(Z(n))},u.notFollowedBy=function(n){return this.skip($(n))},u.desc=function(n){E(n)||(n=[n]);var t=this;return e(function(r,e){var u=t._(r,e);return u.status||(u.expected=n),u})},u.fallback=function(n){return this.or(X(n))},u.ap=function(n){return J(n,this,function(n,t){return n(t)})},u.chain=function(n){var t=this;return e(function(r,e){var u=t._(r,e);return u.status?B(n(u.value)._(r,u.index),u):u})},u.concat=u.or,u.empty=rn,u.of=X,u["fantasy-land/ap"]=u.ap,u["fantasy-land/chain"]=u.chain,u["fantasy-land/concat"]=u.concat,u["fantasy-land/empty"]=u.empty,u["fantasy-land/of"]=u.of,u["fantasy-land/map"]=u.map;var en=e(function(n,t){return b(t,S(n,t))}),un=e(function(n,t){return t>=n.length?x(t,"any character/byte"):b(t+1,L(n,t))}),on=e(function(n,t){return b(n.length,n.slice(t))}),an=e(function(n,t){return t<n.length?x(t,"EOF"):b(t,null)}),fn=Q(/[0-9]/).desc("a digit"),cn=Q(/[0-9]*/).desc("optional digits"),sn=Q(/[a-z]/i).desc("a letter"),ln=Q(/[a-z]*/i).desc("optional letters"),hn=Q(/\s*/).desc("optional whitespace"),pn=Q(/\s+/).desc("whitespace"),dn=K("\r"),vn=K("\n"),gn=K("\r\n"),mn=T(gn,vn,dn).desc("newline"),yn=T(mn,an);e.all=on,e.alt=T,e.any=un,e.cr=dn,e.createLanguage=function(n){var t={};for(var r in n)({}).hasOwnProperty.call(n,r)&&function(r){t[r]=tn(function(){return n[r](t)})}(r);return t},e.crlf=gn,e.custom=function(n){return e(n(b,x))},e.digit=fn,e.digits=cn,e.empty=rn,e.end=yn,e.eof=an,e.fail=Y,e.formatError=N,e.index=en,e.isParser=y,e.lazy=tn,e.letter=sn,e.letters=ln,e.lf=vn,e.lookahead=Z,e.makeFailure=x,e.makeSuccess=b,e.newline=mn,e.noneOf=function(n){return nn(function(t){return n.indexOf(t)<0}).desc("none of '"+n+"'")},e.notFollowedBy=$,e.of=X,e.oneOf=function(n){for(var t=n.split(""),r=0;r<t.length;r++)t[r]="'"+t[r]+"'";return nn(function(t){return n.indexOf(t)>=0}).desc(t)},e.optWhitespace=hn,e.Parser=e,e.range=function(n,t){return nn(function(r){return n<=r&&r<=t}).desc(n+"-"+t)},e.regex=Q,e.regexp=Q,e.sepBy=V,e.sepBy1=H,e.seq=C,e.seqMap=J,e.seqObj=function(){for(var n,t={},r=0,u=(n=arguments,Array.prototype.slice.call(n)),o=u.length,i=0;i<o;i+=1){var a=u[i];if(!y(a)){if(E(a)&&2===a.length&&"string"==typeof a[0]&&y(a[1])){var f=a[0];if(Object.prototype.hasOwnProperty.call(t,f))throw new Error("seqObj: duplicate key "+f);t[f]=!0,r++;continue}throw new Error("seqObj arguments must be parsers or [string, parser] array pairs.")}}if(0===r)throw new Error("seqObj expects at least one named parser, found zero");return e(function(n,t){for(var r,e={},i=0;i<o;i+=1){var a,f;if(E(u[i])?(a=u[i][0],f=u[i][1]):(a=null,f=u[i]),!(r=B(f._(n,t),r)).status)return r;a&&(e[a]=r.value),t=r.index}return B(b(t,e),r)})},e.string=K,e.succeed=X,e.takeWhile=function(n){return k(n),e(function(t,r){for(var e=r;e<t.length&&n(L(t,e));)e++;return b(e,t.slice(r,e))})},e.test=nn,e.whitespace=pn,e["fantasy-land/empty"]=rn,e["fantasy-land/of"]=X,e.Binary={bitSeq:l,bitSeqObj:function(n){s();var t={},r=0,e=a(function(n){if(E(n)){var e=n;if(2!==e.length)throw new Error("["+e.join(", ")+"] should be length 2, got length "+e.length);if(P(e[0]),O(e[1]),Object.prototype.hasOwnProperty.call(t,e[0]))throw new Error("duplicate key in bitSeqObj: "+e[0]);return t[e[0]]=!0,r++,e}return O(n),[null,n]},n);if(r<1)throw new Error("bitSeqObj expects at least one named pair, got ["+n.join(", ")+"]");var u=a(function(n){return n[0]},e);return l(a(function(n){return n[1]},e)).map(function(n){return i(function(n,t){return null!==t[0]&&(n[t[0]]=t[1]),n},{},a(function(t,r){return[t,n[r]]},u))})},byte:function(n){if(s(),O(n),n>255)throw new Error("Value specified to byte constructor ("+n+"=0x"+n.toString(16)+") is larger in value than a single byte.");var t=(n>15?"0x":"0x0")+n.toString(16);return e(function(r,e){var u=L(r,e);return u===n?b(e+1,u):x(e,t)})},buffer:function(n){return h("buffer",n).map(function(n){return Buffer.from(n)})},encodedString:function(n,t){return h("string",t).map(function(t){return t.toString(n)})},uintBE:d,uint8BE:d(1),uint16BE:d(2),uint32BE:d(4),uintLE:v,uint8LE:v(1),uint16LE:v(2),uint32LE:v(4),intBE:g,int8BE:g(1),int16BE:g(2),int32BE:g(4),intLE:m,int8LE:m(1),int16LE:m(2),int32LE:m(4),floatBE:h("floatBE",4).map(function(n){return n.readFloatBE(0)}),floatLE:h("floatLE",4).map(function(n){return n.readFloatLE(0)}),doubleBE:h("doubleBE",8).map(function(n){return n.readDoubleBE(0)}),doubleLE:h("doubleLE",8).map(function(n){return n.readDoubleLE(0)})},n.exports=e}])});

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	TexToUnicode = __webpack_exports__;
/******/ 	
/******/ })()
;