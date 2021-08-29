import { ServerResponse } from 'http'

export class ResponseOptions {
  0: string = ''
  1: {
    headers: Headers
    status: number
    statusText: string
  } = {
    headers: new Headers(),
    status: 200,
    statusText: 'OK'
  }
}

export function getStubServerResponse (res: ResponseOptions): ServerResponse {
  /* eslint-disable @typescript-eslint/consistent-type-assertions */
  return {
    headersSent: false,
    setHeader: (name: string, value: string | number | readonly string[]) => {
      res[1].headers.set(name, value.toString())
    },
    end: (chunk: any) => {
      res[0] = chunk.toString()
    }
  } as ServerResponse
}
