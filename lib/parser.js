const Parsimmon = require('parsimmon')

const Lang = Parsimmon.createLanguage({
  Text: r => Parsimmon.alt(
    r.Superscript,
    r.Subscript,
    r.UnaryMacro,
    r.NullaryMacro,
    r.PlainText
  )
    .many(),

  Superscript: r => Parsimmon.seq(
    Parsimmon.regexp(/\^\s*/),
    Parsimmon.alt(
      r.CurlyGroup,
      Parsimmon.regexp(/[a-zA-Z0-9+-]/),
      r.UnaryMacro,
      r.NullaryMacro
    )
  )
    .map( ([a, b]) => a + b),

  Subscript: r => Parsimmon.seq(
    Parsimmon.regexp(/_\s*/),
    Parsimmon.alt(
      r.CurlyGroup,
      Parsimmon.regexp(/[a-zA-Z0-9+-]/),
      r.UnaryMacro,
      r.NullaryMacro
    )
  )
    .map( ([a, b]) => a + b),

  UnaryMacro: r => Parsimmon.seq(
    Parsimmon.alt(
      Parsimmon.regexp(/\\mathbb(?![a-zA-Z])/),
      Parsimmon.regexp(/\\mathfrak(?![a-zA-Z])/),
      Parsimmon.regexp(/\\not(?![a-zA-Z])/)
    ),
    r._,
    Parsimmon.alt(
      r.CurlyGroup,
      r.NullaryMacro,
      Parsimmon.regexp(/[a-zA-Z0-9]/)
    )
  )
    .map(([a, b, c]) => a + b + c),

  NullaryMacro: () => Parsimmon.regexp(/\\[a-zA-Z]+/),

  PlainText: () => Parsimmon.regexp(/[^_^\\]+/),

  CurlyGroup: () => Parsimmon.regexp(/\{.*?\}/),

  _: () => Parsimmon.regexp(/\s*/),

})

module.exports = Lang.Text
