import { createRenderer, compile, defineComponent, RendererOptions, h } from 'vue'
import PDFDocument from 'pdfkit'
import * as fs from 'fs'
import { isThisTypeNode } from 'typescript'

class PDFNode {
  id = (Math.random() * 10000).toFixed(0)
  parent?: string
  children: string[] = []
  styles: Record<string, string>
  constructor() {
    this.styles = {}
  }
}

class PDFTextNode extends PDFNode {
  text: string
  constructor(value: string) {
    super()
    this.text = value
  }
}

class PDFElement extends PDFNode {}

class PDFTextElement extends PDFElement {}
class PDFViewElement extends PDFElement {}
class PDFDocumentElement extends PDFElement {
  id = 'root'
  constructor() {
    super()
  }
}

type PDFNodes = PDFTextNode
type PDFElements = PDFTextElement | PDFViewElement | PDFDocumentElement

const pdf = new PDFDocument()
const stream = pdf.pipe(fs.createWriteStream('./file.pdf'))

const definePDFComponent = (tag: string) => {
  return defineComponent({
    name: tag,
    render() {
      return h(tag, this.$attrs, this.$slots?.default?.())
    },
  })
}

const View = definePDFComponent('View')
const Text = definePDFComponent('Text')
const Document = definePDFComponent('Document')

const App = defineComponent({
  components: { Text, View },
  data() {
    return {
      colors: ['pink', 'blue', 'green'],
    }
  },
  render: compile(`
    <View>
      <View :styles="{color: 'red'}">
        <Text v-for="color in colors" :styles="{color}">
          {{ color }}
        </Text>
        <Text>Red</Text>
      </View>
      <Text>Default</Text>
      <Text :styles="{color: 'yellow'}">Yellow</Text>
    </View>
    `),
})

function noop(fn: string): any {
  throw Error(`no-op: ${fn}`)
}

const nodeMap: Record<string, PDFNodes | PDFElements> = {}

export const nodeOps: RendererOptions<PDFNodes, PDFElements> = {
  patchProp: (el, key, prevVal, nextVal) => {
    console.log('patchProp', { el, key, prevVal, nextVal })
    if (key === 'styles') {
      el.styles = { ...el.styles, ...nextVal }
    }
  },

  insert: (child, parent, anchor) => {
    if (parent instanceof PDFDocumentElement) {
      nodeMap[parent.id] = parent
    }
    if (!(child.id in nodeMap)) {
      nodeMap[child.id] = child
    }

    parent.children.push(child.id)
    child.parent = parent.id

    console.log('insert', { parent, child })
  },

  createElement: (tag) => {
    if (tag === 'View') return new PDFViewElement()
    if (tag === 'Text') return new PDFTextElement()
    console.log(`createElement: ${tag}`)
    throw Error(`Illigal tag ${tag}`)
  },

  createText: (text) => {
    console.log(`createText: ${text}`)
    return new PDFTextNode(text)
  },

  parentNode: (node) => {
    console.log('parentNode')
    return null
  },

  createComment: (text): any => {
    console.log(`createComment ${text}`)
    return text
  },

  setText: () => noop('setText'),
  setElementText: () => noop('setElementText'),
  nextSibling: () => noop('nextSibling'),
  querySelector: () => noop('querySelector'),
  setScopeId: () => noop('setScopeId'),
  cloneNode: () => noop('cloneNode'),
  insertStaticContent: () => noop('insertStaticContent'),
  remove: () => noop('remove'),
}

const { createApp } = createRenderer(nodeOps)

const app = createApp(App)
const vm = app.mount(new PDFDocumentElement())

const defaultStyles: Record<string, string> = {
  color: 'black',
}

const getParentStyle = (attr: string, parent: PDFNodes | PDFElements): string => {
  if (parent instanceof PDFDocumentElement) return defaultStyles[attr]

  if (attr in parent.styles) {
    return parent.styles[attr]
  }
  if (parent.parent !== undefined) return getParentStyle(attr, nodeMap[parent.parent])
  return defaultStyles[attr]
}

const draw = (node: PDFNodes | PDFElements) => {
  const color = getParentStyle('color', node)
  pdf.fill(color)

  for (const [key, val] of Object.entries(node.styles)) {
    if (key === 'color') {
      pdf.fill(val)
    }
  }
  if (node instanceof PDFTextNode) {
    pdf.text(node.text)
  }
}

const traverse = (node: PDFNodes | PDFElements) => {
  if (node instanceof PDFElement) {
    for (const child of node.children) {
      draw(nodeMap[child])
      traverse(nodeMap[child])
    }
  }
}

const rootNode = nodeMap['root']
pdf.fontSize(40)
traverse(rootNode)

pdf.end()
stream.on('end', () => {
  console.log('Finish \n \n \n')
})
