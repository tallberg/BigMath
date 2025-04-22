import isPrime from './is-prime.js'
export {factor as default}

// --- BigInt Math Helpers ---

// Greatest Common Divisor (GCD) using Euclidean Algorithm
function gcd(a, b) {
    a = abs(a);
    b = abs(b);
    while (b !== 0n) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// Absolute value for BigInt
function abs(n) {
    return n < 0n ? -n : n;
}

// Modular Exponentiation (base^exponent % modulus)
function modPow(base, exponent, modulus) {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
        if (exponent & 1n === 1n) {
            result = (result * base) % modulus;
        }
        exponent = exponent >> 1n; // Equivalent to exponent / 2n
        base = (base * base) % modulus;
    }
    return result;
}

// Integer Square Root (Floor) - Binary search approach
function bigIntSqrt(n) {
    if (n < 0n) throw 'Negative input';
    if (n < 2n) return n;

    let low = 0n;
    let high = n;
    let sqrt = 0n;

    while (low <= high) {
        let mid = (low + high) >> 1n;
        let midSquared = mid * mid;

        if (midSquared === n) {
            return mid;
        } else if (midSquared < n) {
            sqrt = mid; // Potential best guess so far
            low = mid + 1n;
        } else {
            high = mid - 1n;
        }
    }
    return sqrt;
}


// Legendre Symbol (a/p) - determines if a is a quadratic residue modulo p
function legendreSymbol(a, p) {
    if (p < 3n || !isPrime(p)) {
        throw new Error("p must be a prime greater than 2");
    }
    a = a % p;
    if (a < 0n) {
        a += p; // Ensure a is in [0, p-1]
    }
    if (a === 0n) return 0n;

    const ls = modPow(a, (p - 1n) >> 1n, p);
    // Result is 1, -1 (represented as p-1), or 0
    return ls === (p - 1n) ? -1n : ls;
}


// Tonelli-Shanks algorithm to find modular square root (x^2 = n mod p)
// Needed for efficient sieving (but complex, we might simplify sieving below)
// Basic implementation - might not handle all edge cases perfectly
function tonelliShanks(n, p) {
    if (legendreSymbol(n, p) !== 1n) {
        return []; // No square root exists
    }
    if (n === 0n) return [0n];
    if (p === 2n) return [n]; // Should not happen as we filter p=2

    // Simple case: p = 3 (mod 4)
    if (p % 4n === 3n) {
        const root = modPow(n, (p + 1n) / 4n, p);
        return [root, p - root];
    }

    // Harder case: p = 1 (mod 4) - requires more complex logic
    // Find Q, S such that p - 1 = Q * 2^S
    let S = 0n;
    let Q = p - 1n;
    while (Q % 2n === 0n) {
        S++;
        Q /= 2n;
    }

    // Find a quadratic non-residue z
    let z = 2n;
    while (legendreSymbol(z, p) !== -1n) {
        z++;
    }

    let M = S;
    let c = modPow(z, Q, p);
    let t = modPow(n, Q, p);
    let R = modPow(n, (Q + 1n) / 2n, p);

    while (t !== 1n) {
        if (t === 0n) return [0n]; // Should not happen if Legendre is 1

        // Find lowest i such that t^(2^i) = 1 (mod p)
        let i = 0n;
        let temp_t = t;
        while (temp_t !== 1n && i < M) {
            temp_t = (temp_t * temp_t) % p;
            i++;
        }
        if (i === 0n) break; // Should exit loop if t == 1

        let b = modPow(c, modPow(2n, M - i - 1n, p - 1n), p); // Exponent is mod p-1 (phi(p))
        M = i;
        c = (b * b) % p;
        t = (t * c) % p;
        R = (R * b) % p;
    }

    return [R, p - R];
}


// --- Factor Base and Sieving Related ---

