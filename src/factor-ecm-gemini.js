import isPrimeBPSW from "./is-prime.js"; // Assuming BPSW test

export { factorECM as default };

// Sieve of Eratosthenes to generate primes up to B1
function sieve(limit) {
    const numLimit = Number(limit); // Convert BigInt for array indexing
    if (numLimit < 2) return [];
    const primes = [];
    const isPrime = new Array(numLimit + 1).fill(true);
    isPrime[0] = isPrime[1] = false;

    for (let p = 2; p * p <= numLimit; p++) {
        if (isPrime[p]) {
            for (let i = p * p; i <= numLimit; i += p)
                isPrime[i] = false;
        }
    }

    for (let p = 2; p <= numLimit; p++) {
        if (isPrime[p]) {
            primes.push(BigInt(p)); // Store primes as BigInt
        }
    }
    return primes;
}

function factorECM(n_in) {
    const n = BigInt(n_in);

    // Basic cases
    if (n <= 1n) return n; // Or throw error?
    if (n % 2n === 0n) return 2n;
    if (n % 3n === 0n) return 3n;
    // Add trial division for small primes (e.g., up to 100) here for efficiency
    // ...

    // Check if n is prime using the imported checker
    if (isPrimeBPSW(n)) {
        return n; // n is prime, its only factor > 1 is itself
    }

    // --- Helper Functions ---
    function gcd(a, b) {
        a = a < 0n ? -a : a;
        b = b < 0n ? -b : b;
        while (b !== 0n) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    // Inlining modular ops for potential minor speedup, but keeping functions is fine too
    // function modAdd(a, b, n) { return (a + b) % n; }
    // function modSub(a, b, n) { return (a - b + n) % n; }
    // function modMul(a, b, n) { return (a * b) % n; }

    function modInverse(a, m) {
        if (m <= 1n) return null; // Inverse undefined for modulus <= 1
        const m_orig = m;
        let a_rem = (a % m + m) % m; // Ensure a is in [0, m-1]
        if (a_rem === 0n) return { factor: m }; // gcd(0, m) = m

        let [old_r, r] = [a_rem, m];
        let [old_s, s] = [1n, 0n];

        while (r !== 0n) {
            let quotient = old_r / r;
            [old_r, r] = [r, old_r - quotient * r];
            [old_s, s] = [s, old_s - quotient * s];
        }

        if (old_r > 1n) return { factor: old_r }; // Inverse doesn't exist, return gcd
        if (old_s < 0n) old_s += m_orig;
        return { inverse: old_s };
    }

    function pointAdd(P, Q, n, a) {
        // Handle identity element
        if (P === null) return { point: Q };
        if (Q === null) return { point: P };
    
        const [x1, y1] = P;
        const [x2, y2] = Q;
    
        // Check for P = -Q (result is point at infinity)
        // Use modular addition for robustness: y1 + y2 === 0 (mod n)
        if (x1 === x2 && (y1 + y2) % n === 0n) {
            return { point: null };
        }
    
        let m_num, m_den_mod_n; // Numerator and Denominator (mod n) for slope m
    
        if (x1 === x2 && y1 === y2) {
            // --- Point Doubling (P == Q) ---
    
            // Case: Point of order 2 (vertical tangent) -> result is infinity
            if (y1 === 0n) {
                 return { point: null };
            }
    
            // Calculate slope m = (3*x1^2 + a) / (2*y1) mod n
            m_num = (3n * x1 * x1 + a); // Calculate numerator
            let den = (2n * y1);       // Calculate denominator
    
            // Reduce numerator and denominator mod n
            m_num = (m_num % n + n) % n;
            m_den_mod_n = (den % n + n) % n;
    
            // If denominator mod n is 0, gcd(den, n) > 1. modInverse will catch it.
            // This happens if 2=0 (n is even) or y1=0 (already handled) or gcd(y1, n)>1
    
        } else {
            // --- Point Addition (P != Q) ---
    
            // Calculate slope m = (y2 - y1) / (x2 - x1) mod n
            m_num = (y2 - y1); // Calculate numerator
            let den = (x2 - x1); // Calculate denominator
    
             // Reduce numerator and denominator mod n
            m_num = (m_num % n + n) % n;
            m_den_mod_n = (den % n + n) % n;
    
            // If denominator mod n is 0, it means x1 = x2 (mod n).
            // Since we already checked P = -Q and P = Q, this implies gcd(x2-x1, n) > 1.
            // modInverse will catch this.
        }
    
        // --- Calculate Modular Inverse of Denominator ---
        // modInverse internally calculates gcd(m_den_mod_n, n)
        const invResult = modInverse(m_den_mod_n, n);
    
        // Check if inverse failed (factor found)
        if (invResult.factor) {
            // Factor g = gcd(m_den_mod_n, n) was found.
            return { factor: invResult.factor };
        }
    
        // Inverse exists, calculate slope m
        const m = (m_num * invResult.inverse) % n;
    
        // --- Calculate Resulting Point (x3, y3) ---
        // x3 = m^2 - x1 - x2 (mod n)
        let x3 = (m * m - x1 - x2);
        x3 = (x3 % n + n) % n;
    
        // y3 = m*(x1 - x3) - y1 (mod n)
        let y3 = (m * (x1 - x3) - y1);
        y3 = (y3 % n + n) % n;
    
        // Return the resulting point
        return { point: [x3, y3] };
    }

    function scalarMultiply(k, P, n, a) {
        let R = null; // Point at infinity
        let Q = P;    // Current multiple P, 2P, 4P,...

        if (k < 0n) throw new Error("Scalar k must be non-negative"); // Or handle negation
        if (k === 0n) return { point: null };

        while (k > 0n) {
            if (k & 1n) { // If k is odd
                const addResult = pointAdd(R, Q, n, a);
                if (addResult.factor) return addResult; // Factor found
                R = addResult.point;
            }
            // Double Q -> 2Q
            const doubleResult = pointAdd(Q, Q, n, a);
            if (doubleResult.factor) return doubleResult; // Factor found
            Q = doubleResult.point;

            if (Q === null) { // Optimization: if Q becomes infinity, R won't change further
                 break;
            }

            k >>= 1n; // k = k / 2
        }
        return { point: R };
    }

    // --- Main ECM Algorithm ---
    const maxAttempts = 100; // Number of curves to try
    const B1 = 10000n;       // Stage 1 bound (adjust as needed)

    // Precompute primes for Stage 1
    const primesB1 = sieve(B1);
    if (primesB1.length === 0 && B1 >= 2n) {
        console.error("Sieve failed or B1 is too small.");
        return n; // Cannot proceed
    }


    for (let i = 0; i < maxAttempts; i++) {
        // Random curve parameters (mod n)
        // Using simple random; consider crypto.getRandomBytes for large n if needed
        const a = BigInt(Math.floor(Math.random() * Number(n))); // Can overflow if n > MAX_SAFE_INTEGER
        const x0 = BigInt(Math.floor(Math.random() * Number(n)));
        const y0 = BigInt(Math.floor(Math.random() * Number(n)));

        // b = (y0^2 - x0^3 - a*x0) % n
        const y0_2 = (y0 * y0) % n;
        const x0_3 = (x0 * x0 * x0) % n;
        const ax0 = (a * x0) % n;
        const b = (((y0_2 - x0_3) % n + n) % n - ax0 + n) % n;

        // Check curve singularity: gcd(4a^3 + 27b^2, n)
        const a3 = (a * a * a) % n;
        const b2 = (b * b) % n;
        const term1 = (4n * a3) % n;
        const term2 = (27n * b2) % n;
        const delta_check = (term1 + term2) % n;
        const g = gcd(delta_check, n);

        if (g > 1n && g < n) {
            console.log("Factor found from discriminant check:", g);
            return g; // Found factor!
        }
        if (g === n) {
            // console.log("Curve is singular mod n, trying new curve.");
            continue; // Curve is singular mod n, try another one
        }
        // If g === 1n, curve is non-singular, proceed.

        let P_stage1 = [x0, y0];

        // Stage 1: multiply by powers of primes <= B1
        for (const p of primesB1) {
            // Calculate highest power p^k <= B1 efficiently
            let max_power_e = 1n;
            let current_p = p;
            while (current_p <= B1) {
                max_power_e = current_p;
                 // Check for overflow before multiplication
                 if (B1 / p < current_p) {
                     break;
                 }
                 current_p *= p;
            }

            let shouldBreakPrimeLoop = false; // Flag to signal breaking the 'for p' loop

            // Only multiply if max_power_e > 1 (p <= B1 guarantees this)
            // Although p<=B1, if B1=1, this might be false. But sieve handles B1<2.
            // If B1=2, p=2, max_power_e=2. If B1=3, p=2,e=2; p=3,e=3. Seems okay.
            if (max_power_e > 1n) {
                const result = scalarMultiply(max_power_e, P_stage1, n, a); // 'result' is local to this block

                if (result.factor) {
                    const factor = result.factor;
                    const final_factor = gcd(factor, n); // Ensure it's a factor of n
                    if (final_factor > 1n && final_factor < n) {
                        // Found the actual non-trivial factor!
                        return final_factor;
                    } else if (final_factor === n) {
                         // Found factor n (or gcd was n), implies point order issue or unlucky choice.
                         // Stop processing this curve and try a new one.
                         shouldBreakPrimeLoop = true;
                    }
                    // else factor is 1 or gcd is 1 (e.g. modInverse failed with g, gcd(g,n)=1).
                    // Continue processing this curve unless shouldBreakPrimeLoop is already true.

                } else if (result.point === null) {
                     // Point became point at infinity. Order is smooth.
                     // Factor *should* have been found by gcd check inside scalarMultiply/pointAdd.
                     // This usually indicates an issue or very unlucky curve. Stop processing this curve.
                     shouldBreakPrimeLoop = true;
                } else {
                     // Success, update point for the next prime's multiplication
                     P_stage1 = result.point;
                }
            }
            // else: max_power_e was 1n (should not happen for p>=2 from sieve).

            // Check the flag *after* the 'if (max_power_e > 1n)' block
            if (shouldBreakPrimeLoop) {
                break; // Break the 'for (const p of primesB1)' loop
            }

        } // End Stage 1 prime loop ('for (const p of primesB1)')

        // If the prime loop finished naturally (didn't break early),
        // or if it broke because factor===n or point===null,
        // the outer loop 'for (let i = 0; ...)' will continue to the next attempt/curve.

    } // End attempts loop

    // If no factor found after all attempts
    console.log("ECM Stage 1 failed to find a factor.");
    return n; // Return original number indicating failure
}