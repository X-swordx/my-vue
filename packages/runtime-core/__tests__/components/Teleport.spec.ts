import {
  nodeOps,
  serializeInner,
  render,
  h,
  Teleport,
} from '@my-vue/runtime-test';
import { createVNode, Fragment } from '../../src/vnode';

describe('renderer: teleport', () => {
  test('should work', () => {
    const target = nodeOps.createElement('div');
    const root = nodeOps.createElement('div');

    render(
      h(Teleport, { to: target }, [h('div', { id: 'foo' }, 'teleported')]),
      root
    );

    // expect(serializeInner(root)).toMatchInlineSnapshot(
    //   `"<!--teleport start--><!--teleport end--><div>root</div>"`
    // );
    expect(serializeInner(target)).toBe('<div id="foo">teleported</div>');
  });

  // test('should update target', async () => {
  //   const targetA = nodeOps.createElement('div')
  //   const targetB = nodeOps.createElement('div')
  //   const target = ref(targetA)
  //   const root = nodeOps.createElement('div')

  //   render(
  //     h(() => [
  //       h(Teleport, { to: target.value }, h('div', 'teleported')),
  //       h('div', 'root')
  //     ]),
  //     root
  //   )

  //   expect(serializeInner(root)).toMatchInlineSnapshot(
  //     `"<!--teleport start--><!--teleport end--><div>root</div>"`
  //   )
  //   expect(serializeInner(targetA)).toMatchInlineSnapshot(
  //     `"<div>teleported</div>"`
  //   )
  //   expect(serializeInner(targetB)).toMatchInlineSnapshot(`""`)

  //   target.value = targetB
  //   await nextTick()

  //   expect(serializeInner(root)).toMatchInlineSnapshot(
  //     `"<!--teleport start--><!--teleport end--><div>root</div>"`
  //   )
  //   expect(serializeInner(targetA)).toMatchInlineSnapshot(`""`)
  //   expect(serializeInner(targetB)).toMatchInlineSnapshot(
  //     `"<div>teleported</div>"`
  //   )
  // })

  // test('should update children', async () => {
  //   const target = nodeOps.createElement('div')
  //   const root = nodeOps.createElement('div')
  //   const children = ref([h('div', 'teleported')])

  //   render(
  //     h(() => h(Teleport, { to: target }, children.value)),
  //     root
  //   )
  //   expect(serializeInner(target)).toMatchInlineSnapshot(
  //     `"<div>teleported</div>"`
  //   )

  //   children.value = []
  //   await nextTick()

  //   expect(serializeInner(target)).toMatchInlineSnapshot(`""`)

  //   children.value = [createVNode(Text, null, 'teleported')]
  //   await nextTick()

  //   expect(serializeInner(target)).toMatchInlineSnapshot(`"teleported"`)
  // })
});
