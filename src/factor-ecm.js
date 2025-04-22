import isPrime from "./is-prime-trial.js"
export { factorECM as default }

function factorECM(n) {
    n = BigInt(n);
    
    // Basic cases
    if (n <= 1n) return n;
    if (n % 2n === 0n) return 2n;
    if (n % 3n === 0n) return 3n;
  
    // GCD function
    function gcd(a, b) {
      while (b !== 0n) {
        [a, b] = [b, a % b];
      }
      return a;
    }
  
    // Modular addition
    function modAdd(a, b, n) {
      return (a + b) % n;
    }
  
    // Modular subtraction
    function modSub(a, b, n) {
      return (a - b + n) % n;
    }
  
    // Modular multiplication
    function modMul(a, b, n) {
      return (a * b) % n;
    }
  
    // Modular inverse using extended Euclidean algorithm
    function modInverse(a, m) {
      let [old_r, r] = [a, m];
      let [old_s, s] = [1n, 0n];
      
      while (r !== 0n) {
        let quotient = old_r / r;
        [old_r, r] = [r, old_r - quotient * r];
        [old_s, s] = [s, old_s - quotient * s];
      }
      
      if (old_r > 1n) return null; // No inverse exists
      if (old_s < 0n) old_s += m;
      return old_s;
    }
  
    // Point addition on elliptic curve y^2 = x^3 + ax + b (mod n)
    function pointAdd(P, Q, n, a) {
      if (P === null) return Q;
      if (Q === null) return P;
      
      const [x1, y1] = P;
      const [x2, y2] = Q;
      
      if (x1 === x2 && y1 === -y2) return null;
      
      let m;
      if (x1 === x2 && y1 === y2) {
        // Point doubling
        const num = modMul(3n, modMul(x1, x1, n), n) + a;
        const den = modMul(2n, y1, n);
        const inv = modInverse(den, n);
        if (inv === null) {
          return gcd(den, n); // Factor found
        }
        m = modMul(num, inv, n);
      } else {
        // Point addition
        const num = modSub(y2, y1, n);
        const den = modSub(x2, x1, n);
        const inv = modInverse(den, n);
        if (inv === null) {
          return gcd(den, n); // Factor found
        }
        m = modMul(num, inv, n);
      }
      
      const x3 = modSub(modSub(modMul(m, m, n), x1, n), x2, n);
      const y3 = modSub(modMul(m, modSub(x1, x3, n), n), y1, n);
      return [x3, y3];
    }
  
    // Scalar multiplication k*P
    function scalarMultiply(k, P, n, a) {
      let R = null;
      let Q = P;
      
      while (k > 0n) {
        if (k & 1n) {
          R = pointAdd(R, Q, n, a);
          if (typeof R === 'bigint') return R; // Factor found
        }
        Q = pointAdd(Q, Q, n, a);
        if (typeof Q === 'bigint') return Q; // Factor found
        k >>= 1n;
      }
      return R;
    }
  
    // Main ECM algorithm
    const maxAttempts = 100;  // Number of curves to try
    const B1 = 10000n;        // Stage 1 bound
    
    for (let i = 0; i < maxAttempts; i++) {
      // Random curve parameters
      const a = BigInt(Math.floor(Math.random() * 1000));
      const x0 = BigInt(Math.floor(Math.random() * 1000));
      const y0 = BigInt(Math.floor(Math.random() * 1000));
      const b = modSub(modMul(y0, y0, n), modMul(x0, x0 * x0, n) + modMul(a, x0, n), n);
      
      let P = [x0, y0];
      
      // Stage 1: multiply by small primes
      for (let p = 2n; p <= B1; p++) {
        if (isPrime(p)) {  // Simple primality check
          let e = 1n;
          while (e * p <= B1) e *= p;
          const result = scalarMultiply(e, P, n, a);
          if (typeof result === 'bigint') {
            if (result > 1n && result < n) return result;
            break; // Try new curve if factor is n or 1
          }
          P = result;
        }
      }
    }
    
    return n; // No factor found
  }
  