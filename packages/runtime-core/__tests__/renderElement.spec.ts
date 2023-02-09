/*
 * @Author: zhengchengxuan 534370078@qq.com
 * @Date: 2023-02-09 19:53:51
 * @LastEditors: zhengchengxuan 534370078@qq.com
 * @LastEditTime: 2023-02-09 22:38:18
 * @FilePath: \my-vue\packages\runtime-core\__tests__\renderElement.spec.ts
 * @Description:
 */
import { h } from '@my-vue/runtime-core';
import { nodeOps, render, serializeInner as inner } from '@my-vue/runtime-test';

describe('renderer: element', () => {
  let root;

  beforeEach(() => {
    root = nodeOps.createElement('div');
  });

  it('should create an element', () => {
    render(h('div'), root);
    expect(inner(root)).toBe('<div></div>');
  });

  it('should create an element with props', () => {
    render(h('div', { id: 'foo', class: 'bar' }, []), root);
    expect(inner(root)).toBe('<div id="foo" class="bar"></div>');
  });
  it('should create an element with direct text children and props', () => {
    render(h('div', { id: 'foo' }, 'bar'), root);
    expect(inner(root)).toBe('<div id="foo">bar</div>');
  });
});
