/*
 * @Author: zhengchengxuan 534370078@qq.com
 * @Date: 2023-02-09 20:26:22
 * @LastEditors: zhengchengxuan 534370078@qq.com
 * @LastEditTime: 2023-02-09 23:57:31
 * @FilePath: \my-vue\packages\runtime-test\src\nodeOps.ts
 * @Description:
 */
export const enum NodeTypes {
  ELEMENT = 'element',
  TEXT = 'TEXT',
}

export const enum NodeOpTypes {
  CREATE = 'create',
  INSERT = 'insert',
  REMOVE = 'remove',
  SET_TEXT = 'setText',
  SET_ELEMENT_TEXT = 'setElementText',
  PATCH = 'patch',
}
export interface TestElement {
  id: number;
  type: NodeTypes.ELEMENT;
  parentNode: TestElement | null;
  tag: string;
  children: TestNode[];
  props: Record<string, any>;
}

export interface TestText {
  id: number;
  type: NodeTypes.TEXT;
  parentNode: TestElement | null;
  text: string;
}

export type TestNode = TestElement | TestText;

export function resetOps() {
  recordedNodeOps = [];
}

export interface NodeOp {
  type: NodeOpTypes;
  nodeType?: NodeTypes;
  tag?: string;
  text?: string;
  targetNode?: TestNode;
  parentNode?: TestElement;
  refNode?: TestNode | null;
  propKey?: string;
  propPrevValue?: any;
  propNextValue?: any;
}

export function dumpOps(): NodeOp[] {
  const ops = recordedNodeOps.slice();
  resetOps();
  return ops;
}

let nodeId: number = 0;
let recordedNodeOps: NodeOp[] = [];
export function logNodeOp(op: NodeOp) {
  recordedNodeOps.push(op);
}

// 这个函数会在 runtime-core 初始化 element 的时候调用
function createElement(tag: string): TestElement {
  // 如果是基于 dom 的话 那么这里会返回 dom 元素
  // 这里是为了测试 所以只需要反正一个对象就可以了
  // 后面的话 通过这个对象来做测试
  const node: TestElement = {
    tag,
    id: nodeId++,
    type: NodeTypes.ELEMENT,
    props: {},
    children: [],
    parentNode: null,
  };

  logNodeOp({
    type: NodeOpTypes.CREATE,
    nodeType: NodeTypes.ELEMENT,
    targetNode: node,
    tag,
  });
  return node;
}

function insert(child, parent: TestElement) {
  parent.children.push(child);
  child.parentNode = parent;
  logNodeOp({
    type: NodeOpTypes.INSERT,
    targetNode: child,
    parentNode: parent,
  });
}

function parentNode(node) {
  return node.parentNode;
}

function setElementText(el: TestElement, text) {
  logNodeOp({
    type: NodeOpTypes.SET_ELEMENT_TEXT,
    targetNode: el,
    text,
  });
  el.children = [
    {
      id: nodeId++,
      type: NodeTypes.TEXT,
      text,
      parentNode: el,
    },
  ];
}

export const nodeOps = { createElement, insert, parentNode, setElementText };
