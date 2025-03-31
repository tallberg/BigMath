export {jacobiSymbol as default}

// Computes the Jacobi symbol (a/n)
const jacobiSymbol = (a, n) => {
    if (n <= 0n || n % 2n === 0n) return NaN;
    a = a % n;
    let result = 1n;
  
    while (a !== 0n) {
      while (a % 2n === 0n) { // >> 1n
        a /= 2n;
        if (n % 8n === 3n || n % 8n === 5n) result = -result; // 
      }
  
      [a, n] = [n, a];
      if (a % 4n === 3n && n % 4n === 3n) result = -result; // a & 3n == 3n || n & 3n === 3n 
      a = a % n;
    }
  
    return (n === 1n) ? result : 0n;
  };


  const jacobiSymbol2 = (a, n) => {
    if (n <= 0n || n & 1n === 0n) return NaN;
    a = a % n;
    let result = 1n;
  
    while (a !== 0n) {
      while (a & 1n === 0n) {
        a >>= 1n;
        if (n & 7n === 3n || n & 7 === 5n) result = -result;
      }
  
      [a, n] = [n, a];
      if (a & 3n == 3n || n & 3n === 3n) result = -result;
      a = a % n;
    }
  
    return (n === 1n) ? result : 0n;
  };