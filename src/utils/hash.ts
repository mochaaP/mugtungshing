export async function hash (str: string): Promise<string> {
  function str2ab (str: string): ArrayBuffer {
    var array = new Uint8Array(str.length)
    for (var i = 0; i < str.length; i++) {
      array[i] = str.charCodeAt(i)
    }
    return array.buffer
  }
  return new TextDecoder('utf8')
    .decode(
      new Uint8Array(
        await crypto.subtle.digest(
          'SHA-512',
          str2ab(str)
        )
      )
    )
}
