const bnb = require('bread-n-butter');

function makeNode(type) {
  return function makeNodeWrapper(parser) {
    return bnb
      .all(bnb.location, parser, bnb.location)
      .map(function makeNode_([start, value, end]) {
        return {
          type,
          start: start.index,
          end: end.index,
          // @ts-ignore
          ...value,
        };
      });
  };
}

const Spaces = bnb.match(/\s*/);

const Superscript = bnb
  .all(
    bnb.match(/\^\s*/),
    bnb.choice(bnb.match(/{[a-zA-Z0-9+-]+}/), bnb.match(/[a-zA-Z0-9+-]/))
  )
  .map(([, b]) => ({
    content: b,
  }))
  .thru(makeNode('Superscript'));

const Subscript = bnb
  .all(
    bnb.match(/_\s*/),
    bnb.choice(bnb.match(/{[a-zA-Z0-9+-]+}/), bnb.match(/[a-zA-Z0-9+-]/))
  )
  .map(([_, b]) => {
    return {
      content: b,
    };
  })
  .thru(makeNode('Subscript'));

const NullaryMacro = bnb
  .choice(bnb.match(/\\[a-zA-Z]+/), bnb.match(/\\\|/))
  .map((x) => {
    return {
      macro: x,
    };
  })
  .thru(makeNode('NullaryMacro'));

const CurlyGroup = bnb
  .match(/\{.*?\}/)
  .map((x) => ({value: x}))
  .thru(makeNode('CurlyGroup'));

const UnaryMacro = bnb
  .all(
    bnb.choice(
      bnb.match(/\\mathbb(?![a-zA-Z])/),
      bnb.match(/\\mathfrak(?![a-zA-Z])/),
      bnb.match(/\\mathcal(?![a-zA-Z])/),
      bnb.match(/\\not(?![a-zA-Z])/)
    ),
    Spaces,
    bnb.choice(
      CurlyGroup,
      NullaryMacro,
      bnb
        .match(/[a-zA-Z0-9]/)
        .map((x) => ({value: x}))
        .thru(makeNode('PlainText'))
    )
  )
  .map(([a, _, c]) => ({
    macro: a,
    argument: c,
  }))
  .thru(makeNode('UnaryMacro'));

const Illegal = bnb
  .match(/[\^_\\]/)
  .map((r) => ({
    value: r,
  }))
  .thru(makeNode('PlainText'));

const PlainText = bnb
  .match(/[^_^\\]+/)
  .map((x) => ({value: x}))
  .thru(makeNode('PlainText'));

const Program = bnb
  .choice(Superscript, Subscript, UnaryMacro, NullaryMacro, Illegal, PlainText)
  .repeat()
  .map((nodes) => {
    return {
      body: nodes,
    };
  })
  .thru(makeNode('Program'));

module.exports = Program;
