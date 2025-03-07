import modExp from "./mod-exp.js";
export {isPrimeMillerRabin as default, isPrimeMillerRabinDeterministic}

/**
 * Miller-Rabin Primality Test
 *
 * This function performs the Miller-Rabin primality test, a probabilistic algorithm
 * for determining whether a given number is prime or composite. The test is based on
 * the Fermat's Little Theorem and the concept of witness numbers.
 *
 * @param {number} n - The number to test for primality
 * @param {number} [k=5] - The number of times to perform the test (default: 5)
 * @returns {boolean} Whether the number is prime or not
 *
 * @note
 * The Miller-Rabin test is a probabilistic algorithm, which means that there is a small
 * chance of returning a false positive (i.e., a composite number that is reported as
 * prime). The probability of this occurring decreases as the value of `k` increases.
 */
const isPrimeMillerRabin = (n, k = 5) => {
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n) return false;
  
    // Write n-1 as d * 2^r
    let d = n - 1n;
    let r = 0n;
    while (d % 2n === 0n) {
      d /= 2n;
      r += 1n;
    }
  
    // Perform k iterations of the test
    for (let i = 0; i < k; i++) {
      let a = 2n + BigInt(Math.floor(Math.random() * Number(n - 3n)));
      let x = modExp(a, d, n);
      
      if (x === 1n || x === n - 1n) continue; // Passes this round
  
      let isComposite = true;
      for (let j = 0n; j < r - 1n; j++) {
        x = modExp(x, 2n, n);
        if (x === n - 1n) {
          isComposite = false;
          break;
        }
      }
  
      if (isComposite) return false;
    }
  
    return true; // Probably prime
  };

/**
 * Miller-Rabin Primality Test for small numbers with deterministic bases
 *
 * This function performs the Miller-Rabin primality test for small numbers (n ≤ 2^64)
 * using deterministic bases. This is a deterministic algorithm, meaning it will always
 * return the correct result (i.e., no false positives or false negatives).
 *
 * @param {number} n - The number to test for primality
 * @returns {boolean} Whether the number is prime or not
 *
 * @note
 * This function is only suitable for small numbers (n ≤ 2^64) and is not intended for
 * use with larger numbers. For larger numbers, use the `isPrimeMillerRabin` function.
 */
const isPrimeMillerRabinDeterministic = (n) => {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n) return false;

  // Write n-1 as d * 2^r
  let d = n - 1n;
  let r = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    r += 1n;
  }

  // Deterministic bases for n ≤ 2^64 (from known research)
  const bases = n < 1373653n ? [2n, 3n] :
                n < 25326001n ? [2n, 3n, 5n] :
                n < 118670087467n ? [2n, 3n, 5n, 7n, 11n] :
                [2n, 3n, 5n, 7n, 11n, 13n, 17n];

  for (let a of bases) {
    if (a >= n) break;

    let x = modExp(a, d, n);
    if (x === 1n || x === n - 1n) continue;

    let isComposite = true;
    for (let j = 0n; j < r - 1n; j++) {
      x = modExp(x, 2n, n);
      if (x === n - 1n) {
        isComposite = false;
        break;
      }
    }

    if (isComposite) return false;
  }

  return true; // Definitely prime
};