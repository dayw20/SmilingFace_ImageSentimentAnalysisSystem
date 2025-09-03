import sp from 'synchronized-promise'
import { detectFacesObfuscated, httpGetObfuscated } from './obfuscated.js'
import * as http from 'http'
import * as https from 'https'
import { Connections, GoogleFaceAnnotations } from './connections'

export class DefaultConnections implements Connections {
  httpGet (url: string, timeout: number, callback: (result?: string, error?: Error) => void): void {
    // Determine if it's an HTTP or HTTPS URL
    const client = url.startsWith('https') ? https : http

    // Make the HTTP request
    const request = client.get(url, (response: http.IncomingMessage) => {
      if (response.statusCode !== undefined && (response.statusCode < 200 || response.statusCode >= 300)) {
        callback(undefined, new Error(`Request failed with status code ${response.statusCode}`))
        return
      }

      let data = ''

      // Collect the data as it comes in
      response.on('data', (chunk: string) => {
        data += chunk
      })

      // Resolve the Promise with the data when the request is complete
      response.on('end', () => {
        callback(data)
      })
    })
    request.setTimeout(timeout, () => request.destroy(new Error(`Request timed out after ${timeout} ms`)))

    // Handle errors
    request.on('error', (error: Error) => {
      callback(undefined, error)
    })
  }

  detectFaces (imageUrl: string, timeout: number, callback: (result?: GoogleFaceAnnotations, error?: Error) => void): void {
    detectFacesObfuscated(imageUrl, timeout).then(callback).catch((e: Error) => callback(undefined, e))
  }

  syncHttpGet (url: string, timeout: number): string {
    // timeout is ignored in the synchronous version
    // the actual implementation is done in the obfuscated file and should not matter
    return httpGetObfuscated(url, timeout) as string
  }

  syncDetectFaces (imageUrl: string, timeout: number): GoogleFaceAnnotations {
    // timeout is ignored in the synchronous version
    // the actual implementation is done in the obfuscated file and should not matter
    return sp(detectFacesObfuscated)(imageUrl, timeout) as GoogleFaceAnnotations
  }
}
