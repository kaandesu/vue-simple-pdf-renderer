import { defineComponent, h } from 'vue'
export class PDFNode {
  id = (Math.random() * 10000).toFixed(0)
  parent?: string
  children: string[] = []
  styles: Record<string, string>
  constructor() {
    this.styles = {}
  }
}

export class PDFTextNode extends PDFNode {
  text: string
  constructor(value: string) {
    super()
    this.text = value
  }
}

export class PDFElement extends PDFNode {}

export class PDFTextElement extends PDFElement {}
export class PDFViewElement extends PDFElement {}
export class PDFDocumentElement extends PDFElement {
  id = 'root'
  constructor() {
    super()
  }
}

export type PDFNodes = PDFTextNode
export type PDFElements = PDFTextElement | PDFViewElement | PDFDocumentElement

const definePDFComponent = (tag: string) => {
  return defineComponent({
    inheritAttrs: false,
    name: tag,
    render() {
      return h(tag, this.$attrs, this.$slots?.default?.() || [])
    },
  })
}

export const View = definePDFComponent('View')
export const Text = definePDFComponent('Text')
export const Document = definePDFComponent('Document')
