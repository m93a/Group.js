import { FiniteGroup } from './FiniteGroup'
import { MultiplicationTable } from './MultiplicationTable'
import { isNonnegativeInteger } from './utils'


function createSubgroupMultiplicationTable<T>(supergroup: FiniteGroup<T>, elements: T[]): MultiplicationTable<T> {
    const data: T[][] = []
    const N = elements.length

    for (let i = 0; i < N; i++) {
        if (data[i] === undefined) data[i] = []

        for (let j = 0; j < N; j++) {
            let g = supergroup.multiply(elements[i], elements[j])

            if (!elements.includes(g)) throw new TypeError('The supposed subgroup is not closed under multiplication.')
            data[i][j] = g
        }
    }

    return new MultiplicationTable(elements, data)
}

export class FiniteSubgroup<T> extends FiniteGroup<T> {
    constructor (public supergroup: FiniteGroup<T>, public elements: T[]) {
        super(createSubgroupMultiplicationTable(supergroup, elements))
    }

    private _isNormal: boolean | null = null
    get isNormal() {
        if (this._isNormal === null) this._isNormal = this._computeIsNormal()
        return this._isNormal
    }
    private _computeIsNormal() {
        const { elements, supergroup, mul, inv } = this

        for (let g of supergroup.elements) {
            if (this.hasElement(g)) continue

            for (let h of this.elements) {
                if (!this.hasElement(mul(g, h, inv(g)))) return false
            }
        }

        return true
    }
}
