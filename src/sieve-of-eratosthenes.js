import sqrt from './sqrt.js'
export {sieveOfEratosthenes as default, sieveOfEratosthenes2,sieveOfEratosthenesGptFirst,sieveOfEratosthenesClaude,sieveOfEratosthenesClaudeBit}

//using odds
function sieveOfEratosthenes(biglimit) {
    const limit = Number(biglimit)
    if (limit < 2) return [];
    if (limit === 2) return [2];

    // Only store odds: index i corresponds to number 2*i + 1.
    const halfLimit = Math.floor(limit / 2);
    let primes = new Array(halfLimit).fill(true);

    // Outer loop only needs to run while (2*i+1)^2 <= limit
    const maxIndex = Math.floor((Math.sqrt(limit) - 1) / 2);
    for (let i = 1; i <= maxIndex; i++) {
        if (primes[i]) {
            let p = 2 * i + 1;
            // Start marking multiples from p^2.
            let start = 2 * i * (i + 1);
            for (let j = start; j < halfLimit; j += p) {
                primes[j] = false;
            }
        }
    }

    //return primes;

    //Build the list of primes: 2 is included separately.
    let result = [2];
    for (let i = 1; i < halfLimit; i++) {
        if (primes[i]) {
            result.push(2 * i + 1);
        }
    }
    return result;
}

function sieveOfEratosthenes2(biglimit) {
    const limit = Number(biglimit)
    if (limit < 2) return [];
    if (limit === 2) return [2];

    // Only store odds: index i corresponds to number 2*i + 1.
    const halfLimit = limit >> 1;
    let primes = new Uint8Array(halfLimit).fill(true);
    let count = limit;

    // Outer loop only needs to run while (2*i+1)^2 <= limit
    const maxIndex = (Math.sqrt(limit) - 1) >> 1;
    for (let i = 1; i <= maxIndex; i++) {
        if (primes[i]) {
            let p = 2 * i + 1;
            // Start marking multiples from p^2.
            let start = 2 * i * (i + 1);
            for (let j = start; j < halfLimit; j += p) {
                primes[j] = false;
                --count;
            }
        }
    }

    // Build the list of primes.
    const result = new Uint32Array(count);
    result[0] = 2;
    let idx = 1;
    for (let i = 1; i < halfLimit; i++) {
        if (primes[i]) {
            result[idx++] = (2 * i + 1);
        }
    }
    return result;
}

