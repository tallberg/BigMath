import sqrt from "./sqrt.js"
export { factorTrial as default, factorTrial30, factorTrial30R }

/**
 * Performs trial division to factorize a number.
 * Efficiently skips numbers coprime to 2, 3, and 5.
 * 
 * @param {bigint} n - The number to factorize.
 * @returns {bigint[]} An array of prime factors of n.
 */
function factorTrial(n) {
    if (n < 2n) return [];
    if (n === 2n || n === 3n || n === 5n) return [n];
    
    const factors = [];
    while (n % 2n === 0n) { factors.push(2n); n /= 2n; }
    while (n % 3n === 0n) { factors.push(3n); n /= 3n; }
    while (n % 5n === 0n) { factors.push(5n); n /= 5n; }
    
    if (n === 1n) return factors;
    
    const increments = [4n, 2n, 4n, 2n, 4n, 6n, 2n, 6n]; // Pattern for 30k +/- {1,7,11,13,17,19,23,29}
    let divisor = 7n, index = 0;
    
    while (divisor * divisor <= n) {
        while (n % divisor === 0n) {
            factors.push(divisor);
            n /= divisor;
        }
        divisor += increments[index];
        index = (index + 1) % increments.length;
    }
    
    if (n > 1n) factors.push(n);
    return factors;
}

function factorTrial30(n) {
    if (n < 2n) throw new error("n must be greater than 1");
    if (n < 4n) return n;
  
    if (n % 2n === 0n) return 2;
    if (n % 3n === 0n) return 3;
    if (n % 5n === 0n) return 5;
  
    let i = 7n;
    while (i * i <= n) {
        if (n % i === 0n) return i;
        if (n % (i + 4n) === 0n) return i + 4n;
        if (n % (i + 6n) === 0n) return i + 6n;
        if (n % (i + 10n) === 0n) return i + 10n;
        if (n % (i + 12n) === 0n) return i + 12n;
        if (n % (i + 16n) === 0n) return i + 16n;
        if (n % (i + 22n) === 0n) return i + 22n;
        if (n % (i + 24n) === 0n) return i + 24n;
        i += 30n;
    }
  
    return n;
  }

  function factorTrial30R(n) {
    if (n < 2n) throw new error("n must be greater than 1");
    if (n < 4n) return n;
  
    if (n % 2n === 0n) return 2;
    if (n % 3n === 0n) return 3;
    if (n % 5n === 0n) return 5;
  
    // Find starting value 7+30k closest to sqrt(n) 
    const max = sqrt(n);
    const r = 7n - max % 30n;
    let i = max + r; 
  
    while (i > 6n) {
        if (n % i === 0n) return i;
        if (n % (i + 4n) === 0n) return i + 4n;
        if (n % (i + 6n) === 0n) return i + 6n;
        if (n % (i + 10n) === 0n) return i + 10n;
        if (n % (i + 12n) === 0n) return i + 12n;
        if (n % (i + 16n) === 0n) return i + 16n;
        if (n % (i + 22n) === 0n) return i + 22n;
        if (n % (i + 24n) === 0n) return i + 24n;
      i -= 30n;
    }
  
    return n;
  }