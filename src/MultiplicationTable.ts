
function isNonnegativeInteger(n: number): boolean {
    return typeof n === 'number' && n === (n|0) && n > 0
}

export class MultiplicationTable {
    private _size: number
    public get size() { return this._size }

    constructor (public data: number[][]) {
        MultiplicationTable.validateData(data)
        this._size = data.length
    }

    static validateData(data: number[][]): void {
        if (!Array.isArray(data)) throw new TypeError('Multiplication table data must be an array.')
        const size = data.length

        for (let i = 0; i < size; i++) {
            const row = data[i]
            if (!Array.isArray(row)) throw new TypeError('Each row of the multiplication table must be an array.')
            if (row.length !== size) throw new TypeError('The multiplication table must be square.')

            for (let j = 0; j < size; j++) {
                const el = row[j];
                if (!isNonnegativeInteger(el)) throw new TypeError('Each element of the multiplication table must be a nonnegative integer.')
                if (el >= size) throw new TypeError('Each element must be less than the size of the multiplication table.')
            }
        }
    }

    /** Quick multiplication without type checks */
    _mul = (a: number, b: number) => this.data[a][b];

    multiply(a: number, b: number): number {
        const { size, data } = this

        if (!isNonnegativeInteger(a) || !isNonnegativeInteger(b)) throw TypeError('Arguments must be nonnegative integers.')
        if (a >= size || b >= size) throw TypeError('Arguments must be smaller than the size of the table.')

        return data[a][b];
    }

    isRearangable(): boolean {
        const { size, _mul } = this
        const rowAttendance = Array<boolean>(size)
        const colAttendance = Array<boolean>(size)

        for (let a = 0; a < size; a++) {
            rowAttendance.fill(false)
            colAttendance.fill(false)

            for (let b = 0; b < size; b++) {
                const c = _mul(a, b)
                if (rowAttendance[c]) return false
                rowAttendance[c] = true

                const d = _mul(b, a)
                if (colAttendance[d]) return false
                colAttendance[d] = true
            }
        }

        return true
    }

    isAssociative(): boolean {
        const { size, _mul } = this

        for (let a = 0; a < size; a++)
        for (let b = 0; b < size; b++)
        for (let c = 0; c < size; c++) {
            if (_mul(a, _mul(b, c)) !== _mul(_mul(a, b), c)) return false
        }

        return true
    }

    findLeftIdentities(): number[] {
        const { size, _mul } = this
        const identities: number[] = []

        outer:
        for (let e = 0; e < size; e++) {
            for (let x = 0; x < size; x++) {
                if (_mul(e, x) !== x) continue outer
            }
            identities.push(e)
        }

        return identities
    }

    findRightIdentities(): number[] {
        const { size, _mul } = this
        const identities: number[] = []

        outer:
        for (let e = 0; e < size; e++) {
            for (let x = 0; x < size; x++) {
                if (_mul(x, e) !== x) continue outer
            }
            identities.push(e)
        }

        return identities
    }

    /** Find the unique both-sided identity */
    findIdentity(): number | null {
        const { size, _mul } = this
        let identity: number | null = null

        findLeftIdentity:
        for (let e = 0; e < size; e++) {
            for (let x = 0; x < size; x++) {
                if (_mul(e, x) !== x) continue findLeftIdentity
            }
            identity = e
            break
        }

        if (identity === null) return null

        // verify it is also a right identity
        for (let x = 0; x < size; x++) {
            if (_mul(x, identity) !== x) return null
        }

        return identity
    }

    findLeftAbsorbers(): number[] {
        const { size, _mul } = this
        const absorbers: number[] = []

        outer:
        for (let z = 0; z < size; z++) {
            for (let x = 0; x < size; x++) {
                if (_mul(z, x) !== z) continue outer
            }
            absorbers.push(z)
        }

        return absorbers
    }

    findRightAbsorbers(): number[] {
        const { size, _mul } = this
        const absorbers: number[] = []

        outer:
        for (let z = 0; z < size; z++) {
            for (let x = 0; x < size; x++) {
                if (_mul(x, z) !== z) continue outer
            }
            absorbers.push(z)
        }

        return absorbers
    }

    /** Find the unique both-sided absorber */
    findAbsorber(): number | null {
        const { size, _mul } = this
        let absorber: number | null = null

        findLeftAbsorber:
        for (let z = 0; z < size; z++) {
            for (let x = 0; x < size; x++) {
                if (_mul(z, x) !== z) continue findLeftAbsorber
            }
            absorber = z
            break
        }

        if (absorber === null) return null

        // verify it is also a right absorber
        for (let x = 0; x < size; x++) {
            if (_mul(x, absorber) !== absorber) return null
        }

        return absorber
    }

    /** Find x, such that xa = b */
    solveLeft(a: number, b: number): number | null {
        const { size, _mul } = this

        if (!isNonnegativeInteger(a) || !isNonnegativeInteger(b)) throw TypeError('Arguments must be nonnegative integers.')
        if (a >= size || b >= size) throw TypeError('Arguments must be smaller than the size of the table.')

        for (let x = 0; x < size; x++) {
            if (_mul(x, a) == b) return x
        }

        return null
    }

    /** Find x, such that ax = b */
    solveRight(a: number, b: number): number | null {
        const { size, _mul } = this

        if (!isNonnegativeInteger(a) || !isNonnegativeInteger(b)) throw TypeError('Arguments must be nonnegative integers.')
        if (a >= size || b >= size) throw TypeError('Arguments must be smaller than the size of the table.')

        for (let x = 0; x < size; x++) {
            if (_mul(a, x) == b) return x
        }

        return null
    }
}
