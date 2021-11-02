import { MultiplicationTable } from "./MultiplicationTable"
import { range } from "./utils"

export class FiniteGroup<T> {
    private _identity: T
    get identity() { return this._identity }

    readonly order = this.table.size
    readonly elements = this.table.elements

    constructor (public readonly table: Readonly<MultiplicationTable<T>>) {
        if (!table.isRearangable()) throw new TypeError('Group can only be constructed from a rearangable multiplication table.')
        if (!table.isAssociative()) throw new TypeError('Group can only be constructed from an associative multiplication table.')

        const identity = table.findIdentity();
        if (identity === null) throw new TypeError('Group must have a unique both-sided identity element.')

        this._identity = identity
    }

    hasElement(g: T): boolean {
        return this.table.indexMap.has(g)
    }

    multiply(...args: T[]): T {
        return args.reduce((a, b) => this.table.multiply(a, b));
    }

    mul = this.multiply.bind(this)

    /** Quick inverse without type checks */
    _inv = (g: number) => this.table.elements[this.table.data[g].indexOf(this._identity)];

    inverse(g: T): T {
        const { table } = this
        if (!table.indexMap.has(g)) throw new TypeError('Cannot invert an unknown element.')

        const row = this.table.data[table.indexMap.get(g)!]
        const indexOfInverse = row.indexOf(this._identity)

        return this.table.elements[indexOfInverse]
    }

    inv = this.inverse.bind(this)


    private _classes: Set<T>[] | null = null
    private _allClassesFound = false

    classOf(g: T): Set<T> {
        const { elements, mul, inv } = this
        if (this._classes === null) this._classes = []

        let c: Set<T> | undefined
        if (c = this._classes.find(c => c.has(g))) return c

        c = new Set()
        for (let h of elements) {
            c.add(mul(h, g, inv(h)))
        }

        this._classes.push(c)

        return c
    }

    get classes(): readonly Set<T>[] {
        if (this._classes === null) this._classes = []
        if (this._allClassesFound) return this._classes

        for (let g of this.elements) {
            if (this._classes.some(c => c.has(g))) continue
            this._classes.push(this.classOf(g))
        }

        this._allClassesFound = true
        return this._classes
    }
}
