import isPerfectSquare from "./is-perfect-square.js";
export {isPrimeLucas as default, isPrimeLucas2}

function isPrimeLucas(n) {
    if (n < 2n) return false;
    if (n === 2n) return true;
    if (n % 2n === 0n) return false;

    let d = 1n, sign = 1n;
    while (true) {
        let disc = d * d - 4n;
        if (disc > 0n && !isPerfectSquare(disc)) break;
        d += sign;
        sign = -sign - (sign > 0n ? 1n : 0n);
    }

    let p = 1n, q = (1n - d) >> 4n;
    let u = 1n, v = p, qk = q;
    let binary = n.toString(2).slice(1);
    for (let bit of binary) {
        u = (u * v) % n;
        v = (v * v - 2n * qk) % n;
        qk = (qk * qk) % n;
        if (bit === '1') {
            let temp = (p * u + v) % n;
            v = (d * u + p * v) % n;
            u = temp;
            qk = (qk * q) % n;
        }
    }
    return u === 0n;
}


function isPrimeLucas2(n) {
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    let d = 5;
    let sign = 1;
    while (true) {
        let g = gcd(n, d);
        if (g > 1) return false;
        if (jacobi(d, n) === -1) break;
        d += 2 * sign;
        sign = -sign;
    }

    let [u, v] = lucasSequence(n, 1, d, (n + 1) / 2);
    return u === 0;
}

function gcd(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

function jacobi(a, n) {
    if (a === 0) return 0;
    if (a === 1) return 1;

    let t = 1;
    if (a < 0) {
        a = -a;
        if (n % 4 === 3) t = -t;
    }

    while (a !== 0) {
        while (a % 2 === 0) {
            a /= 2;
            if (n % 8 === 3 || n % 8 === 5) t = -t;
        }
        [a, n] = [n, a];
        if (a % 4 === 3 && n % 4 === 3) t = -t;
        a %= n;
    }

    return t;
}

function lucasSequence(n, P, Q, k) {
    let U = 1;
    let V = P;
    let Qk = Q;
    let Qk2 = Q * Q;

    while (k !== 0) {
        if (k % 2 === 1) {
            [U, V] = [V, (P * V + Qk * U) % n];
        }
        [P, Qk2] = [(P * P - 2 * Qk) % n, Qk2 * Qk % n];
        [Qk, k] = [Qk2, Math.floor(k / 2)];
    }

    return [U, V];
}