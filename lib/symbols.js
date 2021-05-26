/**
 * @param {{[_:string]:string}} obj
 * @returns {{[_:string]:string}}
 */
function preprocess(obj) {
  /** @type {{[_:string]: string}} */
  const res = {};
  for (const key in obj) {
    if (/^\\[a-zA-Z]+$/.test(key)) {
      res[key] = obj[key];
    } else if (/^\\[a-zA-Z]+{.}$/.test(key)) {
      res[key] = obj[key];
    } else if (/^\\not(.*)$/.test(key)) {
      res[key] = obj[key];
    } else if (/^[_^](.*)$/.test(key)) {
      res[key] = obj[key];
    } else {
      throw new Error(`Symbol table does not allow this key: ${key}`);
    }
  }
  return res;
}

/**
 * @param {string} symbolsStr
 * @returns {Record<string, string>}
 */
const readSymbols = (symbolsStr) => {
  /** @type {{[_:string]: string}} */
  const symbols = {};
  let match;
  const re = /([\\_^][^\t.]+)\t([^(\t\n).]*)/g;
  while ((match = re.exec(symbolsStr))) {
    /* eslint-disable-next-line prefer-destructuring */
    symbols[match[1]] = match[2];
  }
  return preprocess(symbols);
};

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
  \\iota	ι	\\Iota	I
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
  \\varnothing	∅
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
  \\times	×
  \\div	÷
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
  \\|	‖

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
  \\mathcal{a}	𝒶	\\mathcal{A}	𝒜
  \\mathcal{b}	𝒷	\\mathcal{B}	ℬ
  \\mathcal{c}	𝒸	\\mathcal{C}	𝒞
  \\mathcal{d}	𝒹	\\mathcal{D}	𝒟
  \\mathcal{e}	ℯ	\\mathcal{E}	ℰ
  \\mathcal{f}	𝒻	\\mathcal{F}	ℱ
  \\mathcal{g}	ℊ	\\mathcal{G}	𝒢
  \\mathcal{h}	𝒽	\\mathcal{H}	ℋ
  \\mathcal{i}	𝒾	\\mathcal{I}	ℐ
  \\mathcal{j}	𝒿	\\mathcal{J}	𝒥
  \\mathcal{k}	𝓀	\\mathcal{K}	𝒦
  \\mathcal{l}	𝓁	\\mathcal{L}	ℒ
  \\mathcal{m}	𝓂	\\mathcal{M}	ℳ
  \\mathcal{n}	𝓃	\\mathcal{N}	𝒩
  \\mathcal{o}	ℴ	\\mathcal{O}	𝒪
  \\mathcal{p}	𝓅	\\mathcal{P}	𝒫
  \\mathcal{q}	𝓆	\\mathcal{Q}	𝒬
  \\mathcal{r}	𝓇	\\mathcal{R}	ℛ
  \\mathcal{s}	𝓈	\\mathcal{S}	𝒮
  \\mathcal{t}	𝓉	\\mathcal{T}	𝒯
  \\mathcal{u}	𝓊	\\mathcal{U}	𝒰
  \\mathcal{v}	𝓋	\\mathcal{V}	𝒱
  \\mathcal{w}	𝓌	\\mathcal{W}	𝒲
  \\mathcal{x}	𝓍	\\mathcal{X}	𝒳
  \\mathcal{y}	𝓎	\\mathcal{Y}	𝒴
  \\mathcal{z}	𝓏	\\mathcal{Z}	𝒵

  # Subscripts and superscripts
  _0	₀	^0	⁰
  _1	₁	^1	¹
  _2	₂	^2	²
  _3	₃	^3	³
  _4	₄	^4	⁴
  _5	₅	^5	⁵
  _6	₆	^6	⁶
  _7	₇	^7	⁷
  _8	₈	^8	⁸
  _9	₉	^9	⁹
  _+	₊	^+	⁺
  _-	₋	^-	⁻
  _(	₍	^(	⁽
  _)	₎	^)	⁾

  _a	ₐ	^a	ᵃ
  ^b	ᵇ
  ^c	ᶜ
  ^d	ᵈ
  _e	ₑ	^e	ᵉ
  ^f	ᶠ
  ^g	ᵍ
  _h	ₕ	^h	ʰ
  _i	ᵢ	^i	^i	ⁱ
  _j	ⱼ	^j	ʲ
  _k	ₖ	^k	ᵏ
  _l	ₗ	^l	ˡ
  _m	ₘ	^m	ᵐ
  _n	ₙ	^n	ⁿ
  _o	ₒ	^o	ᵒ
  _p	ₚ	^p	ᵖ

  _r	ᵣ	^r	ʳ
  _s	ₛ	^s	ˢ
  _t	ₜ	^t	ᵗ
  _u	ᵤ	^u	ᵘ
  _v	ᵥ	^v	ᵛ
  ^w	ʷ
  _x	ₓ	^x	ˣ
  ^y	ʸ
  ^z	ᶻ

  # Misc
  \\mp	∓
  \\pm	±
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
`;
module.exports = readSymbols(symbolsStr);
