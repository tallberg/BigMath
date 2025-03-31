import randomBits from './random-bits.js'
import isPrime from './is-prime.js'
export {randomPrime as default}

const randomPrime = (bitLength) => {
    let candidate;
    do {
        candidate = randomBits(bitLength) | 1n; // random odd number        
    } while (!isPrime(candidate));
    return candidate;
}