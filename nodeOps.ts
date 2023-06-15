import { RendererOptions } from 'vue'
import {
  PDFNodes,
  PDFElements,
  PDFDocumentElement,
  PDFViewElement,
  PDFTextElement,
  PDFTextNode,
} from './elements'

function noop(fn: string): any {
  throw Error(`no-op: ${fn}`)
}
export const nodeMap: Record<string, PDFNodes | PDFElements> = {}

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
