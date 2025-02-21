import isPrimeSolovayStrassen from "./is-prime-solovay-strassen.js";
export {isPrime as default}

const isPrime = (n) => {
    return isPrimeSolovayStrassen(n);
}