function generateFactorBase(n, B) {
    console.log(`Generating factor base with primes up to ${B}...`);
    const factorBase = [-1n]; // Include -1 for signs

    // Handle prime p=2 separately
    if (B >= 2n) {
        console.log("Including p=2 in factor base.");
        factorBase.push(2n);
    }

    // Start loop from p=3 for Legendre symbol check
    for (let p = 3n; p <= B; p = p + 2n) { // Increment by 2
        if (isPrime(p)) {
            // Only include odd primes p where n is a quadratic residue mod p
            if (legendreSymbol(n % p, p) === 1n) { // This is now safe
                factorBase.push(p);
            }
        }
    }
    console.log(`Factor Base (${factorBase.length} primes including -1 and maybe 2):`, factorBase.map(p => p.toString()));
    return factorBase;
}

// Tries to factor num using only primes from the factor base
// Returns null if not smooth, otherwise returns exponent vector
function factorSmooth(num, factorBase) {
    // *** DEBUGGING: Log the number being checked ***
    //console.log(`factorSmooth checking: ${num}`);
    //let originalNum = num; // Keep original for logging
    
    let target = abs(num);
    const exponents = Array(factorBase.length).fill(0n);

    if (target === 0n) return null; // Cannot factor 0

    // Handle sign (-1 factor)
    exponents[0] = (num < 0n) ? 1n : 0n;


    // Trial division with factor base primes
    for (let i = 1; i < factorBase.length; i++) { // Start from i=1 to skip -1
        const p = factorBase[i];
        if (target === 1n) break;
        if (p === 0n) continue; // Should not happen, but safe check

        // *** DEBUGGING: Check divisibility ***
        // if (target % p === 0n) {
        //     console.log(`  ${target} is divisible by ${p}`);
        // }

        let count = 0n;
        while (target % p === 0n) {
             if (target === 0n) break; // Safety break
             target /= p;
             count++;
        }
        if (count > 0n) {
             exponents[i] = count;
             // *** DEBUGGING: Log successful division ***
             //console.log(`    Divided by ${p}, count=${count}, remaining target=${target}`);
        }
    }

    // If target is 1, it's B-smooth
    if (target === 1n) {
        // *** DEBUGGING: Confirm smooth ***
        // console.log(`  Smooth! Original: ${originalNum}`);
        return exponents;
    } else {
        // *** DEBUGGING: Log failure reason ***
        // console.log(`  Not smooth. Original: ${originalNum}, Remainder: ${target}`);
        return null; // Not smooth over this factor base
    }
}


// --- Linear Algebra (Gaussian Elimination over GF(2)) ---

