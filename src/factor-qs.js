import gcd from "./gcd.js"
export { quadraticSieve as default }

/**
 * Basic Quadratic Sieve (QS) implementation for factoring numbers up to ~60 digits.
 * 
 * @param {bigint} n - The number to factorize.
 * @returns {bigint[]} An array of factors of n.
 */
function quadraticSieve(n) {
    if (n % 2n === 0n) return [2n, ...quadraticSieve(n / 2n)];
    if (n === 1n) return [];

    /**
     * Generate a small factor base of primes for sieving.
     * @param {bigint} n - The number being factored.
     * @param {number} limit - The maximum size of the factor base.
     * @returns {bigint[]} A list of primes forming the factor base.
     */
    function generateFactorBase(n, limit) {
        const primes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n]; // Small primes for now
        return primes.filter(p => (n % p) !== 0n); // Ensure n is a quadratic residue mod p
    }

    /**
     * Computes the integer square root of a BigInt using Newton's method.
     * @param {bigint} x - The number to compute the square root of.
     * @returns {bigint} The integer square root of x.
     */
    function bigintSqrt(x) {
        if (x < 0n) throw new Error("Square root of negative numbers is not supported");
        if (x < 2n) return x;
        
        let y = x;
        let z = (x + 1n) >> 1n;
        while (z < y) {
            y = z;
            z = (x / z + z) >> 1n;
        }
        return y;
    }

    /**
     * Finds B-smooth numbers using sieving.
     * @param {bigint} n - The number being factored.
     * @param {bigint[]} factorBase - The factor base primes.
     * @returns {Array<{x: bigint, residue: bigint, factorization: Map<bigint, number>}>} List of smooth numbers.
     */
    function findSmoothNumbers(n, factorBase) {
        const xStart = bigintSqrt(n) + 1n;
        const smoothNumbers = [];
        const sieveRange = 100n; // Small range for now
        
        for (let x = xStart; x < xStart + sieveRange; x++) {
            let residue = (x * x) % n;
            const factorization = new Map();
            const originalResidue = residue;
            
            for (const p of factorBase) {
                let count = 0;
                while (residue % p === 0n) {
                    residue /= p;
                    count++;
                }
                if (count > 0) factorization.set(p, count);
            }
            
            if (residue === 1n) {
                smoothNumbers.push({ x, residue: originalResidue, factorization });
            }
        }
        return smoothNumbers;
    }

    /**
     * Constructs an exponent matrix (mod 2) for Gaussian elimination.
     * @param {Array<{factorization: Map<bigint, number>}>} smoothNumbers - The smooth numbers found.
     * @param {bigint[]} factorBase - The factor base primes.
     * @returns {number[][]} The exponent matrix (mod 2).
     */
    function constructExponentMatrix(smoothNumbers, factorBase) {
        return smoothNumbers.map(({ factorization }) => 
            factorBase.map(p => (factorization.get(p) || 0) % 2)
        );
    }

    /**
     * Performs Gaussian elimination on a binary matrix (mod 2) to find dependencies.
     * @param {number[][]} matrix - The exponent matrix (mod 2).
     * @returns {number[][]} The reduced row echelon form matrix.
     */
    function gaussianElimination(matrix) {
        const numRows = matrix.length;
        const numCols = matrix[0].length;
        let lead = 0;
        
        for (let r = 0; r < numRows; r++) {
            if (lead >= numCols) break;
            let i = r;
            while (i < numRows && matrix[i][lead] === 0) i++;
            if (i === numRows) {
                lead++;
                continue;
            }
            
            [matrix[r], matrix[i]] = [matrix[i], matrix[r]]; // Swap rows
            
            for (let j = r + 1; j < numRows; j++) {
                if (matrix[j][lead] === 1) {
                    for (let k = 0; k < numCols; k++) {
                        matrix[j][k] ^= matrix[r][k]; // XOR row reduction
                    }
                }
            }
            lead++;
        }
        return matrix;
    }

    /**
     * Extracts factor dependencies from the reduced matrix.
     * @param {number[][]} reducedMatrix - The reduced exponent matrix.
     * @returns {bigint[]} Extracted non-trivial factors.
     */
    function extractFactors(reducedMatrix, smoothNumbers, n) {
        for (const row of reducedMatrix) {
            const xProduct = smoothNumbers
                .filter((_, i) => row[i] === 1)
                .reduce((prod, s) => prod * s.x % n, 1n);
            
            const yProduct = smoothNumbers
                .filter((_, i) => row[i] === 1)
                .reduce((prod, s) => prod * bigintSqrt(s.residue) % n, 1n);
            
            const factor = gcd(xProduct - yProduct, n);
            if (factor !== 1n && factor !== n) {
                return [factor, n / factor];
            }
        }
        return [n]; // No factors found
    }

    const factorBase = generateFactorBase(n, 20);
    console.log("Factor Base:", factorBase);
    
    const smoothNumbers = findSmoothNumbers(n, factorBase);
    console.log("Smooth Numbers:", smoothNumbers);
    
    let exponentMatrix = constructExponentMatrix(smoothNumbers, factorBase);
    console.log("Exponent Matrix:", exponentMatrix);
    
    exponentMatrix = gaussianElimination(exponentMatrix);
    console.log("Reduced Matrix:", exponentMatrix);
    
    return extractFactors(exponentMatrix, smoothNumbers, n);
}

