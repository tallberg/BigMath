import sqrt from "./sqrt";
import isPerfectSquare from "./is-perfect-square";
export {factorFermat as default}

/**
 * Uses Fermat's factorization method.
 * Best suited for numbers that are a product of two close factors.
 * 
 * @param {bigint} n - The number to factorize.
 * @returns {bigint[]} An array of prime factors of n.
 */
function factorFermat(n) {
    if (n % 2n === 0n) return [2n, ...factorFermat(n / 2n)];
    if (n === 1n) return [];
    
    let a = sqrt(n) + 1n;
    let b2 = a * a - n;
    while (!isPerfectSquare(b2)) {
        a++;
        b2 = a * a - n;
    }
    
    let b = sqrt(b2);
    let factor1 = a - b;
    let factor2 = a + b;
    
    if (factor1 === 1n || factor2 === n) return [n];
    
    return [...factorFermat(factor1), ...factorFermat(factor2)];
}