function sieveOfEratosthenesClaudeBit(limit) {
    limit = Number(limit);
    
    // Handle special cases
    if (limit < 2) return new Uint32Array(0);
    if (limit === 2) return new Uint32Array([2]);
    if (limit === 3) return new Uint32Array([2, 3]);
    if (limit === 5) return new Uint32Array([2, 3, 5]);
    
    // Small primes that are factored out by wheel
    const smallPrimes = [2, 3, 5];
    
    // Wheel pattern (numbers coprime to 2,3,5)
    const wheel = [1, 7, 11, 13, 17, 19, 23, 29];
    const wheelSize = wheel.length;
    
    // Bit manipulation constants
    const BITS_PER_BYTE = 8;
    const sieveSize = Math.ceil((Math.floor((limit - 1) / 30) + 1) * wheelSize / BITS_PER_BYTE);
    
    // Create bit-packed sieve array (1 bit per number)
    const sieve = new Uint8Array(sieveSize).fill(255); // All bits set = all potential primes
    
    // Precompute bit masks
    const BIT_MASK = [1, 2, 4, 8, 16, 32, 64, 128]; // To test a bit
    const CLEAR_MASK = [254, 253, 251, 247, 239, 223, 191, 127]; // To clear a bit
    
    // Calculate sieving limit
    const sqrtLimit = Math.floor(Math.sqrt(limit));
    
    // Pre-calculate wheel position mappings for faster lookups
    const wheelPositions = {};
    for (let i = 0; i < wheelSize; i++) {
        wheelPositions[wheel[i]] = i;
    }
    
    // Pre-calculate marking patterns for each wheel value
    const markingPatterns = {};
    for (let w = 0; w < wheelSize; w++) {
        const p = wheel[w];
        markingPatterns[p] = [];
        
        // For each wheel position, find which positions need marking when multiplied by p
        for (let i = 0; i < 30; i++) {
            const product = p * i;
            const remainder = product % 30;
            
            if (wheel.includes(remainder)) {
                markingPatterns[p].push(wheelPositions[remainder]);
            }
        }
    }
    
    // Main sieving loop
    for (let segment = 0; segment <= Math.floor(sqrtLimit / 30); segment++) {
        for (let w = 0; w < wheelSize; w++) {
            const p = 30 * segment + wheel[w];
            if (p <= 5 || p > sqrtLimit) continue;
            
            // Check if prime (not marked)
            const bitIndex = segment * wheelSize + w;
            const byteIndex = bitIndex >>> 3; // Division by 8
            const bitOffset = bitIndex & 7;   // Modulo 8
            
            if (!(sieve[byteIndex] & BIT_MASK[bitOffset])) continue;
            
            // Calculate start position (p²)
            const pSquared = p * p;
            const startSegment = Math.floor(pSquared / 30);
            
            // Get the pattern for this prime
            const pattern = markingPatterns[wheel[w]] || [];
            
            // Mark multiples directly with pattern
            for (let k = startSegment; k <= Math.floor(limit / 30); k++) {
                // For each position in the pattern
                for (const pos of pattern) {
                    const markBitIndex = k * wheelSize + pos;
                    if (markBitIndex >= sieve.length * BITS_PER_BYTE) break;
                    
                    const markByteIndex = markBitIndex >>> 3;
                    const markBitOffset = markBitIndex & 7;
                    
                    // Clear bit (mark as composite)
                    sieve[markByteIndex] &= CLEAR_MASK[markBitOffset];
                }
                
                // Skip to next valid segment
                k += p - 1;
            }
        }
    }
    
    // Count primes for allocation
    let count = smallPrimes.filter(p => p <= limit).length;
    
    // Fast prime counting with bit operations
    let remainingBitCount = 0;
    for (let i = 0; i < sieveSize; i++) {
        // Use lookup table for bit counting
        let byte = sieve[i];
        while (byte) {
            remainingBitCount += (byte & 1);
            byte >>>= 1;
        }
    }
    
    // Correct for small primes and numbers beyond limit
    const totalSegments = Math.floor((limit - 1) / 30) + 1;
    const totalPositions = totalSegments * wheelSize;
    const invalidPositions = Math.max(0, totalPositions - (sieveSize * BITS_PER_BYTE));
    
    count += remainingBitCount - invalidPositions;
    
    // Allocate result array
    const result = new Uint32Array(count);
    let idx = 0;
    
    // Add small primes
    for (const p of smallPrimes) {
        if (p <= limit) {
            result[idx++] = p;
        }
    }
    
    // Add remaining primes from sieve
    for (let segment = 0; segment <= Math.floor(limit / 30); segment++) {
        for (let w = 0; w < wheelSize; w++) {
            const num = 30 * segment + wheel[w];
            if (num > limit || num <= 5) continue;
            
            const bitIndex = segment * wheelSize + w;
            const byteIndex = bitIndex >>> 3;
            const bitOffset = bitIndex & 7;
            
            if (byteIndex < sieveSize && (sieve[byteIndex] & BIT_MASK[bitOffset])) {
                if (idx < result.length) {
                    result[idx++] = num;
                }
            }
        }
    }
    
    return result;
}

function sieveOfEratosthenesClaude(limit) {
    limit = Number(limit);
    
    // Handle special cases
    if (limit < 2) return new Uint32Array(0);
    if (limit === 2) return new Uint32Array([2]);
    if (limit === 3) return new Uint32Array([2, 3]);
    
    // Initialize small primes that are factored out by wheel
    const smallPrimes = [2, 3, 5];
    const smallPrimesCount = smallPrimes.filter(p => p <= limit).length;
    
    // Initialize wheel (numbers coprime to 2, 3, 5)
    const wheel = [1, 7, 11, 13, 17, 19, 23, 29];
    const wheelSize = wheel.length;
    
    // Calculate array size needed
    const maxIndex = Math.floor((limit - 1) / 30) + 1;
    
    // Use Uint8Array for memory efficiency (we only need 0 or 1)
    let sieve = new Uint8Array(maxIndex * wheelSize).fill(1);
    
    // Sieve process
    const maxPrime = Math.floor(Math.sqrt(limit));
    
    // First pass: mark non-primes in the sieve
    for (let i = 0; i < maxIndex; i++) {
        for (let j = 0; j < wheelSize; j++) {
            const p = 30 * i + wheel[j];
            
            // If p is beyond our sieving limit, skip
            if (p > maxPrime || p > limit) break;
            
            // If already marked as non-prime, skip
            if (sieve[i * wheelSize + j] === 0) continue;
            
            // Mark multiples of p as non-prime
            const pSquared = p * p;
            const startIndex = Math.floor((pSquared - 1) / 30);
            
            for (let k = startIndex; k < maxIndex; k++) {
                for (let m = 0; m < wheelSize; m++) {
                    const num = 30 * k + wheel[m];
                    if (num > limit) break;
                    
                    if (num % p === 0) {
                        sieve[k * wheelSize + m] = 0;
                    }
                }
            }
        }
    }
    
    // Count primes for array allocation
    let count = smallPrimesCount;
    for (let i = 0; i < maxIndex; i++) {
        for (let j = 0; j < wheelSize; j++) {
            const num = 30 * i + wheel[j];
            if (num <= limit && sieve[i * wheelSize + j] === 1) {
                count++;
            }
        }
    }
    
    // Collect results
    const result = new Uint32Array(count);
    let idx = 0;
    
    // Add small primes first
    for (const p of smallPrimes) {
        if (p <= limit) {
            result[idx++] = p;
        }
    }
    
    // Add remaining primes from sieve
    for (let i = 0; i < maxIndex; i++) {
        for (let j = 0; j < wheelSize; j++) {
            const num = 30 * i + wheel[j];
            if (num <= limit && sieve[i * wheelSize + j] === 1) {
                result[idx++] = num;
            }
        }
    }
    
    return result;
}

