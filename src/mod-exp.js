export {modExp as default}

// Modular exponentiation (a^b mod m)
const modExp = (base, exp, mod) => {
    let result = 1n;
    base = base % mod;

    while (exp > 0n) {
        if (exp % 2n === 1n) {
            result = (result * base) % mod;
        }
        base = (base * base) % mod;
        exp /= 2n;
    }

    return result;
};