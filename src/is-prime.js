import { isPrimeMillerRabinDeterministic } from "./is-prime-miller-rabin.js";
import isPrimeSolovayStrassen from "./is-prime-solovay-strassen.js";
export {isPrime as default}

const deterministicLimit = 2n**64n;
const isPrime = (n) => {
    if (n < deterministicLimit) {
        return isPrimeMillerRabinDeterministic(n)
    } else {
        return isPrimeSolovayStrassen(n)
    }
}