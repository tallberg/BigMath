import pollard from './factor-pollard-brent.js'
import isPrime from './is-prime.js'

export { factor as default }

const factor = (n) => {
    let factors = [];
    while (n > 1) {
        let factor = pollard(n);
        factors.push(factor);
        n = n / factor;
        if (n !== 1 && isPrime(n)) {
            factors.push(n);
            break;
        }
    }
    return factors.sort((a, b) => a - b);
}