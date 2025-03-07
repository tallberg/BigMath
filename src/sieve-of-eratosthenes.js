import sqrt from './sqrt.js'
export {sieveOfEratosthenes as default, sieveOfEratosthenes2}

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

//using bitmap
function sieveOfEratosthenes3(limit) {
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

