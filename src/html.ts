import {text, elem, Node} from './dom'
import assert from 'assert'

export function parse(source:string): Node {
  let nodes = new Parser({pos: 0, input: source}).parse_nodes()
  if (nodes.length === 1) {
    return nodes[0]
  }
  return elem('html', new Map(), nodes)
}

class Parser {
  pos: number
  input: string

  constructor({pos, input}: {pos: number, input: string}) {
    this.pos = pos
    this.input = input
  }

  parse_nodes (): Node[] {
    let nodes = []
    loop:
    while (true) {
      // 递归下降语法分析
      this.consume_whitespace() // 空格
      if (this.eof() || this.starts_with('</')) {
        break
      }
      nodes.push(this.parse_node())
    }
    return nodes
  }

  parse_node (): Node {
    if (this.next_char() === '<') {
      return this.parse_element()
    } else {
      return this.parse_text()
    }
  }

  parse_element (): Node {
    assert(this.consume_char() === '<', '没有找到 < ')
    const tag_name = this.parse_tag_name()
    const attrs = this.parse_attributes()
    assert(this.consume_char() === '>', '没有找到 > ')

    let children = this.parse_nodes();

    assert(this.consume_char() === '<')
    assert(this.consume_char() === '/')
    assert(this.parse_tag_name() === tag_name)
    assert(this.consume_char() === '>')

    return elem(tag_name, attrs, children)
  }

  parse_tag_name () {
    return this.consume_while(s => !!s.match(/[a-zA-Z0-9]/)  )
  }

  parse_attributes () {
    let attributes = new Map()
    loop:
    while (true) {
      this.consume_whitespace()
      if (this.next_char() === ">") {
        break
      }
      const [name, value] = this.parse_attr()
      attributes.set(name, value)
    }
    return attributes
  }

  parse_attr (): [string, string] {
    const name = this.parse_tag_name()
    assert(this.consume_char() === '=', '没有找到 = ')
    const value = this.parse_attr_value()
    return [name, value]
  }

  parse_attr_value (): string {
    const open_quote = this.consume_char()
    assert( ['"', '\''].includes(open_quote), '未找到" 或者 \'')
    const value = this.consume_while(s => s !== open_quote)
    assert(this.consume_char() === open_quote, '未找到匹配得 " 或者 \'')
    return value
  }


  parse_text (): Node {
    return text(this.consume_while(s => s!=="<"))
  }
  
  //Consume and discard zero or more whitespace characters.
  consume_whitespace () {
    this.consume_while((s: string) => !!s.match(/^([\s\t\r\n]*)$/))
  }

  consume_while (test: (s: string) => boolean) {
    let result = ''
    while (!this.eof() && test(this.next_char())) {
      result = result.concat(this.consume_char())
    }
    return result
  }

  next_char () {
    return this.input[this.pos]
  }

  consume_char () {
    // 处理js字符编码
    const char = this.input[this.pos]
    this.pos++
    return char
  }

  eof () {
    return this.pos >= this.input.length
  }

  starts_with (s: string): boolean {
    return this.input.slice(this.pos).startsWith(s)
  }
}


