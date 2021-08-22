export function prefixPath (prefix = '') {
  return function path (path: string) {
    return `${prefix}${path}`
  }
}
