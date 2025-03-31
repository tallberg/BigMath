export {lenstraECM as default}

function gcd(a, b) {
    while (b !== 0n) {
        [a, b] = [b, a % b];
    }
    return a;
}

function modInverse(a, m) {
    let [m0, x0, x1] = [m, 0n, 1n];
    while (a > 1n) {
        let q = a / m;
        [m, a] = [a % m, m];
        [x0, x1] = [x1 - q * x0, x0];
    }
    return x1 < 0n ? x1 + m0 : x1;
}

function ellipticAdd(P, Q, A, n) {
    if (P === null) return Q;
    if (Q === null) return P;
    let [x1, y1] = P;
    let [x2, y2] = Q;
    if (x1 === x2 && y1 === -y2) return null;

    let lambda;
    if (x1 === x2 && y1 === y2) {
        let num = (3n * x1 ** 2n + A) % n;
        let den = modInverse(2n * y1, n);
        lambda = (num * den) % n;
    } else {
        let num = (y2 - y1) % n;
        let den = modInverse((x2 - x1) % n, n);
        lambda = (num * den) % n;
    }

    let x3 = (lambda ** 2n - x1 - x2) % n;
    let y3 = (lambda * (x1 - x3) - y1) % n;
    return [x3, y3];
}

function scalarMultiply(k, P, A, n) {
    let Q = null;
    let R = P;
    while (k > 0n) {
        if (k % 2n === 1n) {
            Q = ellipticAdd(Q, R, A, n);
        }
        R = ellipticAdd(R, R, A, n);
        k >>= 1n;
    }
    return Q;
}

function lenstraECM(n) {
    let x = 2n, y = 2n, A = 1n;
    let B = (y ** 2n - x ** 3n - A * x) % n;
    let P = [x, y];
    let k = 2n;

    while (k < 10000n) {
        let newP = scalarMultiply(k, P, A, n);
        if (newP === null) {
            let d = gcd(P[1], n);
            if (d > 1n && d < n) return d;
            return null;
        }
        P = newP;
        k *= 2n;
    }
    return null;
}