import modExp from "./mod-exp.js";
export {isPrimeMillerRabin as default, isPrimeMillerRabinDeterministic}

// Miller-Rabin Primality Test
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

  // Miller-Rabin for small numbers with deterministic bases for n ≤ 2^64
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