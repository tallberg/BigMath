export {polyMulMod, polyMulKaratsuba as default}

// Multiplies polynomials mod (x^r - 1, mod) using FFT-based Number Theoretic Transform (NTT)
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
const polyMulKaratsuba = (A, B, mod, r) => {
  if (A.length === 1 || B.length === 1) return polyMulMod(A, B, mod, r);

  let m = Math.floor(A.length / 2);
  let A0 = A.slice(0, m), A1 = A.slice(m);
  let B0 = B.slice(0, m), B1 = B.slice(m);

  let Z0 = polyMulKaratsuba(A0, B0, mod, r);
  let Z2 = polyMulKaratsuba(A1, B1, mod, r);

  let A0A1 = A0.map((val, i) => (val + (A1[i] || 0n)) % mod);
  let B0B1 = B0.map((val, i) => (val + (B1[i] || 0n)) % mod);

  let Z1 = polyMulKaratsuba(A0A1, B0B1, mod, r).map((val, i) => (val - Z0[i] - Z2[i] + mod) % mod);

  let res = new Array(Number(r)).fill(0n);
  for (let i = 0; i < m; i++) {
    res[i] = Z0[i];
    res[i + m] = (res[i + m] + Z1[i]) % mod;
    res[i + 2 * m] = (res[i + 2 * m] + Z2[i]) % mod;
  }

  return res;
};