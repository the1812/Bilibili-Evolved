/**
 * Runs both in Node.js and browser (without path module).
 * Paths are case-sensitive.
 */
module.exports = {
  /**
   * Generate id from relative path and remove filename
   * @example getId('folder1/', 'folder1/folder2/index.ts') -> 'folder2'
   */
  getId: (root, entry) => {
    const relative = entry.replace(root, '').replace(/\\/g, '/')
    return relative.replace(/\/[^\/]+$/, '')
  },
  /**
   * Reverse method for `getId`
   * @example getId('folder1/', 'folder2') -> 'folder1/folder2/index.ts'
   */
  fromId: (root, id, filename = 'index.ts') => {
    return `${root.replace(/\\/g, '/')}${id.replace(/\\/g, '/')}/${filename}`
  }
}
