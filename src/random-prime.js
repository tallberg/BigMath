import randomBits from './random-bits.js'
import isPrime from './is-prime.js'
export {randomPrime as default}

const randomPrime = (bitLength) => {
    let candidate;
    console.log('random prime', bitLength);
    do {
        candidate = randomBits(bitLength) | 1n; // random odd number
        console.log('candidate: ', candidate);
    } while (!isPrime(candidate));
    return candidate;
}