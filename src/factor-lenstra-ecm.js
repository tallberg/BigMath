export {lenstraECM as default}

/**
* Lenstra ECM (Elliptic Curve Method) factorization algorithm with Phase 1 and Phase 2
* This implements Lenstra's factorization method using elliptic curves to find factors of large numbers
*/

/**
* Calculate the greatest common divisor of two BigInts
* @param {BigInt} a - First number
* @param {BigInt} b - Second number
* @returns {BigInt} - Greatest common divisor
*/
const gcd = (a, b) => {
    a = a < 0n ? -a : a; // Ensure a is positive
    b = b < 0n ? -b : b; // Ensure b is positive
    
    // Euclidean algorithm
    while (b !== 0n) {
      [a, b] = [b, a % b];
    }
    return a;
   };
   
   /**
   * Calculate modular inverse (a^-1 mod m)
   * @param {BigInt} a - Number to find inverse for
   * @param {BigInt} m - Modulus
   * @returns {BigInt} - Modular inverse
   */
   const modInv = (a, m) => {
    if (m === 1n) return 0n;
    
    // Extended Euclidean Algorithm
    let [m0, x0, x1] = [m, 0n, 1n];
    
    while (a > 1n) {
      const q = a / m;
      [a, m] = [m, a % m];
      [x0, x1] = [x1 - q * x0, x0];
    }
    
    return x1 < 0n ? x1 + m0 : x1;
   };
   
   /**
   * Add two points on an elliptic curve y^2 = x^3 + ax + b (mod n)
   * @param {Array|null} p1 - First point [x, y] or null for point at infinity
   * @param {Array|null} p2 - Second point [x, y] or null for point at infinity
   * @param {BigInt} a - Coefficient a in curve equation
   * @param {BigInt} n - Modulus
   * @returns {Array|null} - Resulting point or null for point at infinity
   */
   const addPoint = (p1, p2, a, n) => {
    // Handle points at infinity
    if (p1 === null) return p2;
    if (p2 === null) return p1;
    
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    
    // Check if points are the same (point doubling) or different (point addition)
    if (x1 === x2) {
      if ((y1 + y2) % n === 0n) {
        return null; // Point at infinity (vertical line)
      }
      
      // Point doubling formula: λ = (3x₁² + a) / 2y₁
      try {
        const numerator = (3n * x1 * x1 + a) % n;
        const denominator = (2n * y1) % n;
        const lambda = (numerator * modInv(denominator, n)) % n;
        
        let x3 = (lambda * lambda - 2n * x1) % n;
        let y3 = (lambda * (x1 - x3) - y1) % n;
        
        // Ensure positive coordinates
        x3 = x3 < 0n ? x3 + n : x3;
        y3 = y3 < 0n ? y3 + n : y3;
        
        return [x3, y3];
      } catch (e) {
        // If modInv fails, we likely found a factor
        throw new Error(`Failed to calculate modular inverse: gcd = ${gcd(2n * y1, n)}`);
      }
    } else {
      // Point addition formula: λ = (y₂ - y₁) / (x₂ - x₁)
      try {
        const numerator = (y2 - y1) % n;
        const denominator = (x2 - x1) % n;
        const lambda = (numerator * modInv(denominator, n)) % n;
        
        let x3 = (lambda * lambda - x1 - x2) % n;
        let y3 = (lambda * (x1 - x3) - y1) % n;
        
        // Ensure positive coordinates
        x3 = x3 < 0n ? x3 + n : x3;
        y3 = y3 < 0n ? y3 + n : y3;
        
        return [x3, y3];
      } catch (e) {
        // If modInv fails, we likely found a factor
        throw new Error(`Failed to calculate modular inverse: gcd = ${gcd(x2 - x1, n)}`);
      }
    }
   };
   
   /**
   * Scalar multiplication: k·P on elliptic curve
   * @param {BigInt} k - Scalar multiplier
   * @param {Array} point - Point [x, y] to multiply
   * @param {BigInt} a - Coefficient a in curve equation
   * @param {BigInt} n - Modulus
   * @returns {Array|null} - Resulting point or null if calculation failed
   */
   const scalarMult = (k, point, a, n) => {
    let result = null; // Start with point at infinity
    let addend = point;
    
    // Double-and-add algorithm
    while (k > 0n) {
      if (k & 1n) { // If least significant bit is 1
        try {
          result = addPoint(result, addend, a, n);
        } catch (e) {
          // If addPoint fails, we might have found a factor
          return null;
        }
      }
      
      try {
        addend = addPoint(addend, addend, a, n); // Double the point
      } catch (e) {
        return null;
      }
      
      k >>= 1n; // Bit shift right (divide by 2)
    }
    
    return result;
   };
   
   /**
   * Generate a random BigInt up to but not including max
   * @param {BigInt} max - Upper bound (exclusive)
   * @returns {BigInt} - Random BigInt
   */
   const randomBigInt = (max) => {
    const bytes = Math.ceil(max.toString(2).length / 8);
    const randomBytes = new Uint8Array(bytes);
    crypto.getRandomValues(randomBytes);
    const randomNum = BigInt('0x' + Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''));
    return randomNum % max;
   };
   
   /**
   * ECM Phase 1: Finds a factor using scalar multiplication with prime powers
   * @param {BigInt} n - Number to factorize
   * @param {BigInt} B1 - Phase 1 bound
   * @param {BigInt} attempts - Number of curves to try
   * @returns {BigInt|null} - Found factor or null
   */
   const ecmPhase1 = (n, B1, attempts = 1n) => {
    // Try multiple curves to increase success probability
    for (let attempt = 0n; attempt < attempts; attempt++) {
      // Generate random curve and point
      const x = randomBigInt(n);
      const y = randomBigInt(n);
      const a = randomBigInt(n);
      
      // Calculate b = y^2 - x^3 - a*x (mod n) to ensure point lies on curve
      let b = (y * y - x * x * x - a * x) % n;
      if (b < 0n) b += n;
      
      let point = [x, y];
      
      // Generate small primes up to B1 using Sieve of Eratosthenes
      const smallPrimes = [];
      let isPrime = Array(Number(B1) + 1).fill(true);
      isPrime[0] = isPrime[1] = false;
      
      for (let i = 2; i <= Number(B1); i++) {
        if (isPrime[i]) {
          smallPrimes.push(BigInt(i));
          for (let j = i * i; j <= Number(B1); j += i) {
            isPrime[j] = false;
          }
        }
      }
      
      // Multiply point by prime powers <= B1
      for (const p of smallPrimes) {
        // Calculate largest power of p <= B1
        let power = p;
        while (power * p <= B1) {
          power *= p;
        }
        
        try {
          // [power]P computation
          point = scalarMult(power, point, a, n);
          if (point === null) {
            break; // Point went to infinity, try another curve
          }
        } catch (e) {
          // Extract potential factor from error message
          const errorMessage = e.message;
          const match = errorMessage.match(/gcd = (\d+)/);
          if (match) {
            const possibleFactor = BigInt(match[1]);
            if (possibleFactor !== 1n && possibleFactor !== n) {
              return possibleFactor;
            }
          }
          break;
        }
      }
      
      // Check if we found a factor from the final point
      if (point !== null) {
        try {
          const factor = gcd(point[1], n);
          if (factor !== 1n && factor !== n) {
            return factor;
          }
        } catch (e) {
          // Handle potential errors
        }
      }
    }
    
    return null; // No factor found
   };
   
   /**
   * ECM Phase 2: Improves success rate by checking for prime factors between B1 and B2
   * @param {BigInt} n - Number to factorize
   * @param {BigInt} B1 - Phase 1 bound
   * @param {BigInt} B2 - Phase 2 bound
   * @param {Array|null} initialPoint - Starting point or null to generate random
   * @param {BigInt|null} a - Curve parameter or null to generate random
   * @param {BigInt} attempts - Number of curves to try
   * @returns {BigInt|null} - Found factor or null
   */
   const ecmPhase2 = (n, B1, B2, initialPoint = null, initialA = null, attempts = 1n) => {
    let point, a;
    
    if (!initialPoint) {
      // No starting point provided, generate random point and curve
      const x = randomBigInt(n);
      const y = randomBigInt(n);
      a = initialA !== null ? initialA : randomBigInt(n);
      
      // Calculate b to ensure point is on curve
      let b = (y * y - x * x * x - a * x) % n;
      if (b < 0n) b += n;
      
      point = [x, y];
      
      // Run Phase 1 first
      const phase1Factor = ecmPhase1(n, B1, 1n);
      if (phase1Factor) return phase1Factor;
    } else {
      point = initialPoint;
      a = initialA;
    }
    
    // Set up for "standard continuation" approach
    const D = 210n; // Product of small primes (2*3*5*7) for efficiency
    const lookup = new Map();
    
    // Compute [B1]P to start Phase 2
    let Q;
    try {
      Q = scalarMult(B1, point, a, n);
      if (!Q) return null;
    } catch (e) {
      // Check if we found a factor during initial computation
      const match = e.message.match(/gcd = (\d+)/);
      if (match) {
        const possibleFactor = BigInt(match[1]);
        if (possibleFactor !== 1n && possibleFactor !== n) {
          return possibleFactor;
        }
      }
      return null;
    }
    
    // Precompute [j]Q for gcd(j,D)=1
    for (let j = 1n; j < D; j++) {
      if (gcd(j, D) === 1n) {
        try {
          lookup.set(j.toString(), Q);
          Q = addPoint(Q, point, a, n);
          if (!Q) {
            const factor = gcd(point[1], n);
            if (factor !== 1n && factor !== n) return factor;
            return null;
          }
        } catch (e) {
          // Check for potential factor
          const match = e.message.match(/gcd = (\d+)/);
          if (match) {
            const possibleFactor = BigInt(match[1]);
            if (possibleFactor !== 1n && possibleFactor !== n) {
              return possibleFactor;
            }
          }
          return null;
        }
      }
    }
    
    // Main Phase 2 sieve
    let kD = B1 - (B1 % D);
    let R;
    
    try {
      R = scalarMult(kD, point, a, n);
      if (!R) return null;
    } catch (e) {
      // Check for potential factor
      const match = e.message.match(/gcd = (\d+)/);
      if (match) {
        const possibleFactor = BigInt(match[1]);
        if (possibleFactor !== 1n && possibleFactor !== n) {
          return possibleFactor;
        }
      }
      return null;
    }
    
    // Process each block of D consecutive integers
    for (let k = kD; k <= B2; k += D) {
      for (let j = 1n; j < D; j++) {
        if (gcd(j, D) === 1n) {
          try {
            const S = addPoint(R, lookup.get(j.toString()), a, n);
            if (!S) {
              // Potential factor found
              const factor = gcd(R[0] - lookup.get(j.toString())[0], n);
              if (factor !== 1n && factor !== n) return factor;
              break;
            }
          } catch (e) {
            // Check for potential factor in error
            const match = e.message.match(/gcd = (\d+)/);
            if (match) {
              const possibleFactor = BigInt(match[1]);
              if (possibleFactor !== 1n && possibleFactor !== n) {
                return possibleFactor;
              }
            }
            break;
          }
        }
      }
      
      // Move to next block
      try {
        const nextBlock = scalarMult(D, point, a, n);
        if (!nextBlock) return null;
        R = addPoint(R, nextBlock, a, n);
        if (!R) return null;
      } catch (e) {
        // Check for potential factor
        const match = e.message.match(/gcd = (\d+)/);
        if (match) {
          const possibleFactor = BigInt(match[1]);
          if (possibleFactor !== 1n && possibleFactor !== n) {
            return possibleFactor;
          }
        }
        return null;
      }
    }
    
    return null; // No factor found
   };
   
   /**
   * Main Lenstra ECM implementation combining Phase 1 and Phase 2
   * @param {BigInt} n - Number to factorize
   * @param {BigInt} B1 - Phase 1 bound
   * @param {BigInt} B2 - Phase 2 bound
   * @param {BigInt} attempts - Number of curves to try
   * @returns {BigInt|null} - Found factor or null
   */
   const lenstraECM = (n, B1 = 100000n, B2 = 1000000n, attempts = 10n) => {
    // Handle trivial cases
    if (n <= 1n) return null;
    if (n % 2n === 0n) return 2n;
    
    // Try multiple curves to increase success probability
    for (let attempt = 0n; attempt < attempts; attempt++) {
      console.log(`Attempt ${attempt + 1n}/${attempts}`);
      
      // Try Phase 1
      const factor = ecmPhase1(n, B1, 1n);
      if (factor) return factor;
      
      // If Phase 1 fails, try Phase 2 with a new curve
      const x = randomBigInt(n);
      const y = randomBigInt(n);
      const a = randomBigInt(n);
      let b = (y * y - x * x * x - a * x) % n; // Fixed: let instead of const
      if (b < 0n) b += n;
      const point = [x, y];
      
      const phase2Factor = ecmPhase2(n, B1, B2, point, a, 1n);
      if (phase2Factor) return phase2Factor;
    }
    
    return null; // No factor found after all attempts
   };
   
   /**
   * Helper function to factorize a number and display results
   * @param {BigInt} n - Number to factorize
   * @returns {BigInt|null} - Found factor or null
   */
   const factorizeWithECM = (n) => {
    console.log(`Factorizing ${n}...`);
    const factor = lenstraECM(n);
    
    if (factor) {
      console.log(`Found factor: ${factor}`);
      console.log(`Complementary factor: ${n / factor}`);
      return factor;
    } else {
      console.log("No factor found. Try increasing bounds or attempts.");
      return null;
    }
   };
   
   // Example usage:
   // factorizeWithECM(1000003n * 1000033n);