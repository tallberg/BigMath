export { factorPollardBrent as default}

/**
 * Brent's variant of Pollard's Rho factorization.
 * Returns a nontrivial factor of n.
 */
function factorPollardBrent(n) {
   
  // Basic cases
  if (n <= 1n) return n;
  if (n % 2n === 0n) return 2n;
  if (n % 3n === 0n) return 3n;  // Added check for divisibility by 3

  // GCD function
  function gcd(a, b) {
    while (b !== 0n) {
      [a, b] = [b, a % b];
    }
    return a;
  }

  // f(x) = x^2 + c (mod n)
  function f(x, c) {
    return (x * x + c) % n;
  }

  const maxIterations = 1000000n;
  let iteration = 0n;
  
  let y = 2n;
  let c = 1n;
  let m = 2n;
  let r = 1n;
  let q = 1n;
  let d = 1n;
  let ys, k, x;
  
  let progress = 0;
  let progressMod = maxIterations / 100n;
  // Try different c values if needed
  outer: while (d === 1n && iteration < maxIterations) {

    if (iteration % progressMod === 0n && iteration > 1000) {
      console.log(++progress + "%");
    }

    x = y;
    for (let i = 0n; i < r; i++) {
      y = f(y, c);
    }
    
    k = 0n;
    while (k < r && d === 1n && iteration < maxIterations) {
      ys = y;
      let limit = r - k < m ? r - k : m;
      
      for (let i = 0n; i < limit; i++) {
        y = f(y, c);
        q = (q * (x > y ? x - y : y - x)) % n;
        iteration++;
      }
      d = gcd(q, n);
      k += m;
    }
    
    if (d === n) {
      // If d = n, try with saved value and increment c
      do {
        ys = f(ys, c);
        d = gcd(x > ys ? x - ys : ys - x, n);
        iteration++;
        if (iteration >= maxIterations) break outer;
      } while (d === 1n);
      
      if (d === n) {
        c += 1n;    // Try different polynomial
        y = 2n;     // Reset y
        r = 1n;     // Reset r
        q = 1n;     // Reset q
        continue;
      }
    }
    
    r *= 2n;
  }

  // If no factor found or iteration limit reached
  if (d === 1n || d === n || iteration >= maxIterations) {
    return n;  // Return original number if no factor found
  }

  return d;
}