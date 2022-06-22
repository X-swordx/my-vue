import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // 判断 vnode 是 element 还是 component 类型
  const { shapeFlag } = vnode
  if(shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container);
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container) {
  const {type, props, children, shapeFlag} = vnode;
  const el = (vnode.el = document.createElement(type));

  if(props) {
    for (const key in props) {
      el.setAttribute(key, props[key]);
    }
  }

  if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el)
  }

  container.append(el)
}

function mountChildren(children: any, container) {
  children.forEach(v => {
    patch(v, container)
  });
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(initialVnode: any, container) {
  const instance = createComponentInstance(initialVnode);

  setupComponent(instance);
  setupRenderEffect(instance, initialVnode, container);
}

function setupRenderEffect(instance: any, initialVnode, container) {
  const { proxy } = instance
  // 执行h函数也就是createVNode返回一个vnode
  const subTree = instance.render.call(proxy); 

  patch(subTree, container);
  // 挂载 $el
  initialVnode.el = subTree.el
}
