/**
 * Safely format any value to fixed decimals, defaulting to 0 if invalid.
 * @param {any} val 
 * @param {number} dec 
 * @returns {string}
 */
export function safeToFixed(val, dec = 2) {
  const n = (typeof val === 'number' && !isNaN(val)) ? val : 0;
  return n.toFixed(dec);
}