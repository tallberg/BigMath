import polyMulMod from "./poly-mul.js";
export {modPolyExp as default}

// Computes (x + a)^n ≡ x^n + a (mod n, x^r - 1)
const modPolyExp = (coeffs, exp, mod, r) => {
    let res = new Array(Number(r)).fill(0n);
    res[0] = 1n;
  
    while (exp > 0n) {
      if (exp % 2n === 1n) res = polyModMul(res, coeffs, mod, r);
      coeffs = polyModMul(coeffs, coeffs, mod, r);
      exp /= 2n;
    }
  
    return res;
  };