// Builds the matrix from exponent vectors mod 2
// Finds a linear dependency (subset of rows XORing to zero)
function solveLinearSystem(matrix) {
    if (!matrix || matrix.length === 0 || !matrix[0] || matrix[0].length === 0) {
        console.error("Invalid matrix provided to solveLinearSystem.");
        return null;
    }
    console.log(`Solving linear system (Matrix dimensions: ${matrix.length} x ${matrix[0].length})...`);
    const numRows = matrix.length;
    const numCols = matrix[0].length; // Number of factors in FB

    // Augmented matrix to track combinations - Use objects for clarity
    const augmentedMatrix = matrix.map((row, i) => ({
        vector: [...row], // The exponent vector mod 2 (mutable)
        combination: new Set([i]) // Indices of original relations combined to make this row (use Set for XOR logic)
    }));

    let pivotRow = 0; // Initialize pivotRow counter

    // Loop through columns, but also limited by rows
    for (let pivotCol = 0; pivotRow < numRows && pivotCol < numCols; pivotCol++) {

        // Find a row >= pivotRow with a 1 in the current pivot column
        let pivotIdx = pivotRow;
        while (pivotIdx < numRows && augmentedMatrix[pivotIdx].vector[pivotCol] === 0) {
            pivotIdx++;
        }

        if (pivotIdx === numRows) {
            // No pivot found in this column at or below pivotRow.
            // Cannot advance pivotRow. Move to the next column.
            continue;
        }

        // Swap rows (vector and combination info) to bring the pivot to pivotRow
        [augmentedMatrix[pivotRow], augmentedMatrix[pivotIdx]] = [augmentedMatrix[pivotIdx], augmentedMatrix[pivotRow]];

        // Eliminate 1s below the pivot in the current column (rows > pivotRow)
        for (let i = pivotRow + 1; i < numRows; i++) {
            if (augmentedMatrix[i].vector[pivotCol] === 1) {
                // XOR row `pivotRow` onto row `i`
                // 1. Vector XOR
                for (let j = pivotCol; j < numCols; j++) {
                    augmentedMatrix[i].vector[j] = augmentedMatrix[i].vector[j] ^ augmentedMatrix[pivotRow].vector[j];
                }
                // 2. Combination XOR (using Sets for clarity)
                const pivotCombination = augmentedMatrix[pivotRow].combination;
                const currentRowCombination = augmentedMatrix[i].combination;
                pivotCombination.forEach(idx => {
                    if (currentRowCombination.has(idx)) {
                        currentRowCombination.delete(idx); // If exists, remove (XOR)
                    } else {
                        currentRowCombination.add(idx); // If doesn't exist, add (XOR)
                    }
                });
                // No need to reassign augmentedMatrix[i].combination as Set is mutable
            }
        }

        // Pivot successfully processed for this row and column.
        // Increment pivotRow for the next iteration.
        pivotRow++; // <<< THIS IS THE CRUCIAL INCREMENT
    }

    // --- Find Dependency ---
    // Look for a zero vector in rows from the final pivotRow onwards
    console.log(`Gaussian elimination finished. Final pivotRow = ${pivotRow}. Checking for dependencies...`);
    for (let i = pivotRow; i < numRows; i++) {
        if (augmentedMatrix[i].vector.every(bit => bit === 0)) {
             // Found a dependency! The combination set tells us which original rows XORed to zero.
             const dependencyIndices = Array.from(augmentedMatrix[i].combination);
             console.log(`Found linear dependency involving ${dependencyIndices.length} relations (Indices: ${dependencyIndices.join(', ')}).`);
             return dependencyIndices; // Return the indices of the original relations
        }
    }

    console.log("No linear dependency found with current relations.");
    return null; // No dependency found
}

/**
* Calculate appropriate Quadratic Sieve parameters based on input size
* @param {BigInt} n - Number to factorize
* @returns {Object} - Parameters object containing factorBaseBound (B) and sievingInterval (M)
*/
function setParameters(n) {
    // Convert n to string to determine its bit length
    const bitLength = n.toString(2).length;
    
    // Calculate factor base bound (B)
    // Using conservative estimate to ensure high success rate
    // Approximately L_n[1/2, 1/2] where L_n is subexponential function
    let factorBaseBound;
    
    if (bitLength <= 40) {
      // For very small numbers, use minimal bound
      factorBaseBound = 50n;
    } else if (bitLength <= 80) {
      // Small numbers (~24 digits)
      factorBaseBound = 200n;
    } else if (bitLength <= 100) {
      // Medium numbers (~30 digits)
      factorBaseBound = 500n;
    } else if (bitLength <= 130) {
      // Large numbers (~40 digits)
      factorBaseBound = 1000n;
    } else if (bitLength <= 160) {
      // Very large numbers (~48 digits)
      factorBaseBound = 3000n;
    } else {
      // Extremely large numbers
      factorBaseBound = 10000n;
    }
    
    // Calculate sieving interval (M)
    // Conservative estimate: typically M ≈ B^2 for high success rate
    // Using larger interval to improve success chance
    let sievingInterval = factorBaseBound * factorBaseBound * 2n;
    
    // For very large numbers, cap the sieving interval to avoid memory issues
    if (bitLength > 200) {
      sievingInterval = 20000000n;
    }
    
    // For small numbers, ensure minimum size
    if (sievingInterval < 10000n) {
      sievingInterval = 10000n;
    }
    
    console.log(`Bit length: ${bitLength}`);
    console.log(`Factor base bound (B): ${factorBaseBound}`);
    console.log(`Sieving interval (M): ${sievingInterval}`);
    
    return {
      factorBaseBound,
      sievingInterval
    };
   }


