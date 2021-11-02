import { isNonnegativeInteger } from './utils';

export class MultiplicationTable<T> {
    private _size: number
    get size() { return this._size }

    /** Quickly find the index of an element */
    readonly indexMap: Map<T, number>

    constructor (public readonly elements: T[], public readonly data: T[][]) {
        this.validate()
        this._size = data.length

        this.indexMap = new Map(elements.map((g, i) => [g, i]))
    }

    private validate() {
        const { elements, data } = this

        if (!Array.isArray(elements)) throw new TypeError('List of elements must be an array.')
        if (!Array.isArray(data)) throw new TypeError('Multiplication table data must be an array.')
        if (elements.length !== data.length) throw new TypeError('Multiplication table must have as many rows as there are elements.')
        if ((new Set(elements).size !== elements.length)) throw new TypeError('List of elements must not contain duplicate items.')

        if (elements.includes(undefined as any) || elements.includes(null as any) || elements.includes(NaN as any))
            throw new TypeError('NaN, null and undefined are not allowed as elements.')

        const size = elements.length

        for (let i = 0; i < size; i++) {
            const row = data[i]
            if (!Array.isArray(row)) throw new TypeError('Each row of the multiplication table must be an array.')
            if (row.length !== size) throw new TypeError('The multiplication table must be square.')

            for (let j = 0; j < size; j++) {
                if (elements.indexOf(row[j]) === -1) throw new TypeError('The multiplication table contains an unknown element.')
            }
        }
    }

    multiply(a: T, b: T): T {
        const { data, indexMap } = this

        if (!indexMap.has(a) || indexMap.has(b)) throw new TypeError('The elements to multiply were not found in the table.')

        return data[indexMap.get(a)!][indexMap.get(b)!];
    }

    mul = this.multiply.bind(this)

    isRearangable(): boolean {
        const { elements, size, mul, indexMap } = this
        const rowAttendance = Array<boolean>(size)
        const colAttendance = Array<boolean>(size)

        for (let a of elements) {
            rowAttendance.fill(false)
            colAttendance.fill(false)

            for (let b of elements) {
                const i = indexMap.get(mul(a, b))!
                if (rowAttendance[i]) return false
                rowAttendance[i] = true

                const j = indexMap.get(mul(b, a))!
                if (colAttendance[j]) return false
                colAttendance[j] = true
            }
        }

        return true
    }

    isAssociative(): boolean {
        const { elements, mul } = this

        for (let a of elements)
        for (let b of elements)
        for (let c of elements) {
            if (mul(a, mul(b, c)) !== mul(mul(a, b), c)) return false
        }

        return true
    }

    findLeftIdentities(): T[] {
        const { elements, mul } = this
        const identities: T[] = []

        outer:
        for (let e of elements) {
            for (let x of elements) {
                if (mul(e, x) !== x) continue outer
            }
            identities.push(e)
        }

        return identities
    }

    findRightIdentities(): T[] {
        const { elements, mul } = this
        const identities: T[] = []

        outer:
        for (let e of elements) {
            for (let x of elements) {
                if (mul(x, e) !== x) continue outer
            }
            identities.push(e)
        }

        return identities
    }

    /** Find the unique both-sided identity */
    findIdentity(): T | null {
        const { elements, mul } = this
        let identity: T | null = null

        findLeftIdentity:
        for (let e of elements) {
            for (let x of elements) {
                if (mul(e, x) !== x) continue findLeftIdentity
            }
            identity = e
            break
        }

        if (identity === null) return null

        // verify it is also a right identity
        for (let x of elements) {
            if (mul(x, identity) !== x) return null
        }

        return identity
    }

    findLeftAbsorbers(): T[] {
        const { elements, mul } = this
        const absorbers: T[] = []

        outer:
        for (let z of elements) {
            for (let x of elements) {
                if (mul(z, x) !== z) continue outer
            }
            absorbers.push(z)
        }

        return absorbers
    }

    findRightAbsorbers(): T[] {
        const { elements, mul } = this
        const absorbers: T[] = []

        outer:
        for (let z of elements) {
            for (let x of elements) {
                if (mul(x, z) !== z) continue outer
            }
            absorbers.push(z)
        }

        return absorbers
    }

    /** Find the unique both-sided absorber */
    findAbsorber(): T | null {
        const { elements, mul } = this
        let absorber: T | null = null

        findLeftAbsorber:
        for (let z of elements) {
            for (let x of elements) {
                if (mul(z, x) !== z) continue findLeftAbsorber
            }
            absorber = z
            break
        }

        if (absorber === null) return null

        // verify it is also a right absorber
        for (let x of elements) {
            if (mul(x, absorber) !== absorber) return null
        }

        return absorber
    }

    /** Find x, such that xa = b */
    solveLeft(a: T, b: T): T | null {
        const { elements, mul, indexMap } = this

        if (!indexMap.has(a) || !indexMap.has(b)) throw new TypeError('Cannot solve for an unknown element.')

        for (let x of elements) {
            if (mul(x, a) == b) return x
        }

        return null
    }

    /** Find x, such that ax = b */
    solveRight(a: T, b: T): T | null {
        const { elements, mul, indexMap } = this

        if (!indexMap.has(a) || !indexMap.has(b)) throw new TypeError('Cannot solve for an unknown element.')

        for (let x of elements) {
            if (mul(a, x) == b) return x
        }

        return null
    }
}
