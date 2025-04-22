import isPrimeBPSW from "./is-prime.js"; // Assuming BPSW test
export { factorECM as default };

// --- Sieve Function (modified to support a range) ---
function sieve(limit, lowerBound = 0n) {
    const numLimit = Number(limit);
    const numLower = Number(lowerBound);
    if (numLimit < 2) return [];
    const primes = [];
    // Size sieve array based on the upper limit
    const isPrime = new Array(numLimit + 1).fill(true);
    isPrime[0] = isPrime[1] = false;

    for (let p = 2; p * p <= numLimit; p++) {
        if (isPrime[p]) {
            // Start marking multiples from p*p
            for (let i = p * p; i <= numLimit; i += p)
                isPrime[i] = false;
        }
    }

    // Collect primes >= lower bound
    const startPrime = Math.max(2, numLower);
    for (let p = startPrime; p <= numLimit; p++) {
        if (isPrime[p]) {
            primes.push(BigInt(p)); // Store primes as BigInt
        }
    }
    return primes;
}


function factorECM(n_in) {
    const n = BigInt(n_in);

    // Basic cases & trial division
    if (n <= 1n) return n;
    if (n % 2n === 0n) return 2n;
    if (n % 3n === 0n) return 3n;
    if (n % 5n === 0n) return 5n;
    if (n % 7n === 0n) return 7n;
    // ... add more small primes if desired

    // Check if n is prime
    if (isPrimeBPSW(n)) {
        return n;
    }

    // --- Helper Functions (gcd, modInverse, pointAdd, scalarMultiply as before) ---
    function gcd(a, b) {
        a = a < 0n ? -a : a;
        b = b < 0n ? -b : b;
        while (b !== 0n) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    function modInverse(a, m) {
        // ... (previous robust version returning {factor: g} or {inverse: i}) ...
        if (m <= 1n) return { factor: m }; // Or handle as error
        const m_orig = m;
        let a_rem = (a % m + m) % m;
        if (a_rem === 0n) return { factor: m };

        let [old_r, r] = [a_rem, m];
        let [old_s, s] = [1n, 0n];

        while (r !== 0n) {
            if (old_r === 0n) return { factor: r } // Should not happen if a_rem != 0? Defensive check.
            let quotient = old_r / r;
            [old_r, r] = [r, old_r - quotient * r];
            [old_s, s] = [s, old_s - quotient * s];
        }

        if (old_r > 1n) return { factor: old_r };
        if (old_s < 0n) old_s += m_orig;
        return { inverse: old_s };
    }

    function pointAdd(P, Q, n, a) {
        // ... (previous robust version returning {factor: g} or {point: P}) ...
        // Handle identity element
        if (P === null) return { point: Q };
        if (Q === null) return { point: P };

        const [x1, y1] = P;
        const [x2, y2] = Q;

        // Check for P = -Q (result is point at infinity)
        if (x1 === x2 && (y1 + y2) % n === 0n) {
            return { point: null };
        }

        let m_num, m_den_mod_n;

        if (x1 === x2 && y1 === y2) { // Point Doubling
            if (y1 === 0n) return { point: null }; // Point of order 2

            m_num = (3n * x1 * x1 + a);
            let den = (2n * y1);
            m_num = (m_num % n + n) % n;
            m_den_mod_n = (den % n + n) % n;
        } else { // Point Addition
            m_num = (y2 - y1);
            let den = (x2 - x1);
            m_num = (m_num % n + n) % n;
            m_den_mod_n = (den % n + n) % n;
        }

        const invResult = modInverse(m_den_mod_n, n);
        if (invResult.factor) return { factor: invResult.factor };

        const m = (m_num * invResult.inverse) % n;

        let x3 = (m * m - x1 - x2);
        x3 = (x3 % n + n) % n;
        let y3 = (m * (x1 - x3) - y1);
        y3 = (y3 % n + n) % n;

        return { point: [x3, y3] };
    }

    function scalarMultiply(k, P, n, a) {
        // ... (previous robust version checking pointAdd results) ...
        let R = null;
        let Q = P;

        if (k < 0n) throw new Error("Scalar k must be non-negative");
        if (k === 0n) return { point: null };

        while (k > 0n) {
            if (k & 1n) {
                const addResult = pointAdd(R, Q, n, a);
                if (addResult.factor) return addResult;
                R = addResult.point;
            }
            const doubleResult = pointAdd(Q, Q, n, a);
            if (doubleResult.factor) return doubleResult;
            Q = doubleResult.point;
            if (Q === null) break;
            k >>= 1n;
        }
        return { point: R };
    }

    // --- Stage 2 Function ---
    function stage2ECM(P_s1, n, a, B1, B2) {
        if (P_s1 === null) return null; // Cannot run Stage 2 if Stage 1 point is null

        console.log(`Starting Stage 2 with B1=${B1}, B2=${B2}`); // DEBUG

        // Stage 2 Parameters
        const S = 20n; // Number of baby steps points (adjust as needed)
        const M = 100n; // GCD batch size (adjust as needed)

        // Generate primes q where B1 < q <= B2
        const primes_q = sieve(B2, B1 + 1n); // Get primes strictly > B1 up to B2
        if (primes_q.length === 0) {
            console.log("No primes found for Stage 2 range."); // DEBUG
            return null; // No primes in range
        }

        // Precomputation (Baby Steps)
        const Q_result = pointAdd(P_s1, P_s1, n, a); // Q = 2 * P_s1
        if (Q_result.factor) return Q_result.factor; // Factor found during doubling
        if (Q_result.point === null) return null;     // Point became null, stage 2 fails
        const Q = Q_result.point;

        const baby_x = []; // Store x-coordinates of j*Q
        let Q_j = Q;       // Start with j=1 (Q_j = 1*Q)
        for (let j = 1n; j <= S; j++) {
            if (Q_j === null) break; // Stop precomputation if point becomes null
            baby_x.push(Q_j[0]);

            // Compute (j+1)*Q = j*Q + Q
            if (j < S) { // Don't compute beyond S*Q
                const addResult = pointAdd(Q_j, Q, n, a);
                if (addResult.factor) return addResult.factor; // Factor found
                Q_j = addResult.point;
            }
        }
        if (baby_x.length === 0) return null; // Precomputation failed

        // Iteration (Giant Steps)
        const q_start = primes_q[0];
        let P_curr_result = scalarMultiply(q_start, P_s1, n, a); // P_curr = q_start * P_s1
        if (P_curr_result.factor) return P_curr_result.factor;
        if (P_curr_result.point === null) return null;
        let P_curr = P_curr_result.point;
        let q_prev = q_start;

        let g = 1n; // Batch GCD accumulator
        let steps_since_gcd = 0n;

        for (let i = 1; i < primes_q.length; i++) {
            const q_curr = primes_q[i];
            const delta = q_curr - q_prev;

            // Compute P_delta = delta * P_s1
            const P_delta_result = scalarMultiply(delta, P_s1, n, a);
            if (P_delta_result.factor) return P_delta_result.factor;
            // If P_delta is null, we can't add it. This implies order divides delta.
            // Factor should have been found in scalarMultiply. Abort stage 2 for safety.
            if (P_delta_result.point === null) return null;
            const P_delta = P_delta_result.point;

            // Update P_curr = P_curr + P_delta
            const P_new_curr_result = pointAdd(P_curr, P_delta, n, a);
            if (P_new_curr_result.factor) return P_new_curr_result.factor;
            if (P_new_curr_result.point === null) return null; // Point became null
            P_curr = P_new_curr_result.point;
            const x_curr = P_curr[0];

            // Update batch product g = g * Product(x_curr - x_j) mod n
            for (const x_j of baby_x) {
                let term = (x_curr - x_j);
                g = (g * term) % n;
            }

            steps_since_gcd++;

            // Perform batch GCD check
            if (steps_since_gcd === M) {
                const h = gcd(g, n);
                if (h > 1n && h < n) {
                    console.log("Factor found in Stage 2 batch GCD:", h); // DEBUG
                    return h; // FACTOR FOUND!
                }
                if (h === n) {
                    console.log("Stage 2 batch GCD failed (gcd=n)."); // DEBUG
                    // Optional: Could try backtracking or smaller M here.
                    // Simple approach: Abort Stage 2 for this curve.
                    return null;
                }
                // Reset batch
                g = 1n;
                steps_since_gcd = 0n;
            }

            q_prev = q_curr; // Update previous prime for next delta calculation
        } // End loop through primes_q

        // Final GCD check for any remaining product in g
        if (g !== 1n) {
            const h = gcd(g, n);
            if (h > 1n && h < n) {
                 console.log("Factor found in Stage 2 final GCD:", h); // DEBUG
                 return h; // FACTOR FOUND!
            }
             if (h === n) {
                 console.log("Stage 2 final GCD failed (gcd=n)."); // DEBUG
                 return null; // Abort
            }
        }

        console.log("Stage 2 finished without finding factor."); // DEBUG
        return null; // Stage 2 completed without finding a factor
    }


    // --- Main ECM Algorithm ---
    const maxAttempts = 20;   // Reduced attempts for testing, increase later
    const B1 = 11000n;       // Stage 1 bound (adjust, common values: 2k, 11k, 50k)
    const B2_mult = 20n;     // Stage 2 bound = B1 * B2_mult (adjust, common 20-100)
    const B2 = B1 * B2_mult;

    // Precompute primes for Stage 1
    const primesB1 = sieve(B1);
    if (primesB1.length === 0 && B1 >= 2n) {
        console.error("Sieve failed for Stage 1 or B1 is too small.");
        return n; // Cannot proceed
    }

    console.log(`Starting ECM for n=${n} with B1=${B1}, B2=${B2}, attempts=${maxAttempts}`);

    for (let i = 0; i < maxAttempts; i++) {
        console.log(`--- Attempt ${i + 1}/${maxAttempts} ---`);
        // Random curve parameters (mod n)
        const a = BigInt(Math.floor(Math.random() * Number(n)));
        const x0 = BigInt(Math.floor(Math.random() * Number(n)));
        const y0 = BigInt(Math.floor(Math.random() * Number(n)));

        const y0_2 = (y0 * y0) % n;
        const x0_3 = (x0 * x0 * x0) % n;
        const ax0 = (a * x0) % n;
        const b = (((y0_2 - x0_3) % n + n) % n - ax0 + n) % n;

        // Check curve singularity
        const a3 = (a * a * a) % n;
        const b2 = (b * b) % n;
        const term1 = (4n * a3) % n;
        const term2 = (27n * b2) % n;
        const delta_check = (term1 + term2) % n;
        const g = gcd(delta_check, n);

        if (g > 1n && g < n) {
            console.log("Factor found from discriminant check:", g);
            return g;
        }
        if (g === n) {
            console.log("Curve is singular mod n, trying new curve.");
            continue;
        }

        let P_stage1 = [x0, y0];
        let stage1_factor_found = false;

        // --- Stage 1 ---
        console.log("Starting Stage 1...");
        for (const p of primesB1) {
            let max_power_e = 1n;
            let current_p = p;
            while (current_p <= B1) {
                max_power_e = current_p;
                if (B1 / p < current_p) break;
                current_p *= p;
            }

            if (max_power_e > 1n) {
                const result = scalarMultiply(max_power_e, P_stage1, n, a);

                if (result.factor) {
                    const factor = result.factor;
                    const final_factor = gcd(factor, n);
                    if (final_factor > 1n && final_factor < n) {
                        console.log("Factor found in Stage 1:", final_factor);
                        return final_factor;
                    } else if (final_factor === n) {
                        stage1_factor_found = true; // Treat as failure for this curve
                        break; // Break prime loop, try new curve
                    }
                    // else factor is 1, continue curve
                } else if (result.point === null) {
                    stage1_factor_found = true; // Point became null, cannot proceed to stage 2
                    break; // Break prime loop
                } else {
                    P_stage1 = result.point; // Update point
                }
            }
             if (stage1_factor_found) break; // Exit prime loop if factor=n or point=null
        } // End Stage 1 prime loop
        console.log("Stage 1 finished.");


        // --- Stage 2 ---
        // Proceed only if Stage 1 finished without factor=n or point=null
        if (!stage1_factor_found && P_stage1 !== null) {
             const stage2_result = stage2ECM(P_stage1, n, a, B1, B2);
             if (stage2_result !== null) {
                 // stage2ECM should only return a non-trivial factor or null
                 const final_factor = gcd(stage2_result, n); // Double check it divides n
                  if (final_factor > 1n && final_factor < n) {
                      console.log("Factor found from Stage 2:", final_factor);
                      return final_factor;
                  }
                  // else: Stage 2 returned something that's not a factor? Log error?
             }
             // else: Stage 2 returned null (no factor found or failed)
        } else {
             console.log("Skipping Stage 2 for this curve (Stage 1 issue or completed).");
        }

    } // End attempts loop

    console.log(`ECM failed to find a factor after ${maxAttempts} attempts with B1=${B1}, B2=${B2}.`);
    return n; // Return original number indicating failure
}