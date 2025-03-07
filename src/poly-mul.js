export {polyMulMod, polyMulKaratsuba as default}

// Multiplies polynomials mod (x^r - 1, mod) NOT using FFT-based Number Theoretic Transform (NTT)
const polyMulMod = (A, B, mod, r) => {
    let res = new Array(Number(r)).fill(0n);
  
    for (let i = 0n; i < BigInt(A.length); i++) {
      for (let j = 0n; j < BigInt(B.length); j++) {
        let index = (i + j) % r;
        res[Number(index)] = (res[Number(index)] + A[Number(i)] * B[Number(j)]) % mod;
      }
    }
  
    return res;
  };

// Karatsuba polynomial multiplication (faster than naive O(n²))
// const polyMulKaratsuba = (A, B, mod, r) => {
//   if (A.length === 1 || B.length === 1) return polyMulMod(A, B, mod, r);

//   let m = Math.floor(A.length / 2);
//   let A0 = A.slice(0, m), A1 = A.slice(m);
//   let B0 = B.slice(0, m), B1 = B.slice(m);

//   let Z0 = polyMulKaratsuba(A0, B0, mod, r);
//   let Z2 = polyMulKaratsuba(A1, B1, mod, r);

//   let A0A1 = A0.map((val, i) => (val + (A1[i] || 0n)) % mod);
//   let B0B1 = B0.map((val, i) => (val + (B1[i] || 0n)) % mod);

//   let Z1 = polyMulKaratsuba(A0A1, B0B1, mod, r).map((val, i) => (val - Z0[i] - Z2[i] + mod) % mod);

//   let res = new Array(Number(r)).fill(0n);
//   for (let i = 0; i < m; i++) {
//     res[i] = Z0[i];
//     res[i + m] = (res[i + m] + Z1[i]) % mod;
//     res[i + 2 * m] = (res[i + 2 * m] + Z2[i]) % mod;
//   }

//   return res;
// };


const polyMulKaratsuba = (A, B, mod) => {
  const n = Math.max(A.length, B.length);

  // Base case for recursion
  if (n <= 1) {
      return [BigInt(A[0] || 0) * BigInt(B[0] || 0) % mod];
  }

  // Make sure A and B have the same length and are even
  const m = Math.ceil(n / 2);
  const highA = A.slice(m);
  const lowA = A.slice(0, m);
  const highB = B.slice(m);
  const lowB = B.slice(0, m);

  // Recursively calculate three products
  const z0 = polyMulKaratsuba(lowA, lowB, mod);
  const z1 = polyMulKaratsuba(addPoly(lowA, highA, mod), addPoly(lowB, highB, mod), mod);
  const z2 = polyMulKaratsuba(highA, highB, mod);

  // Combine the results
  const result = new Array(2 * n - 1).fill(BigInt(0));
  for (let i = 0; i < z0.length; i++) {
      result[i] = (result[i] + z0[i]) % mod;
  }
  for (let i = 0; i < z1.length; i++) {
      result[i + m] = (result[i + m] + z1[i] - z0[i] - z2[i]) % mod;
  }
  for (let i = 0; i < z2.length; i++) {
      result[i + 2 * m] = (result[i + 2 * m] + z2[i]) % mod;
  }

  // Handle negative results
  for (let i = 0; i < result.length; i++) {
      if (result[i] < BigInt(0)) {
          result[i] += mod;
      }
  }

  // Trim trailing zeros
  while (result.length > 1 && result[result.length - 1] === BigInt(0)) {
      result.pop();
  }

  return result;
};

const addPoly = (A, B, mod) => {
  const maxLength = Math.max(A.length, B.length);
  const result = new Array(maxLength).fill(BigInt(0));
  for (let i = 0; i < maxLength; i++) {
      result[i] = (BigInt(A[i] || 0) + BigInt(B[i] || 0)) % mod;
  }
  return result;
};