import { NodeTypes } from "./ast";

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context, []))
}

function parseChildren(context, ancestors) {
  const nodes: object[] = []

  while (!isEnd(context, ancestors)) {
    let node;
    const s = context.source
    // 插值类型
    if (s.startsWith("{{")) {
      node = parseInterpolation(context)
    } else if (s[0] === "<") {
      // element类型
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    }
    // 文本类型
    if (!node) {
      node = parseText(context);
    }
    nodes.push(node)
  }
  return nodes
}

function isEnd(context, ancestors) {
  const s = context.source
  if (s.startsWith("</")) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag
      if (startsWithEndTagOpen(s, tag)) {
        return true
      }
    }
  }
  return !s
}

function parseText(context: any) {
  let endIndex = context.source.length
  let endTokens = ["<", "{{"];
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }
  const content = parseTextData(context, endIndex);

  return {
    type: NodeTypes.TEXT,
    content,
  };
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
  advanceBy(context, closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}

function parseElement(context: any, ancestors) {
  const element: any = parseTag(context, TagType.Start)
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  } else {
    throw new Error(`缺少结束标签:${element.tag}`)
  }

  return element
}

function parseTag(context: any, type: TagType) {
  // <div></div>
  const match: RegExpExecArray | null = /^<\/?([a-z]*)/i.exec(context.source)
  // console.log('match ', match)
  const tag = match![1]

  advanceBy(context, match![0].length);
  advanceBy(context, 1);

  if (type === TagType.End) return
  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

function createRoot(children) {
  return {
    children,
    type: NodeTypes.ROOT
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

function parseTextData(context: any, length) {
  const content = context.source.slice(0, length);

  advanceBy(context, length);
  return content;
}

// 判断首尾标签是否一样
function startsWithEndTagOpen(source, tag) {
  return (
    source.startsWith("</") &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  );
}
