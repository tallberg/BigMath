import isPrimeTrial from "./is-prime-trial.js";
import isPrimeLucas from "./is-prime-lucas.js"
import { isPrimeMillerRabinBase2 } from "./is-prime-miller-rabin.js";
export { isPrimeBailliePsw as default }

const isPrimeBailliePsw = (n) => {
    if (n < 10000000n) return isPrimeTrial(n);
    if (n % 2n === 0n || n % 3n === 0n || n % 5n === 0n || n % 7n === 0n 
        || n % 11n === 0n || n % 13n === 0n || n % 17n === 0n || n % 19n === 0n 
        || n % 23n === 0n || n % 27n === 0n || n % 29n === 0n || n % 31n === 0n 
        || n % 37n === 0n || n % 41n === 0n || n % 43n === 0n || n % 47n === 0n 
        || n % 53n === 0n || n % 59n === 0n || n % 61n === 0n || n % 67n === 0n || n % 71n === 0n 
        || n % 73n === 0n || n % 79n === 0n || n % 83n === 0n || n % 89n === 0n || n % 97n === 0n 
        || n % 101n === 0n || n % 103n === 0n || n % 107n === 0n || n % 109n === 0n || n % 113n === 0n 
        || n % 127n === 0n || n % 131n === 0n || n % 137n === 0n || n % 139n === 0n || n % 149n === 0n 
        || n % 151n === 0n || n % 157n === 0n || n % 163n === 0n || n % 167n === 0n || n % 173n === 0n 
        || n % 179n === 0n || n % 181n === 0n || n % 191n === 0n || n % 193n === 0n || n % 197n === 0n 
        || n % 199n === 0n) return false; 
    
    if (isPrimeMillerRabinBase2(n) === false) return false;
    return isPrimeLucas(n);    
}