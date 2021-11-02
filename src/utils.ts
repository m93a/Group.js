
export function isInteger(n: number) {
    return typeof n === 'number' && n === (n|0)
}

export function isNonnegativeInteger(n: number): boolean {
    return isInteger(n) && n >= 0
}

export function* range(start: number, end: number = Infinity, step: number = 1) {
    let sign: number

    if (start === end) return
    else if (step === 0) throw new TypeError('Step cannot be zero.')

    else if (start < end && step < 0) throw new TypeError('Distance to cover is positive, yet step is negative.')
    else if (start > end && step > 0) throw new TypeError('Distance to cover is negative, yet step is positive.')
    else if (start < end && step > 0) sign = 1
    else if (start > end && step < 0) sign = -1

    else throw new TypeError('Some of the arguments were NaN.')

    let i = 0
    let val = start
    while (sign * (val - end) < 0) {
        yield val
        val = start + step * ++i
    }
}
