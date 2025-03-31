function gcd(a, b) {
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function modExp(base, exp, mod) {
    let result = 1;
    base = base % mod;
    while (exp > 0) {
        if (exp % 2 === 1) {
            result = (result * base) % mod;
        }
        exp = Math.floor(exp / 2);
        base = (base * base) % mod;
    }
    return result;
}

function ecm(n, B) {
    if (n <= 1) return [];
    if (n % 2 === 0) return [2, ...ecm(n / 2, B)];

    const B1 = B;
    const B2 = B * 10;

    for (let i = 0; i < 10; i++) {
        const x = Math.floor(Math.random() * (n - 1)) + 1;
        const y = x;
        const c = Math.floor(Math.random() * (n - 1)) + 1;

        let factor = 1;

        for (let q = 2; q <= B1; q++) {
            if (n % q === 0) return [q, ...ecm(n / q, B)];

            let m = Math.floor(Math.log(B1) / Math.log(q));
            let x = y;

            for (let j = 0; j < m; j++) {
                x = (x * x + c) % n;
            }

            factor = gcd(y - x, n);
            if (factor > 1 && factor < n) return [factor, ...ecm(n / factor, B)];
        }

        for (let q = B1 + 1; q <= B2; q += 2) {
            if (n % q === 0) return [q, ...ecm(n / q, B)];

            let m = Math.floor(Math.log(B2 / q) / Math.log(q));
            let x = y;

            for (let j = 0; j < m; j++) {
                x = (x * x + c) % n;
            }

            factor = gcd(y - x, n);
            if (factor > 1 && factor < n) return [factor, ...ecm(n / factor, B)];
        }

        if (factor === n) continue;
        if (factor > 1) return [factor, ...ecm(n / factor, B)];
    }

    return [n];
}

function getAllFactors(n) {
    if (n <= 1) return [];
    const factors = new Set();
    const primeFactors = ecm(n, 1000); // You can adjust the B value as needed

    function getFactorsRec(arr) {
        if (arr.length === 0) return [1];
        const smallerFactors = getFactorsRec(arr.slice(1));
        const newFactors = [];
        for (const factor of smallerFactors) {
            newFactors.push(factor * arr[0]);
        }
        return [...smallerFactors, ...newFactors];
    }

    const allFactors = getFactorsRec(primeFactors);
    for (const factor of allFactors) {
        factors.add(factor);
    }
    return Array.from(factors).sort((a, b) => a - b);
}
