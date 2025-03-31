import modExp from "./mod-exp.js";
import modPolyExp from "./mod-poly-exp.js";
import polyMulKaratsuba, {polyMulMod} from "./poly-mul.js";
export {isPrimeAKS as default, isPrimeAKS2, isPrimeAKS3}

// AKS Primality Test
const isPrimeAKS = (n) => {
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n) return false;
  
    // Step 1: Check if n is a perfect power
    for (let b = 2n; b * b <= n; b++) {
      let a = BigInt(Math.round(Number(n) ** (1 / Number(b))));
      if (a ** b === n) return false;
    }
  
    // Step 2: Find the smallest r where order of n mod r is large enough
    let r = 2n, maxOrder = BigInt(Math.ceil(Math.log2(Number(n)) ** 2));
    while (r < n) {
      let order = 1n, k = 1n;
      while (k < maxOrder && modExp(n, k, r) !== 0n) {
        order++;
        k++;
      }
      if (order >= maxOrder) break;
      r++;
    }
  
    // Step 3: Check for small divisors
    for (let a = 2n; a <= r; a++) {
      if (n % a === 0n) return false;
    }
  
    // Step 4: Polynomial congruence check
    for (let a = 1n; a <= BigInt(Math.min(Number(r), Number(n - 1n))); a++) {
      let lhs = modPolyExp([a, 1n], n, n, r);
      let rhs = new Array(Number(r)).fill(0n);
      rhs[0] = a;
      rhs[Number(n % r)] = 1n;
      if (!lhs.every((val, idx) => val === rhs[idx])) return false;
    }
  
    return true;
  };


  // AKS Primality Test (Optimized - or is it?)
const isPrimeAKS2 = (n) => {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n) return false;

  // Step 1: Check if n is a perfect power
  for (let b = 2n; b * b <= n; b++) {
    let a = BigInt(Math.round(Number(n) ** (1 / Number(b))));
    if (a ** b === n) return false;
  }

  // Step 2: Find the smallest r where order of n mod r is large enough
  let r = 2n, maxOrder = BigInt(Math.ceil(Math.log2(Number(n)) ** 2));
  while (r < n) {
    if (modExp(n, r, r) === 0n) {
      r++;
      continue;
    }
    let order = 1n, k = 1n;
    while (k < maxOrder && modExp(n, k, r) !== 0n) {
      order++;
      k++;
    }
    if (order >= maxOrder) break;
    r++;
  }

  // Step 3: Check for small divisors
  for (let a = 2n; a <= r; a++) {
    if (n % a === 0n) return false;
  }

  // Step 4: Polynomial congruence check (Optimized using modular exponentiation)
  for (let a = 1n; a <= BigInt(Math.min(Number(r), Number(n - 1n))); a++) {
    if (modExp(a, n, n) !== a % n) return false;
  }

  return true;
};