// --- Main Quadratic Sieve Function ---

function quadraticSieve(nStr) {
    const n = BigInt(nStr);
    console.log(`Attempting to factor n = ${n}`);

    // --- Basic Checks ---
    if (n <= 3n) {
        console.log("Number too small.");
        return [n]; // Return n itself as the only factor
    }
     if (n % 2n === 0n) {
        console.log("Factor found (trivial): 2");
        const otherFactor = n / 2n;
        console.log(`Remaining factor: ${otherFactor}`);
        // Recursively factor the other part? Or just return [2, N/2]? Let's return pair for now.
        return [2n, otherFactor];
    }
    // Simple primality test for input (optional but good)
    if (isPrime(n)) {
         console.log("Input number is prime.");
         return [n]; // Return n itself
    }


    // --- Parameters ---
    const { factorBaseBound, sievingInterval } = setParameters(n);

    // --- Setup ---
    // --- Setup ---
    const factorBase = generateFactorBase(n, factorBaseBound);
    if (!factorBase || factorBase.length <= 1) {
        console.error("Failed to generate a usable factor base (B might be too small or no primes satisfy Legendre symbol).");
        return null;
    }
    const fbSize = factorBase.length; // fbSize is a Number
    const m = bigIntSqrt(n);
    console.log(`m = floor(sqrt(n)) = ${m}`);
    console.log(`Factor Base Size (k) = ${fbSize}`); // Log the actual k

    const smoothRelations = [];
    const exponentMatrix = [];

    // --- Sieving Phase (Simplified - Direct Factoring) ---
    console.log(`Searching for smooth numbers Q(a) = (m+a)^2 - n in interval [${-sievingInterval}, ${sievingInterval}]...`);

    // Adjust relationsNeeded based on actual fbSize
    let relationsNeeded = fbSize + 10; // Aim for k + 10 relations (use Number)
    console.log(`Aiming for at least ${relationsNeeded} smooth relations.`);

    // The loop condition now compares Number < Number, which is fine
    for (let a = -sievingInterval; a <= sievingInterval && smoothRelations.length < relationsNeeded; a++) {
        if (a === 0n) continue;

        // ... (rest of the loop remains the same) ...
         const m_plus_a = m + a;
         const Q_a = (m_plus_a * m_plus_a) - n;

         if (Q_a === 0n) {
             console.log(`Lucky find! (m+a)^2 - n = 0 => n = (m+a)^2`);
             const factor = gcd(m_plus_a, n);
             if (factor > 1n && factor < n) {
                 console.log(`Factor found: ${factor}`);
                 return [factor, n/factor];
             }
             continue;
         }

         const exponents = factorSmooth(Q_a, factorBase);

         if (exponents !== null) {
             const exponentsMod2 = exponents.map(exp => Number(exp % 2n));
             console.log(`Found smooth number: a = ${a}, Q(a) = ${Q_a}, Exponents: [${exponents.join(',')}]`);
             smoothRelations.push({ a: a, exponents: exponents, Q_a: Q_a, m_plus_a: m_plus_a });
             exponentMatrix.push(exponentsMod2);

              if(smoothRelations.length % 10 === 0) { // This comparison is Number % Number === Number, OK
                  console.log(`Collected ${smoothRelations.length} smooth relations...`);
              }
         }
    }

    if (smoothRelations.length < fbSize) {
        console.error("Failed to find enough smooth relations. Try increasing B or M.");
        return;
    }

    // --- Linear Algebra Phase ---
    const dependencyIndices = solveLinearSystem(exponentMatrix);

    if (!dependencyIndices) {
        console.error("Failed to find linear dependency. Need more relations or different parameters.");
        return;
    }

    // --- Congruence of Squares ---
    console.log("Constructing congruence of squares...");
    let X = 1n;
    let combinedExponents = Array(fbSize).fill(0n);
    const selectedRelations = [];

    dependencyIndices.forEach(originalIndex => {
        const relation = smoothRelations[originalIndex];
        selectedRelations.push(relation); // Keep track for debugging/verification
        X = (X * relation.m_plus_a) % n;
        for (let i = 0; i < fbSize; i++) {
            combinedExponents[i] += relation.exponents[i];
        }
    });

    // Calculate Y = sqrt(Product of Q(a)) mod n
    let Y = 1n;
    for (let i = 0; i < fbSize; i++) {
        const exponent = combinedExponents[i];
        // Exponent must be even because the mod 2 sum was zero
        if (exponent % 2n !== 0n) {
            console.error(`Error: Combined exponent for factor ${factorBase[i]} is not even: ${exponent}`);
             // This indicates a bug in linear algebra or exponent tracking
             // Let's try to continue but it might fail
        }
        const halfExponent = exponent / 2n;
        if (halfExponent > 0n) {
            const factor = factorBase[i];
            if (factor === -1n) { // Handle sign
                 if (halfExponent % 2n !== 0n) { // If exponent of -1 is odd
                    Y = (Y * (n - 1n)) % n; // Multiply by -1 mod n
                 }
            } else {
                 Y = (Y * modPow(factor, halfExponent, n)) % n;
            }

        }
    }

    // Ensure X, Y are positive and reduced mod n
     X = (X % n + n) % n;
     Y = (Y % n + n) % n;

    console.log(`X = Product(m + aᵢ) mod n = ${X}`);
    console.log(`Y = Sqrt(Product(Q(aᵢ))) mod n = ${Y}`);

    // --- Final GCD Step ---
    let factor1 = gcd(abs(X - Y), n);
    let factor2 = gcd(X + Y, n);

    console.log(`gcd(X - Y, n) = ${factor1}`);
    console.log(`gcd(X + Y, n) = ${factor2}`);

    if (factor1 !== 1n && factor1 !== n) {
        console.log(`Factor found: ${factor1}`);
        return [factor1, n / factor1];
    }
     if (factor2 !== 1n && factor2 !== n) {
        console.log(`Factor found: ${factor2}`);
         return [factor2, n / factor2];
    }

    console.log("Trivial factors found (gcd=1 or gcd=n). This attempt failed.");
    console.log("This can happen. Possible solutions:");
    console.log("  - Find a *different* linear dependency in the matrix.");
    console.log("  - Collect more relations (increase M).");
    console.log("  - Increase the factor base size (B).");
    // This basic implementation doesn't automatically retry, but a full one would.
    return null;

}

