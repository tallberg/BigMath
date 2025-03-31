export {gcdStein as default, gcdEuclid}


function gcdEuclid(a, b) {
    while (b !== 0n) {
        [a, b] = [b, a % b];
    }
    return a;
}

function gcdStein(a, b) {
    if (b === 0n) return a;
    if (a === 0n) return b;

    let shift = 0n;
    while (((a | b) & 1n) === 0n) { 
        a >>= 1n;
        b >>= 1n;
        shift++;
    }
    
    while ((a & 1n) === 0n) a >>= 1n;
    
    do {
        while ((b & 1n) === 0n) b >>= 1n;
        if (a > b) [a, b] = [b, a];  
        b -= a;  
    } while (b !== 0n);

    return a << shift;
}