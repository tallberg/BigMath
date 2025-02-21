import modExp from "./mod-exp.js";
import modPolyExp from "./mod-poly-exp.js";
import polyMulKaratsuba from "./poly-mul.js";
export {isPrimeAKS as default, isPrimeAKS2, isPrimeAksKaratsuba}

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

// Optimized AKS with Karatsuba Polynomial Multiplication
const isPrimeAksKaratsuba = (n) => {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n) return false;

  // Step 1: Check if n is a perfect power
  for (let b = 2n; b * b <= n; b++) {
    let a = 2n;
    while (a ** b <= n) {
      if (a ** b === n) return false;
      a++;
    }
  }

  // Step 2: Find the smallest r where order of n mod r is large enough
  let r = 2n, maxOrder = 1n;
  while (maxOrder * maxOrder < n) maxOrder++;
  
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

  // Step 4: Polynomial congruence check (using Karatsuba)
  for (let a = 1n; a <= r; a++) {
    let lhs = polyModExp([a, 1n], n, n, r, polyMulKaratsuba);
    let rhs = new Array(Number(r)).fill(0n);
    rhs[0] = a;
    rhs[Number(n % r)] = 1n;
    if (!lhs.every((val, idx) => val === rhs[idx])) return false;
  }

  return true;
};