// --- Example Usage ---
// Small number - should be relatively fast
// const numberToFactor = "8051"; // 83 * 97

// Slightly larger - might take a few seconds
// const numberToFactor = "1829"; // 31 * 59

// Larger number - will start to take noticeable time (seconds to minutes)
const numberToFactor = "451931"; // Example where QS might start showing its worth over trial division
// const numberToFactor = "1234567"; // 127 * 9721
// const numberToFactor = "262063"; // 401 * 653

// Getting larger - Expect significant time (minutes or more)
// const numberToFactor = "71111111"; // Example - Primes: 7, 1015873
// const numberToFactor = "1738951"; // 1093 * 1591

// Really pushing it for JS - Likely VERY slow or might time out in some environments
// const numberToFactor = "12345678901"; // Requires larger B and M, longer runtime

const factor = (numberToFactor) => {

    // === RUN THE FACTORIZATION ===
    const factors = quadraticSieve(numberToFactor);

    if (factors) {
        console.log(`\nFactors of ${numberToFactor}: ${factors.map(f => f.toString()).join(' * ')}`);
        // Verification
        if (factors.length > 1) {
            const product = factors.reduce((acc, val) => acc * val, 1n);
            console.log(`Verification: ${factors.join(' * ')} = ${product}`);
            if (product === BigInt(numberToFactor)) {
                console.log("Verification Successful!");
                return factors;
            } else {
                console.error("Verification FAILED!");
                return numberToFactor;
            }
        }
    } else {
        console.log(`\nFailed to find factors for ${numberToFactor} with the current parameters/run.`);
        return numberToFactor;
    }

}

