import isPrimeBailliePsw from "./is-prime-baillie-psw.js";
export {isPrime as default}

/** Use a combination of trial division, Miller-Rabin and Lucas tests to get a deterministic result for numbers up to 2^64, and higly probable for numbers beyond */
const isPrime = (n) => {
    return isPrimeBailliePsw(n)
}