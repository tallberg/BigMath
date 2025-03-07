import jacobiSymbol from "./jacobi-symbol.js";
import modExp from "./mod-exp.js";
export {isPrimeSolovayStrassen as default}

/**
 * Solovay-Strassen Primality Test
 *
 * This function performs the Solovay-Strassen primality test, a probabilistic algorithm
 * for determining whether a given number is prime or composite. The test is based on
 * the Fermat's Little Theorem and the Miller-Rabin primality test.
 *
 * @param {number} n - The number to test for primality
 * @param {number} [k=5] - The number of times to perform the test (default: 5)
 * @returns {boolean} Whether the number is prime or not
 */
const isPrimeSolovayStrassen = (n, k = 5) => {
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n) return false;
  
    for (let i = 0; i < k; i++) {
      let a = 2n + BigInt(Math.floor(Math.random() * Number(n - 3n)));
      let jacobi = jacobiSymbol(a, n);
      if (jacobi === 0n) return false; // Composite case
  
      let modExpResult = modExp(a, (n - 1n) / 2n, n);
      if (modExpResult !== (jacobi % n + n) % n) return false;
    }
  
    return true; // Probably prime
  };