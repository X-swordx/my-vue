import { NodeTypes } from "./ast";

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context))
}

function parseChildren(context) {
  const nodes: object[] = []
  let node;
  const s = context.source
  if (s.startsWith("{{")) {
    node = parseInterpolation(context)
  } else if (s[0] === "<") {
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context)
    }
  }
  if(!node) {
    node = parseText(context);
  }

  nodes.push(node)
  return nodes
}

function parseInterpolation(context) {
  // {{message}}
  const openDelimiter = "{{"
  const closeDelimiter = "}}"

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

  advanceBy(context, openDelimiter.length)
  const rawContentLength = closeIndex - openDelimiter.length
  const rawContent = parseTextData(context, rawContentLength)
  const content = rawContent.trim()
  advanceBy(context, content.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}

function parseElement(context: any) {
  const element = parseTag(context, TagType.Start)
  parseTag(context, TagType.End)

  return element
}

function parseTag(context: any, type: TagType) {
  // <div></div>
  const match: RegExpExecArray | null = /^<\/?([a-z]*)/i.exec(context.source)
  // console.log('match ', match)
  const tag = match![1]

  advanceBy(context, match![0].length + 1)

  if(type === TagType.End) return
  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

function createRoot(children) {
  return {
    children,
  };
}

function createParserContext(content: string): any {
  return {
    source: content,
  };
}

// 推进：删除已经处理好的模板
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}

function parseText(context: any) {
  const content = parseTextData(context, context.source.length);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}

function parseTextData(context: any, length) {
  const content = context.source.slice(0, length);

  advanceBy(context, length);
  return content;
}
