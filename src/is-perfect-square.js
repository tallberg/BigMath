export {isPerfectSquare as default}

/**
 * Checks if a given BigInt is a perfect square.
 * Uses the Newton-Raphson method for integer square root approximation.
 * 
 * @param {bigint} n - The number to check.
 * @returns {boolean} - Returns true if n is a perfect square, otherwise false.
 */
const isPerfectSquare = (n) => {
    let x = n;
    let y = (x + 1n) >> 1n;
    while (y < x) {
        x = y;
        y = (x + n / x) >> 1n;
    }
    return x * x === n;
}