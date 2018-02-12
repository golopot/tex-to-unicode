/* eslint-disable */
var TexToUnicode =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const symbols = __webpack_require__(1)
const {findNodesBetweenNodes} = __webpack_require__(2)

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


/***/ }),
/* 1 */
/***/ (function(module, exports) {

function preprocess(obj){
  let res = {}
  for (let key in obj){
    if (/^\\[a-zA-Z]+$/.test(key)){
      res[key] = obj[key]
    }
    else if (/^\\[a-zA-Z]+{.}$/.test(key)){
      res[key] = obj[key]
    }
    else if (/^\\not(.*)$/.test(key)){
      res[key] = obj[key]
    }
    else{
      throw new Error('Symbol table does not allow this key: ' + key)
    }
  }
  return res
}

const readSymbols = (symbolsStr) => {
  let symbols = {}
  let match
  let re = /(\\[^\t.]+)\t([^(\t\n).]*)/g
  while (match = re.exec(symbolsStr)){
    symbols[match[1]] = match[2]
  }
  return symbols
}

const symbolsStr = `
  # Greek
  \\alpha	α	\\Alpha	Α
  \\beta	β	\\Beta	Β
  \\gamma	γ	\\Gamma	Γ
  \\delta	δ	\\Delta	Δ
  \\epsilon	ϵ	\\Epsilon	Ε
  \\zeta	ζ	\\Zeta	Ζ
  \\eta	η	\\Eta	Η
  \\theta	θ	\\Theta	Θ
  \\kappa	κ	\\Kappa	Κ
  \\lambda	λ	\\Lambda	Λ
  \\mu	μ	\\Mu	Μ
  \\nu	ν	\\Nu	Ν
  \\xi	ξ	\\Xi	Ξ
  \\omicron	ο	\\Omicron	Ο
  \\pi	π	\\Pi	Π
  \\rho	ρ	\\Rho	Ρ
  \\sigma	σ	\\Sigma	Σ
  \\tau	τ	\\Tau	Τ
  \\upsilon	υ	\\Upsilon	Υ
  \\phi	ϕ	\\Phi	Φ
  \\chi	χ	\\Chi	Χ
  \\psi	ψ	\\Psi	Ψ
  \\omega	ω	\\Omega	Ω

  \\varepsilon	ε
  \\varkappa	ϰ
  \\varphi	φ
  \\varpi	ϖ
  \\varrho	ϱ
  \\varsigma	ς
  \\vartheta	ϑ

  # Relation
  \\neq	≠
  \\equiv	≡
  \\not\\equiv	≢
  \\leq	≤
  \\geq	≥
  \\leqq	≦
  \\geqq	≧
  \\lneqq	≨
  \\gneqq	≩
  \\leqslant	⩽
  \\geqslant	⩾
  \\ll	≪
  \\gg	≫
  \\nless	≮
  \\ngtr	≯
  \\nleq	≰
  \\ngeq	≱
  \\lessequivlnt	≲
  \\greaterequivlnt	≳
  \\prec	≺
  \\succ	≻
  \\preccurlyeq	≼
  \\succcurlyeq	≽
  \\precapprox	≾
  \\succapprox	≿
  \\nprec	⊀
  \\nsucc	⊁
  \\sim	∼
  \\not\\sim	≁
  \\simeq	≃
  \\not\\simeq	≄
  \\backsim	∽
  \\lazysinv	∾
  \\wr	≀

  \\cong	≅
  \\not\\cong	≇
  \\approx	≈
  \\not\\approx	≉
  \\approxeq	≊
  \\approxnotequal	≆
  \\tildetrpl	≋
  \\allequal	≌
  \\asymp	≍
  \\doteq	≐
  \\doteqdot	≑

  \\lneq	⪇
  \\gneq	⪈
  \\preceq	⪯
  \\succeq	⪰
  \\precneqq	⪵
  \\succneqq	⪶


  # Sets and Logic
  \\emptyset	∅
  \\in	∈
  \\notin	∉	\\not\\in	∉
  \\ni	∋
  \\not\\ni	∌
  \\subset	⊂
  \\subseteq	⊆
  \\not\\subset	⊄
  \\not\\subseteq	⊈
  \\supset	⊃
  \\supseteq	⊇
  \\not\\supset	⊅
  \\not\\supseteq	⊉
  \\subsetneq	⊊
  \\supsetneq	⊋
  \\exists	∃
  \\nexists	∄	\\not\\exists	∄
  \\forall	∀
  \\aleph	ℵ
  \\beth	ℶ
  \\neg	¬
  \\wedge	∧
  \\vee	∨
  \\veebar	⊻
  \\land	∧
  \\lor	∨
  \\top	⊤
  \\bot	⊥
  \\cup	∪
  \\cap	∩
  \\bigcup	⋃
  \\bigcap	⋂
  \\setminus	∖
  \\therefore	∴
  \\because	∵
  \\Box	□
  \\models	⊨
  \\vdash	⊢

  # Arrow
  \\rightarrow	→	\\Rightarrow	⇒
  \\leftarrow	←	\\Leftarrow	⇐
  \\uparrow	↑	\\Uparrow	⇑
  \\downarrow	↓	\\Downarrow	⇓
  \\nwarrow	↖	\\nearrow	↗
  \\searrow	↘	\\swarrow	↙
  \\mapsto	↦
  \\to	→
  \\leftrightarrow	↔	\\hookleftarrow	↩
  \\Leftrightarrow	⇔
  \\rightarrowtail	↣	\\leftarrowtail	↢
  \\twoheadrightarrow	↠	\\twoheadleftarrow	↞
  \\hookrightarrow	↪	\\hookleftarrow	↩
  \\rightsquigarrow	⇝
  \\rightleftharpoons	⇌	\\leftrightharpoons	⇋
  \\rightharpoonup	⇀	\\rightharpoondown	⇁

  # Analysis
  \\infty	∞
  \\nabla	∇
  \\partial	∂
  \\sum	∑
  \\prod	∏
  \\coprod	∐
  \\int	∫
  \\iint	∬
  \\iiint	∭
  \\iiiint	⨌
  \\oint	∮
  \\surfintegral	∯
  \\volintegral	∰
  \\Re	ℜ
  \\Im	ℑ
  \\wp	℘
  \\mp	∓

  \\langle	⟨
  \\rangle	⟩
  \\lfloor	⌊
  \\rfloor	⌋
  \\lceil	⌈
  \\rceil	⌉

  # Blackboard Bold, Fraktur
  \\mathbb{a}	𝕒	\\mathbb{A}	𝔸
  \\mathbb{b}	𝕓	\\mathbb{B}	𝔹
  \\mathbb{c}	𝕔	\\mathbb{C}	ℂ
  \\mathbb{d}	𝕕	\\mathbb{D}	𝔻
  \\mathbb{e}	𝕖	\\mathbb{E}	𝔼
  \\mathbb{f}	𝕗	\\mathbb{F}	𝔽
  \\mathbb{g}	𝕘	\\mathbb{G}	𝔾
  \\mathbb{h}	𝕙	\\mathbb{H}	ℍ
  \\mathbb{i}	𝕚	\\mathbb{I}	𝕀
  \\mathbb{j}	𝕛	\\mathbb{J}	𝕁
  \\mathbb{k}	𝕜	\\mathbb{K}	𝕂
  \\mathbb{l}	𝕝	\\mathbb{L}	𝕃
  \\mathbb{m}	𝕞	\\mathbb{M}	𝕄
  \\mathbb{n}	𝕟	\\mathbb{N}	ℕ
  \\mathbb{o}	𝕠	\\mathbb{O}	𝕆
  \\mathbb{p}	𝕡	\\mathbb{P}	ℙ
  \\mathbb{q}	𝕢	\\mathbb{Q}	ℚ
  \\mathbb{r}	𝕣	\\mathbb{R}	ℝ
  \\mathbb{s}	𝕤	\\mathbb{S}	𝕊
  \\mathbb{t}	𝕥	\\mathbb{T}	𝕋
  \\mathbb{u}	𝕦	\\mathbb{U}	𝕌
  \\mathbb{v}	𝕧	\\mathbb{V}	𝕍
  \\mathbb{x}	𝕩	\\mathbb{X}	𝕏
  \\mathbb{y}	𝕪	\\mathbb{Y}	𝕐
  \\mathbb{z}	𝕫	\\mathbb{Z}	ℤ

  \\mathbb{0}	𝟘
  \\mathbb{1}	𝟙
  \\mathbb{2}	𝟚
  \\mathbb{3}	𝟛
  \\mathbb{4}	𝟜
  \\mathbb{5}	𝟝
  \\mathbb{6}	𝟞
  \\mathbb{7}	𝟟
  \\mathbb{8}	𝟠
  \\mathbb{9}	𝟡
  \\mathfrak{a}	𝔞	\\mathfrak{A}	𝔄
  \\mathfrak{b}	𝔟	\\mathfrak{B}	𝔅
  \\mathfrak{c}	𝔠	\\mathfrak{C}	ℭ
  \\mathfrak{d}	𝔡	\\mathfrak{D}	𝔇
  \\mathfrak{e}	𝔢	\\mathfrak{E}	𝔈
  \\mathfrak{f}	𝔣	\\mathfrak{F}	𝔉
  \\mathfrak{g}	𝔤	\\mathfrak{G}	𝔊
  \\mathfrak{h}	𝔥	\\mathfrak{H}	ℌ
  \\mathfrak{i}	𝔦	\\mathfrak{I}	ℑ
  \\mathfrak{j}	𝔧	\\mathfrak{J}	𝔍
  \\mathfrak{k}	𝔨	\\mathfrak{K}	𝔎
  \\mathfrak{l}	𝔩	\\mathfrak{L}	𝔏
  \\mathfrak{m}	𝔪	\\mathfrak{M}	𝔐
  \\mathfrak{n}	𝔫	\\mathfrak{N}	𝔑
  \\mathfrak{o}	𝔬	\\mathfrak{O}	𝔒
  \\mathfrak{p}	𝔭	\\mathfrak{P}	𝔓
  \\mathfrak{q}	𝔮	\\mathfrak{Q}	𝔔
  \\mathfrak{r}	𝔯	\\mathfrak{R}	ℜ
  \\mathfrak{s}	𝔰	\\mathfrak{S}	𝔖
  \\mathfrak{t}	𝔱	\\mathfrak{T}	𝔗
  \\mathfrak{u}	𝔲	\\mathfrak{U}	𝔘
  \\mathfrak{v}	𝔳	\\mathfrak{V}	𝔙
  \\mathfrak{x}	𝔵	\\mathfrak{X}	𝔛
  \\mathfrak{y}	𝔶	\\mathfrak{Y}	𝔜
  \\mathfrak{z}	𝔷	\\mathfrak{Z}	ℨ

  # Misc
  \\mp	∓
  \\dotplus	∔
  \\bullet	∙
  \\cdot	⋅
  \\oplus	⊕
  \\ominus	⊖
  \\otimes	⊗
  \\oslash	⊘
  \\odot	⊙
  \\circ	∘
  \\surd	√
  \\propto	∝
  \\angle	∠
  \\measuredangle	∡
  \\sphericalangle	∢
  \\mid	∣
  \\nmid	∤	\\not\\mid	∤
  \\parallel	∥
  \\nparallel	∦	\\not\\parallel	∦
  \\flat	♭
  \\natural	♮
  \\sharp	♯
`
module.exports = preprocess(readSymbols(symbolsStr))


/***/ }),
/* 2 */
/***/ (function(module, exports) {


// Used to find all DOM nodes in window.getSelection()
function findNodesBetweenNodes(u, v) {
  const ancestor = findLowestCommonAncestor(u, v)
  const childrenList = findChildrenList(ancestor)
  const [i, j] = [childrenList.indexOf(u), childrenList.indexOf(v)].sort()
  return childrenList.slice(i, j+1)
}

function findAncestorChain(node) {
  const chain = []
  chain.push(node)
  while (node.parentNode) {
    node = node.parentNode
    chain.push(node)
  }
  return chain.reverse()
}

function findLowestCommonAncestor(u, v) {

  const uChain = findAncestorChain(u)
  const vChain = findAncestorChain(v)

  let i = 0
  for (; i<uChain.length; i++) {
    if (uChain[i] !== vChain[i]) {
      break
    }
  }
  return uChain[i-1]
}

function findChildrenList(node) {
  const list = []
  const find = (n) => {
    if (!n) return
    list.push(n)
    for (let child of Array.from(n.childNodes||[])) {
      find(child)
    }
  }
  find(node)
  return list
}

module.exports = {
  findLowestCommonAncestor,
  findNodesBetweenNodes,
  findChildrenList,
  findAncestorChain
}


/***/ })
/******/ ]);
