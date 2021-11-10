import { FiniteGroup } from './FiniteGroup'
import { MultiplicationTable } from './MultiplicationTable'

type PointGroupName =
    `C${number}` | `S${number}` | `C${number}h` |
    `C${number}v` | `D${number}` | `D${number}d` | `D${number}h`

type PointGroupElement = `e` |
    `C${number}` | `C${number}^${number}` |
    `S${number}` | `S${number}^${number}` |
    `r` | `rC${number}` | `rC${number}^${number}` |
    `U` | `UC${number}` | `UC${number}^${number}`

interface GeneratorElement {
    type: 'cyclic' | 'spiegel' | 'reflection' | 'diag-reflection' | 'flip'
    fold: number
}

const REGEX_SCHOENFLIES = /[CSD](\d+)[hvd]?/

function parseSchoenflies(name: PointGroupName) {
    let type: 'cyclic' | 'spiegel' | 'dihedral'
    switch (name[0]) {
        case 'C':
            type = 'cyclic'
            break

        case 'S':
            type = 'spiegel'
            break

        case 'D':
            type = 'dihedral'
            break

        default:
            throw new TypeError('Unknown point group name: ' + name)
    }

    let reflection: 'none' | 'horizontal' | 'vertical' | 'diagonal'
    switch (name[name.length-1]) {
        case 'h':
            reflection = 'horizontal'
            break

        case 'v':
            reflection = 'vertical'
            break

        case 'd':
            reflection = 'diagonal'
            break

        default:
            reflection = 'none'
            break
    }

    let fold = parseInt(name.match(REGEX_SCHOENFLIES)?.[1]!)
    if (isNaN(fold)) throw new TypeError(`Failed to parse symbol: ${name}. Found a NaN-fold rotation axis.`)
    if (name[1] === '0') throw new TypeError('Number of n-fold rotation must not begin with zero, got: ' + name)

    return {
        type, fold, reflection
    }
}

const multiplicationTableCache = new Map<PointGroupName, MultiplicationTable<PointGroupElement>>()

function findGeneratorElements(schoenflies: PointGroupName): GeneratorElement[] {
    const elems: GeneratorElement[] = []
    const { type, fold, reflection } = parseSchoenflies(schoenflies)

    switch (type) {
        case 'cyclic':
            elems.push({ type: 'cyclic', fold })
            break

        case 'spiegel':
            elems.push({ type: 'spiegel', fold })
            if (fold % 2 !== 0) throw new TypeError(`S(n) only makes sense for even n, got: ${fold}`)
            break

        case 'dihedral':
            elems.push({ type: 'cyclic', fold })
            elems.push({ type: 'flip', fold: 2 })
    }

    switch (reflection) {
        case 'horizontal':
            if (type === 'spiegel') throw new TypeError(`S${fold}v is not a valid symbol – it is the same as S${fold}.`)
            elems.push({ type: 'spiegel', fold: 1 })
            break

        case 'vertical':
            if (type !== 'cyclic') throw new TypeError('Vertical reflection is only valid in C(n)v. For dihedral group, use D(n)d or D(n)h.')
            elems.push({ type: 'reflection', fold: 2 })
            break

        case 'diagonal':
            if (type !== 'dihedral') throw new TypeError('Diagonal reflection is only valid for dihedral group.')
            elems.push({ type: 'reflection', fold: 2 })
            elems.push({ type: 'diag-reflection', fold: 2 })
            break
    }

    return elems
}

export class PointGroup extends FiniteGroup<PointGroupElement> {
    constructor (schoenflies: PointGroupName) {
        let table: MultiplicationTable<PointGroupElement>

        if (multiplicationTableCache.has(schoenflies)) {
            table = multiplicationTableCache.get(schoenflies)!
        } else {
            const { type, fold, reflection } = parseSchoenflies(schoenflies)
            table = null as any
        }

        super(table)
    }
}
