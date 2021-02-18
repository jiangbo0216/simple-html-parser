// Node type + children
// type 分为文本和element元素

export class Node {
  child: Node[]

  node_type: InstanceType< ValueTypeOfNodeType>

  constructor (child: Node[], node_type: InstanceType <ValueTypeOfNodeType>) {
    this.child = child
    this.node_type = node_type
  }
}

class ElementData {
  tag_name: string

  attributes: AttrMap

  constructor(tag_name: string, attributes: AttrMap) {
    this.tag_name = tag_name
    this.attributes = attributes
  }

  id () {
    return this.attributes.get('id') || ''
  }

  classes () {
    return this.attributes.get('class') || ''
  }
}

const NodeType = {
  Element: ElementData,
  Text: String
}

type ValueType<T, K extends keyof T> = T[K]

type ValueTypeOfNodeType = ValueType<typeof NodeType, keyof typeof NodeType>
// type Node = {
//   child: Node[],
//   node_type: NodeType
// }

// type ElementData = {
//   tag_name: string,
//   attribute: AttrMap;
// }

export function text(data: string) {
  return new Node([], data)
}

export function elem(name: string, attrs: AttrMap, children: Node[]) {
  return new Node(children, new NodeType.Element(name, attrs))
}



type AttrMap = Map<string, string>
