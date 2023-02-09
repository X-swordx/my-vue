import {
  h,
  render,
  nodeOps,
  NodeTypes,
  TestElement,
  TestText,
  serialize,
} from '../src';

describe('test renderer', () => {
  it('should work', () => {
    // 这里不是创建真实的dom，而是创建vdom,这样测试速度会非常快
    const root = nodeOps.createElement('div');
    render(
      h(
        'div',
        {
          id: 'test',
        },
        'hello'
      ),
      root
    );

    expect(root.children.length).toBe(1);

    const el = root.children[0] as TestElement;
    expect(el.type).toBe(NodeTypes.ELEMENT);
    expect(el.props.id).toBe('test');
    expect(el.children.length).toBe(1);

    const text = el.children[0] as TestText;
    expect(text.type).toBe(NodeTypes.TEXT);
    expect(text.text).toBe('hello');
  });

  it('should be able to serialize nodes', () => {
    const root = nodeOps.createElement('div');
    render(
      h(
        'div',
        {
          id: 'test',
          boolean: '',
        },
        'hello'
      ),
      root
    ),
      expect(serialize(root)).toEqual(
        `<div><div id="test" boolean>hello</div></div>`
      );
  });
});
