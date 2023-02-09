import { effect } from '@my-vue/reactivity';
import { EMPTY_OBJ, ShapeFlags } from '@my-vue/shared';
import { createComponentInstance, setupComponent } from './component';
import { createAppAPI } from './createApp';
import { Fragment, Text, normalizeVNode } from './vnode';
import { shouldUpdateComponent } from './componentUpdateUtils';
import { queueJobs } from './scheduler';

export function createRenderer(options) {
  // 获取用户传入的自定义渲染方法
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    createText: hostCreateText,
  } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null, null);
  }
  // n1 -> oldVnode
  // n2 -> newVnode
  function patch(n1, n2, container, anchor, parentComponent = null) {
    // 判断 vnode 是 element 还是 component 类型
    const { shapeFlag, type } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, anchor, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, anchor, parentComponent);
        }
        break;
    }
  }

  function processText(n1, n2: any, container: any) {
    if (n1 === null) {
      // n1 是 null 说明是 init 的阶段
      // 基于 createText 创建出 text 节点，然后使用 insert 添加到 el 内
      hostInsert((n2.el = hostCreateText(n2.children as string)), container);
    } else {
      // update
      // 先对比一下 updated 之后的内容是否和之前的不一样
      // 在不一样的时候才需要 update text
      // 这里抽离出来的接口是 setText
      // 注意，这里一定要记得把 n1.el 赋值给 n2.el, 不然后续是找不到值的
      const el = (n2.el = n1.el!);
      if (n2.children !== n1.children) {
        console.log('更新 Text 类型的节点');
        hostSetText(el, n2.children as string);
      }
    }
  }

  function processFragment(
    n1: any,
    n2: any,
    container: any,
    anchor,
    parentComponent
  ) {
    // 只需要渲染 children ，然后给添加到 container 内
    if (!n1) {
      // 初始化 Fragment 逻辑点
      console.log('初始化 Fragment 类型的节点');
      mountChildren(n2.children, container, parentComponent, anchor);
    }
  }

  function processElement(
    n1,
    n2: any,
    container: any,
    anchor,
    parentComponent
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function patchElement(n1, n2, container, anchor, parentComponent) {
    console.log('patchElement');
    console.log('n1', n1);
    console.log('n2', n2);

    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    const el = (n2.el = n1.el);

    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(n1, n2, container, anchor, parentComponent) {
    const prevShapeFlag = n1.shapeFlag;
    const nextShapeFlag = n2.shapeFlag;
    const c1 = n1.children;
    const c2 = n2.children;

    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // array -> text
        unmountChildren(c1);
        hostSetElementText(container, c2);
      } else {
        if (c1 !== c2) {
          // text -> text
          hostSetElementText(container, c2);
        }
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // text -> array
        hostSetElementText(container, '');
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // array -> array 用 diff算法对比
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentAnchor,
    parentComponent
  ) {
    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    function isSomeVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }
    // 左侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }
    // 右侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    // 两端对比完，下面对不相同的节点进行处理
    // 1、新的比老的长
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      ///2、老的比新的长
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      //3、中间对比
      let s1 = i;
      let s2 = i;

      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      // key 的作用是把复杂度从O(n) -> O(1)
      const keyToNewIndexMap = new Map();
      const newIndexToOldIndexMap = new Array(toBePatched);
      // 判断是否需要移动，需要才去创建最长递增子序列
      let moved = false;
      let maxNewIndexSoFar = 0;
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }
        let newIndex;
        // 如果用户写了key
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          // 没写key，就要去遍历
          for (let j = s2; j < e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        // 在新节点不存在
        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          // 优化点
          // 前一个索引比后一个索引大，说明不需要移动
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }

          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length - 1;

      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;

        if (newIndexToOldIndexMap[i] === 0) {
          // 新的在老的里面没有，需要创建
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }
      // 刪除prop为undefined或者null的
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
  }

  function mountElement(vnode: any, container, anchor, parentComponent) {
    const { type, props, children, shapeFlag } = vnode;
    // 1. 先创建 element
    // 基于可扩展的渲染 api
    const el = (vnode.el = hostCreateElement(type));
    // 支持单子组件和多子组件的创建
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 举个栗子
      // render(){
      //     return h("div",{},"test")
      // }
      // 这里 children 就是 test ，只需要渲染一下就完事了
      console.log(`处理文本:${vnode.children}`);
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 举个栗子
      // render(){
      // Hello 是个 component
      //     return h("div",{},[h("p"),h(Hello)])
      // }
      // 这里 children 就是个数组了，就需要依次调用 patch 递归来处理
      mountChildren(children, el, parentComponent, anchor);
    }

    if (props) {
      for (const key in props) {
        // todo
        // 需要过滤掉vue自身用的key
        // 比如生命周期相关的 key: beforeMount、mounted
        const val = props[key];
        hostPatchProp(el, key, null, val);
      }
    }

    hostInsert(el, container, anchor);

    // todo
    // 触发 mounted() 钩子
    console.log('vnodeHook  -> onVnodeMounted');
    console.log('DirectiveHook  -> mounted');
    console.log('transition  -> enter');
  }

  function mountChildren(children: any, container, anchor, parentComponent) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  function processComponent(
    n1,
    n2: any,
    container: any,
    anchor,
    parentComponent
  ) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  function mountComponent(
    initialVnode: any,
    container,
    anchor,
    parentComponent
  ) {
    const instance = (initialVnode.component = createComponentInstance(
      initialVnode,
      parentComponent
    ));

    setupComponent(instance);
    setupRenderEffect(instance, initialVnode, container, anchor);
  }

  function setupRenderEffect(instance: any, initialVnode, container, anchor) {
    instance.update = effect(
      () => {
        const { proxy } = instance;
        if (!instance.isMounted) {
          console.log('init');
          // 执行h函数也就是createVNode返回一个vnode
          const subTree = (instance.subTree = normalizeVNode(
            instance.render?.call(proxy, proxy)
          ));
          patch(null, subTree, container, instance, anchor);
          // 挂载 $el
          initialVnode.el = subTree.el;
          instance.isMounted = true;
        } else {
          console.log('updateComponent');
          const { vnode, next } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }
          const nextTree = normalizeVNode(instance.render.call(proxy, proxy));
          const prevSubTree = instance.subTree;
          instance.subTree = nextTree;
          patch(prevSubTree, nextTree, container, instance, anchor);
        }
      },
      {
        // 实现视图异步更新
        scheduler() {
          queueJobs(instance.update);
        },
      }
    );
  }

  return {
    render,
    createApp: createAppAPI(render),
  };
}

function updateComponentPreRender(instance, nextVNode) {
  instance.vnode = nextVNode;
  instance.next = null;
  instance.props = nextVNode.props;
}

// 最长递增子序列算法
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
