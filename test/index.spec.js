/* eslint-env jest */

const {convertText, convertInputable} = require('../lib/index');
const parser = require('../lib/parser');
const tree = require('../lib/tree');

describe('convertText', () => {
  test('Only convert selected parts', () => {
    const result = convertText('a \\alpha, b \\beta', 0, 4);
    expect(result).toEqual({text: 'a α, b \\beta', cursor: 3});
  });

  test('Plays well with non-convertible macros', () => {
    expect(convertText('\\frac{\\alpha}{\\beta}', 0, 20)).toEqual({
      text: '\\frac{α}{β}',
      cursor: 11,
    });
  });

  test('Convert \\mathbb', () => {
    expect(convertText('a \\in \\mathbb{R}', 0, 16)).toEqual({
      text: 'a ∈ ℝ',
      cursor: 5,
    });
  });

  test('Convert \\not', () => {
    expect(convertText('\\not\\equiv', 10, 10)).toEqual({text: '≢', cursor: 1});
  });

  test('Convert x_1^{abc} (option subscript on)', () => {
    expect(convertText('x_1^{abc}', 0, 9, {subscripts: true})).toEqual({
      text: 'x₁ᵃᵇᶜ',
      cursor: 5,
    });
  });

  test('Convert x_1^{abc} (option subscript off)', () => {
    expect(convertText('x_1^{abc}', 0, 9, {subscripts: false})).toMatchObject({
      text: 'x_1^{abc}',
    });
  });

  test('Convert x_\\alpha (option subscript on)', () => {
    expect(convertText('x_\\alpha', 0, 8, {subscripts: true})).toMatchObject({
      text: 'x_α',
    });
  });

  test('Convert x_\\alpha (option subscript off)', () => {
    expect(convertText('x_\\alpha', 0, 8, {subscripts: false})).toMatchObject({
      text: 'x_α',
    });
  });
});

describe('Parser', () => {
  test('Should successfully parse \\\\^^__', () => {
    expect(parser.parse('\\\\^^__').status).toEqual(true);
  });
});

describe('Tree algorithms', () => {
  const Node = function () {
    const res = {childNodes: Array.from(arguments)};
    for (const node of arguments) {
      node.parentNode = res;
    }
    return res;
  };

  test('findNodesBetweenNodes', () => {
    const u = {nodeValue: 'u'};
    const v = {nodeValue: 'v'};

    Node(Node(u, Node()), Node(), Node(Node(), v));

    const nodes = tree.findNodesBetweenNodes(u, v);

    expect(nodes).toHaveLength(6);

    expect(nodes[0]).toBe(u);

    expect(nodes[5]).toBe(v);
  });

  test('findLowestCommonAncestor', () => {
    const u = {nodeValue: 'u'};
    const v = {nodeValue: 'v'};

    const node = Node(Node(u), Node(Node(v)));

    expect(tree.findLowestCommonAncestor(u, v)).toBe(node);
  });
});

describe('DOM test', () => {
  test('Convert text in textarea', () => {
    document.body.innerHTML = `
      <textarea>\\alpha \\to \\beta</textarea>
    `;
    const textarea = document.querySelector('textarea');
    textarea.select();
    document.execCommand = function fakeExecCommand(_, __, text) {
      textarea.value = text;
    };
    convertInputable(textarea);
    expect(textarea.value).toBe('α → β');
  });

  // Not testable because jsdom didn't implement document.getSelection()
  test.skip('convert text in contenteditable', () => {
    document.body.innerHTML = `
      <div contenteditable='true'>
        <div>\\alpha \\to </div>
        <div>\\beta</div>
      </div>
    `;
  });
});
