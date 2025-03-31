export {modExp as default, modExp2}

// Modular exponentiation (a^b mod m)
const modExp = (base, exp, mod) => {
    let result = 1n;
    base = base % mod;

    while (exp > 0n) {
        if ((exp & 1n) === 1n) {
            result = (result * base) % mod;
        }
        base = (base * base) % mod;
        exp = exp >> 1n;
    }

    return result;
};

// Modular exponentiation (2^b mod m)
const modExp2 = (exp, mod) => {
    if (exp < 1024n) return (1n << exp) % mod; // Fast bit-shifting for small exp

    let result = 1n;
    let base = 2n;

    while (exp > 0n) {
        if (exp & 1n) result = (result * base) % mod;
        base = (base * base) % mod;
        exp >>= 1n;
    }

    return result;
};