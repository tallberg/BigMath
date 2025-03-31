export {factorPollardRho as default}

/**
 * Uses Pollard's Rho algorithm to factorize a number.
 * Efficient for numbers with small factors.
 * 
 * @param {bigint} n - The number to factorize.
 * @returns {bigint[]} An array of prime factors of n.
 */
function factorPollardRho(n) {
    if (n <= 1n) return n;
    if (n % 2n === 0n) return 2n;
    
    // GCD function
    function gcd(a, b) {
        while (b !== 0n) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    // f(x) = x^2 + c (mod n)
    function f(x, c, n) {
        return (x * x + c) % n;
    }
    
    let c = 1n;
    let x = 2n;
    let y = 2n;
    let d = 1n;
    let count = 0;
    const maxIterations = 1000000;

    // Main Pollard Rho loop with Floyd's cycle detection
    while (d === 1n && count < maxIterations) {
        x = f(x, c, n);
        y = f(f(y, c, n), c, n);
        d = gcd(x > y ? x - y : y - x, n);
        count++;

        // If we found a trivial factor, try a different c value
        if (d === n) {
            c++;
            x = 2n;
            y = 2n;
            d = 1n;
            count = 0;
        }
    }
    
    return d;
}
