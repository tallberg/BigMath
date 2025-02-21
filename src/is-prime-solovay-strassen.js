import jacobiSymbol from "./jacobi-symbol.js";
import modExp from "./mod-exp.js";
export {isPrimeSolovayStrassen as default}

// Solovay-Strassen Primality Test
const isPrimeSolovayStrassen = (n, k = 5) => {
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n) return false;
  
    for (let i = 0; i < k; i++) {
      let a = 2n + BigInt(Math.floor(Math.random() * Number(n - 3n)));
      let jacobi = jacobiSymbol(a, n);
      if (jacobi === 0n) return false; // Composite case
  
      let modExpResult = modExp(a, (n - 1n) / 2n, n);
      if (modExpResult !== (jacobi % n + n) % n) return false;
    }
  
    return true; // Probably prime
  };