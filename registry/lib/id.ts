/**
 * Runs both in Node.js and browser (without path module).
 * Paths are case-sensitive.
 */

/**
 * Generate id from relative path and remove filename
 * @example getId('folder1/', 'folder1/folder2/index.ts') -> 'folder2'
 */
export const getId = (root: string, entry: string) => {
  const relative = entry.replace(root, '').replace(/\\/g, '/')
  return relative.replace(/\/[^\/]+$/, '')
}

/**
 * Reverse method for `getId`
 * @example getId('folder1/', 'folder2') -> 'folder1/folder2/index.ts'
 */
export const fromId = (root: string, id: string, filename = 'index.ts') =>
  `${root.replace(/\\/g, '/')}${id.replace(/\\/g, '/')}/${filename}`
