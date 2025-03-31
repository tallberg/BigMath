export {isPrimeTrialStep30 as default, isPrimeTrialStep6}

function isPrimeTrialStep6(n) {
    if (n <= 1n) return false;
    if (n <= 3n) return true;
  
    if (n % 2n === 0n || n % 3n === 0n) return false;
  
    for (let i = 5n; i * i <= n; i += 6n) {
      if (n % i === 0n || n % (i + 2n) === 0n) return false;
    }
  
    return true;
}

function isPrimeTrialStep30(n) {
    if (n <= 1n) return false;
    if (n <= 3n) return true;
  
    if (n % 2n === 0n || n % 3n === 0n || n % 5n === 0n || n % 7n === 0n || 
        n % 11n === 0n || n % 13n === 0n || n % 17n === 0n || n % 19n === 0n || 
        n % 23n === 0n || n % 27n === 0n) return false;
  
    let i = 29n;
    while (i * i <= n) {
      if (n % i === 0n || n % (i + 2n) === 0n || n % (i + 8n) === 0n 
        || n % (i + 12n) === 0n || n % (i + 14n) === 0n || n % (i + 18n) === 0n 
        || n % (i + 20n) === 0n || n % (i + 24n) === 0n) return false;
      i += 30n;
    }
  
    return true;
  }