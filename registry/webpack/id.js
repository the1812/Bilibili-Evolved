/** Runs both in Node.js and browser (without path module).
 * Paths are case-sensitive.
 */
module.exports.getId = (root, entry) => {
  const relative = entry.replace(root, '').replace(/\\/g, '/')
  return relative.replace(/\/[^\/]+$/, '')
}