function sieveOfEratosthenesGptFirst(limit) {
    limit = Number(limit);
    if (limit < 2) return [];
    if (limit === 2) return [2];
    if (limit === 3) return [2, 3];
    if (limit === 5) return [2, 3, 5];

    const wheel = [1, 7, 11, 13, 17, 19, 23, 29];
    const wheelIndices = {1: 0, 7: 1, 11: 2, 13: 3, 17: 4, 19: 5, 23: 6, 29: 7};
    const wheelSize = wheel.length;

    const maxIndex = Math.floor((limit - 1) / 30) + 1;
    let primes = new Uint8Array(maxIndex * wheelSize).fill(1);
    const maxPrime = Math.sqrt(limit);
    let count = limit >= 2 ? 1 : 0;

    for (let i = 1; i < maxIndex; i++) {
        for (let j = 0; j < wheelSize; j++) {
            const p = 30 * i + wheel[j];
            if (p > maxPrime) break;
            if (!primes[i * wheelSize + j]) continue;
            
            const start = p * p;
            let startIndex = Math.floor((start - 1) / 30);
            let startOffset = wheelIndices[(start - 1) % 30] || 0;
            for (let k = startIndex * wheelSize + startOffset; k < primes.length; k += p) {
                primes[k] = 0;
            }
        }
    }

    for (let i = 0; i < maxIndex; i++) {
        for (let j = 0; j < wheelSize; j++) {
            if (primes[i * wheelSize + j] && (30 * i + wheel[j]) <= limit) count++;
        }
    }

    const result = new Uint32Array(count);
    let idx = 0;
    if (limit >= 2) result[idx++] = 2;
    
    for (let i = 0; i < maxIndex; i++) {
        for (let j = 0; j < wheelSize; j++) {
            const num = 30 * i + wheel[j];
            if (num > limit) break;
            if (primes[i * wheelSize + j]) result[idx++] = num;
        }
    }

    return result;
}




//using 64bit bitmap for creating a lookup table
function sieveOfEratosthenes10(limit) {
    if (limit < 2n) return [];
    if (limit === 2n) return [2n];

    const halfLimit = limit >> 1n;
    const arraySize = Number((halfLimit + 63n) >> 6n);
    let primes = new BigUint64Array(arraySize).fill(0xffffffffffffffffn);

    const maxIndex = (sqrt(limit) - 1n) >> 1n;
    for (let i = 1n; i <= maxIndex; i++) {
        if (getBit(primes, i)) {
            let p = 2n * i + 1n;
            let start = 2n * i * (i + 1n);
            for (let j = start; j < halfLimit; j += p) {
                clearBit(primes, j);
            }
        }
    }
    return primes;
    // let result = [2n];
    // for (let i = 1n; i < halfLimit; i++) {
    //     if (getBit(primes, i)) {
    //         result.push(2n * i + 1n);
    //     }
    // }
    //return result;
}

function getBit(array, index) {
    let block = Number(index >> 6n);
    let bit = Number(index & 63n);
    return (array[block] & (1n << BigInt(bit))) !== 0n;
}

function clearBit(array, index) {
    let block = Number(index >> 6n);
    let bit = Number(index & 63n);
    array[block] &= ~(1n << BigInt(bit));
}