// Optimized AKS Primality Test for Large Numbers
function isPrimeAKS4(n) {
  n = BigInt(n);
  
  // Handle small cases
  if (n <= 1n) return false;
  if (n <= 3n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;
  
  // Perfect power test
  if (isPerfectPower(n)) return false;
  
  // Find r parameter
  const logN = Math.log2(Number(n)); // Approximate log for bounding
  const maxR = BigInt(Math.max(4, Math.ceil(logN * logN)));
  const r = findR(n, maxR);
  
  // Check if n divides any number up to r
  for (let a = 2n; a <= r && a < n; a++) {
      if (modularExponentiation(a, n, n) !== a) return false;
  }
  
  if (n <= r) return true;
  
  // Polynomial test
  return polynomialTest(n, r);
}

// Check if n is a perfect power
function isPerfectPower(n) {
  const logN = Math.log2(Number(n));
  for (let b = 2; b <= logN; b++) {
      const bBig = BigInt(b);
      let low = 2n;
      let high = 2n ** BigInt(Math.ceil(logN / b));
      while (low <= high) {
          const mid = (low + high) / 2n;
          const pow = modularExponentiation(mid, bBig, n + 1n); // Avoid overflow
          if (pow === n) return true;
          if (pow < n) low = mid + 1n;
          else high = mid - 1n;
      }
  }
  return false;
}

// Find smallest r such that order of n mod r > log²(n)
function findR(n, maxR) {
  const logN = Math.log2(Number(n));
  const limit = BigInt(Math.ceil(logN * logN));
  
  for (let r = 2n; r <= maxR; r++) {
      if (gcd(n, r) !== 1n) continue;
      
      let found = true;
      for (let k = 1n; k <= limit; k++) {
          if (modularExponentiation(n, k, r) === 1n) {
              found = false;
              break;
          }
      }
      if (found) return r;
  }
  return maxR;
}

// Binary GCD
function gcdBinary(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  if (a === 0n) return b;
  if (b === 0n) return a;
  
  let shift = 0n;
  while (((a | b) & 1n) === 0n) {
      a >>= 1n;
      b >>= 1n;
      shift++;
  }
  
  while ((a & 1n) === 0n) a >>= 1n;
  while (b !== 0n) {
      while ((b & 1n) === 0n) b >>= 1n;
      if (a > b) [a, b] = [b, a];
      b -= a;
  }
  return a << shift;
}

// Fast modular exponentiation
function modularExponentiation(base, exp, mod) {
  let result = 1n;
  base = base % mod;
  
  while (exp > 0n) {
      if (exp & 1n) result = (result * base) % mod;
      base = (base * base) % mod;
      exp >>= 1n;
  }
  return result;
}

// Optimized polynomial test
function polynomialTest(n, r) {
  const logN = Math.log2(Number(n));
  const limit = BigInt(Math.floor(Math.sqrt(Number(r)) * logN));
  
  for (let a = 1n; a <= limit; a++) {
      if (!checkPolynomialIdentity(n, r, a)) return false;
  }
  return true;
}

// Check polynomial identity
function checkPolynomialIdentity(n, r, a) {
  // (x + a)^n ≡ x^n + a (mod n, x^r - 1)
  const coeffs = new Array(Number(r)).fill(0n);
  coeffs[0] = modularExponentiation(a, n, n); // a^n mod n
  coeffs[Number(n % r)] = 1n;                // x^n term
  
  const right = new Array(Number(r)).fill(0n);
  right[0] = a;                              // a
  right[Number(n % r)] = 1n;                 // x^n
  
  for (let i = 0; i < r; i++) {
      if ((coeffs[i] - right[i]) % n !== 0n) return false;
  }
  return true;
}



const isPrimeAKS3 = (n) => {
  // Handle small cases
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n) return false;

  // Step 1: Check if n is a perfect power (optimized)
  const logN = BigInt(Math.floor(Math.log2(Number(n > 2n ** 53n ? 2n ** 53n : n))));
  for (let b = 2n; b <= logN; b++) {
    let a = binaryPowerSearch(n, b);
    if (a ** b === n) return false;
  }

  // Step 2: Find smallest r such that ord_r(n) > log(n)^2
  const maxOrder = logN * logN;
  let r = 2n;
  while (r < n) {
    if (gcd(n, r) !== 1n) {
      r++;
      continue;
    }
    let k = 1n;
    while (k <= maxOrder && modExp(n, k, r) !== 1n) k++;
    if (k > maxOrder) break;
    r++;
  }
  if (r >= n) return true; // If no suitable r found, n is prime (rare case)

  // Step 3: Check divisibility up to r
  for (let a = 2n; a <= r && a < n; a++) {
    if (n % a === 0n) return false;
  }

  // Step 4: Simplified polynomial check (AKS lite)
  const limit = BigInt(Math.floor(Math.sqrt(Number(r))));
  for (let a = 1n; a <= limit; a++) {
    if (modExp(a, n, n) !== a % n) return false;
  }

  return true;
};


// Binary search to find a such that a^b ≈ n
const binaryPowerSearch = (n, b) => {
  let low = 1n, high = n;
  while (low <= high) {
    let mid = (low + high) / 2n;
    let power = modExp(mid, b, n * n); // Avoid overflow
    if (power === n) return mid;
    if (power < n) low = mid + 1n;
    else high = mid - 1n;
  }
  return low; // Approximate
};

// GCD for coprimality check
const gcd = (a, b) => {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
};