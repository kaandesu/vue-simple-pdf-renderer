import PDFDocument from 'pdfkit'
import * as fs from 'fs'
import { PDFNodes, PDFElements, PDFDocumentElement, PDFTextNode, PDFElement } from './elements'

import { nodeMap } from './nodeOps'
export const renderDocument = (fileName: string = 'file') => {
  const pdf = new PDFDocument()
  const stream = pdf.pipe(fs.createWriteStream(`./${fileName}.pdf`))

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
  stream.on('finish', () => {
    console.log('\nFinished writing on the file. \n')
  })
}
