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
  const find = n => {
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
