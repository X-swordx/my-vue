// todo
// 实现 render 的渲染接口
// 实现序列化
import { createRenderer } from '@my-vue/runtime-core';
import { extend } from '@my-vue/shared';
import { nodeOps } from './nodeOps';
import { patchProp } from './patchProp';

export const { render } = createRenderer(extend({ patchProp }, nodeOps));

export * from './nodeOps';
export * from './serialize';
export * from '@my-vue/runtime-core';
