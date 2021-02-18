import { readFileSync } from "fs";
import {parse} from './html'
import {resolve} from 'path'

const source = readFileSync(resolve(__dirname, '../examples/test.html'))

console.log(source.toString())

const a = parse(source.toString() + 'FFDFD')
console.log(JSON.stringify(a, null, 2))

