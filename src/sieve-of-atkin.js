export {sieveOfAtkin as default}

function sieveOfAtkin0(bigLimit) {
    const limit = Number(bigLimit); 
    if (limit < 2) return [];

    // Initialize an array to hold boolean values
    const sieve = new Array(limit + 1).fill(false);
    sieve[2] = true; // 2 is a prime number
    sieve[3] = true; // 3 is a prime number

    // Step 1: Mark potential primes using the quadratic forms
    for (let x = 1; x * x <= limit; x++) {
        for (let y = 1; y * y <= limit; y++) {
            let n = 4 * x * x + y * y;
            if (n <= limit && (n % 12 === 1 || n % 12 === 5)) {
                sieve[n] = !sieve[n];
            }

            n = 3 * x * x + y * y;
            if (n <= limit && n % 12 === 7) {
                sieve[n] = !sieve[n];
            }

            n = 3 * x * x - y * y;
            if (x > y && n <= limit && n % 12 === 11) {
                sieve[n] = !sieve[n];
            }
        }
    }

    // Step 2: Eliminate non-primes
    for (let n = 5; n * n <= limit; n++) {
        if (sieve[n]) {
            for (let k = n * n; k <= limit; k += n * n) {
                sieve[k] = false;
            }
        }
    }

    // Step 3: Collect all primes
    const primes = [];
    for (let i = 0; i <= limit; i++) {
        if (sieve[i]) {
            primes.push(i);
        }
    }

    return primes;
}


function sieveOfAtkin(bigLimit) {
    const limit = Number(bigLimit); 
    if (limit < 2) return [];

    // Initialize an array to hold boolean values
    const sieve = new Uint8Array(limit + 1);
    sieve[2] = 1; // 2 is a prime number
    sieve[3] = 1; // 3 is a prime number

    // Step 1: Mark potential primes using the quadratic forms
    for (let x = 1; x * x <= limit; x++) {
        for (let y = 1; y * y <= limit; y++) {
            let n = 4 * x * x + y * y;
            if (n <= limit && (n % 12 === 1 || n % 12 === 5)) {
                sieve[n] ^= 1;
            }

            n = 3 * x * x + y * y;
            if (n <= limit && n % 12 === 7) {
                sieve[n] ^= 1;
            }

            n = 3 * x * x - y * y;
            if (x > y && n <= limit && n % 12 === 11) {
                sieve[n] ^= 1;
            }
        }
    }

    // Step 2: Eliminate non-primes
    for (let n = 5; n * n <= limit; n++) {
        if (sieve[n]) {
            for (let k = n * n; k <= limit; k += n * n) {
                sieve[k] = 0;
            }
        }
    }

    // Step 3: Collect all primes
    const primes = [];
    for (let i = 0; i <= limit; i++) {
        if (sieve[i]) {
            primes.push(i);
        }
    }

    return primes;
}