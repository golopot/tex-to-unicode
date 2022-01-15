const Parsimmon = require('parsimmon');

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
    Parsimmon.regexp(/\\[a-zA-Z]+/)
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
