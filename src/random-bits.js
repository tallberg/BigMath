export {randomBits as default}

const randomBits = (bitLength) => {
    const byteLength = Math.ceil(bitLength / 8);
    const randomBytes = new Uint8Array(byteLength)
    crypto.getRandomValues(randomBytes);
    let randomBigInt = 0n;
    for (let i = 0; i < randomBytes.length; i++) {
        randomBigInt = (randomBigInt << 8n) | BigInt(randomBytes[i]);
    }
    // Ensure the number is of the exact bit length
    randomBigInt = randomBigInt & ((1n << BigInt(bitLength)) - 1n);
    return randomBigInt;
}
