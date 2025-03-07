export {intSqrtBinarySearch, intSqrtBitwise, intSqrtNewton as default}

/**
 * Computes the integer square root of a BigInt using binary search.
 * Complexity: O(log n)
 * Always returns floor(sqrt(n)).
 * @param {bigint} n - The number to find the square root of.
 * @returns {bigint} - The largest integer x such that x² ≤ n.
 */
const intSqrtBinarySearch = (n) => {
    if (n < 0n) throw new Error("Square root of negative number is not defined");
    if (n < 2n) return n;
    
    let left = 1n, right = n, mid;
    while (left <= right) {
      mid = (left + right) / 2n;
      let square = mid * mid;
      if (square === n) return mid;
      if (square < n) left = mid + 1n;
      else right = mid - 1n;
    }
    return right;
  };
  
  /**
   * Computes the integer square root of a BigInt using Newton's method.
   * Complexity: O(log n) with rapid convergence.
   * Always returns floor(sqrt(n)).
   * @param {bigint} n - The number to find the square root of.
   * @returns {bigint} - The largest integer x such that x² ≤ n.
   */
  const intSqrtNewton = (n) => {
    if (n < 0n) throw new Error("Square root of negative number is not defined");
    if (n < 2n) return n;
    
    let x = n, y = (x + 1n) / 2n;
    while (y < x) {
      x = y;
      y = (x + n / x) / 2n;
    }
    return x;
  };
  
  /**
   * Computes the integer square root of a BigInt using a bitwise approach.
   * Complexity: O(log n) with direct bit manipulation.
   * Always returns floor(sqrt(n)).
   * @param {bigint} n - The number to find the square root of.
   * @returns {bigint} - The largest integer x such that x² ≤ n.
   */
  const intSqrtBitwise = (n) => {
    if (n < 0n) throw new Error("Square root of negative number is not defined");
    if (n < 2n) return n;
  
    let x = 0n, bit = 1n << (BigInt(n.toString(2).length) - 1n);
    while (bit > n) bit >>= 2n;
  
    while (bit) {
      let temp = x + bit;
      x >>= 1n;
      if (n >= temp) {
        n -= temp;
        x += bit;
      }
      bit >>= 2n;
    }
    return x;
  };