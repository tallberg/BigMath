export {ecm as default}

/**
 * Implementation of the Elliptic Curve Method (ECM) for integer factorization
 * Based on Lenstra's algorithm using elliptic curves
 */

// GCD function using the Euclidean algorithm
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }
  
  // Modular inverse using extended Euclidean algorithm
  function modInverse(a, m) {
    // Ensure a is positive
    a = ((a % m) + m) % m;
    
    let [old_r, r] = [a, m];
    let [old_s, s] = [1, 0];
    let [old_t, t] = [0, 1];
    
    while (r !== 0) {
      const quotient = Math.floor(old_r / r);
      [old_r, r] = [r, old_r - quotient * r];
      [old_s, s] = [s, old_s - quotient * s];
      [old_t, t] = [t, old_t - quotient * t];
    }
    
    return (old_s + m) % m;
  }
  
  // Point addition on elliptic curve y^2 = x^3 + ax + b (mod n)
  function pointAddition(P1, P2, a, n) {
    if (P1 === null) return P2;
    if (P2 === null) return P1;
    
    const [x1, y1] = P1;
    const [x2, y2] = P2;
    
    // Check if points are the same
    if (x1 === x2 && y1 !== y2) {
      return null; // Points are inverses of each other
    }
    
    let slope;
    try {
      if (x1 === x2 && y1 === y2) {
        // Point doubling: λ = (3x^2 + a) / (2y)
        const numerator = (3 * x1 * x1 + a) % n;
        const denominator = (2 * y1) % n;
        slope = (numerator * modInverse(denominator, n)) % n;
      } else {
        // Point addition: λ = (y2 - y1) / (x2 - x1)
        const numerator = ((y2 - y1) % n + n) % n;
        const denominator = ((x2 - x1) % n + n) % n;
        slope = (numerator * modInverse(denominator, n)) % n;
      }
    } catch (e) {
      // If modInverse fails, we found a factor
      return "FACTOR_FOUND";
    }
    
    // x3 = λ^2 - x1 - x2
    const x3 = ((slope * slope - x1 - x2) % n + n) % n;
    // y3 = λ(x1 - x3) - y1
    const y3 = ((slope * (x1 - x3) - y1) % n + n) % n;
    
    return [x3, y3];
  }
  
  // Scalar multiplication: computes k * P on the curve
  function scalarMultiply(P, k, a, n) {
    if (k === 0) return null;
    if (k === 1) return P;
    
    let result = null;
    let addend = P;
    
    while (k > 0) {
      if (k & 1) { // If the bit is set
        const temp = pointAddition(result, addend, a, n);
        if (temp === "FACTOR_FOUND") return "FACTOR_FOUND";
        result = temp;
      }
      
      const temp = pointAddition(addend, addend, a, n);
      if (temp === "FACTOR_FOUND") return "FACTOR_FOUND";
      addend = temp;
      
      k >>= 1; // Divide k by 2
    }
    
    return result;
  }
  
  /**
   * ECM Stage 1: Try to find a factor using one elliptic curve
   * @param {number} n - The number to factorize
   * @param {number} B1 - Stage 1 bound
   * @param {number} [seed] - Random seed for the curve
   * @returns {number|null} A factor if found, null otherwise
   */
  function ecmStage1(n, B1, seed = Date.now()) {
    // Generate a pseudorandom number based on the seed
    const rng = (s) => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
    
    // Generate random parameters for the elliptic curve y^2 = x^3 + ax + b
    const x = Math.floor(rng(seed) * n);
    const y = Math.floor(rng(seed + 1) * n);
    const a = Math.floor(rng(seed + 2) * n);
    
    // Calculate b = y^2 - x^3 - a*x (mod n)
    const y2 = (y * y) % n;
    const x3 = (x * x * x) % n;
    const ax = (a * x) % n;
    const b = ((y2 - x3 - ax) % n + n) % n;
    
    // Starting point
    const P = [x, y];
    
    // Precompute small primes up to B1
    const smallPrimes = [];
    const isPrime = new Array(B1 + 1).fill(true);
    isPrime[0] = isPrime[1] = false;
    
    for (let i = 2; i <= B1; i++) {
      if (isPrime[i]) {
        smallPrimes.push(i);
        for (let j = i * i; j <= B1; j += i) {
          isPrime[j] = false;
        }
      }
    }
    
    // Compute k = product of prime powers <= B1
    let k = 1n;
    for (const p of smallPrimes) {
      let power = p;
      while (power <= B1) {
        k *= BigInt(p);
        power *= p;
      }
    }
    
    // Compute Q = k * P
    const Q = scalarMultiply(P, Number(k), a, n);
    
    if (Q === "FACTOR_FOUND") {
      try {
        // Try to find the actual factor by computing GCD
        const diff = (y * y) % n - ((x * x * x + a * x + b) % n);
        return gcd(diff, n);
      } catch (e) {
        return null;
      }
    }
    
    return null;
  }
  
  /**
   * Full ECM implementation to find all factors
   * @param {number} n - The number to factorize
   * @param {number} curves - Number of curves to try
   * @param {number} B1 - Stage 1 bound
   * @returns {number[]} - Array of all factors found
   */
  function ecm(n, curves = 100, B1 = 1000) {
    // Handle small numbers and basic cases
    if (n <= 1) return [];
    if (n === 2) return [2];
    
    const factors = [];
    
    // Check divisibility by 2 and 3 first (optimization)
    while (n % 2 === 0) {
      factors.push(2);
      n /= 2;
    }
    
    while (n % 3 === 0) {
      factors.push(3);
      n /= 3;
    }
    
    if (n === 1) return factors;
    
    // Prime test function (simple Miller-Rabin)
    function isProbablePrime(num) {
      if (num <= 1) return false;
      if (num <= 3) return true;
      if (num % 2 === 0 || num % 3 === 0) return false;
      
      for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
      }
      return true;
    }
    
    // Use ECM to find factors
    const toFactor = [n];
    const foundFactors = new Set();
    
    while (toFactor.length > 0) {
      const current = toFactor.pop();
      
      // If it's small enough or prime, add to the factors
      if (current <= 1000000 && isProbablePrime(current)) {
        foundFactors.add(current);
        continue;
      }
      
      let factorFound = false;
      
      // Try multiple curves
      for (let curve = 0; curve < curves; curve++) {
        const factor = ecmStage1(current, B1, curve);
        
        if (factor && factor > 1 && factor < current) {
          factorFound = true;
          toFactor.push(factor);
          toFactor.push(current / factor);
          break;
        }
      }
      
      // If no factor found after trying all curves, treat as prime
      if (!factorFound) {
        foundFactors.add(current);
      }
    }
    
    // Convert found factors to array and sort
    return [...foundFactors].sort((a, b) => a - b);
  }
  
  /**
   * Find all factors (not just prime factors) using ECM
   * @param {number} n - The number to find factors for
   * @returns {number[]} - Array of all factors in ascending order
   */
  function findAllFactorsUsingECM(n) {
    if (n <= 0) return [];
    if (n === 1) return [1];
    
    // Get prime factors using ECM
    const primeFactors = ecm(n);
    
    // Generate all factors from prime factorization
    const factorSet = new Set([1]);
    
    // Count occurrences of each prime factor
    const primeFactorCounts = {};
    for (const factor of primeFactors) {
      primeFactorCounts[factor] = (primeFactorCounts[factor] || 0) + 1;
    }
    
    // Generate all factors using prime factorization
    for (const prime in primeFactorCounts) {
      const p = parseInt(prime);
      const count = primeFactorCounts[p];
      const currentFactors = [...factorSet];
      
      // For each existing factor, multiply by prime^i for i=1 to count
      for (let i = 1; i <= count; i++) {
        const multiplier = Math.pow(p, i);
        for (const factor of currentFactors) {
          factorSet.add(factor * multiplier);
        }
      }
    }
    
    return [...factorSet].sort((a, b) => a - b);
  }