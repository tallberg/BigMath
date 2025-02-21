import modExp from "./mod-exp.js";
export {isPrimeFermat as default}
/**
 * Checks if a number is prime using Fermat's primality test.
 * 
 * Fermat's Little Theorem states that if n is prime and 1 < a < n, then:
 *    a^(n-1) ≡ 1 (mod n)
 * If this fails for any a, n is composite. 
 * This test is probabilistic and may falsely classify Carmichael numbers as prime.
 * 
 * @param {bigint} n - The number to test.
 * @param {number} [k=5] - The number of random bases to check.
 * @returns {boolean} - True if n is likely prime, false if definitely composite.
 */
const isPrimeFermat = (n, k = 5) => {
    for (let i = 0; i < k; i++) {
      let a = 2n + BigInt(Math.floor(Math.random() * Number(n - 3n))); // Ensures 2 ≤ a ≤ n-2
      if (modExp(a, n - 1n, n) !== 1n) return false;
    }
    return true;
  };