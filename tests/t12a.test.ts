import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import { delay, sleep, sendTestRequest, dummyWikipediaResponse, twoNeighborResponse } from '../tests_util/helpers.js';

test.serial('[12a] should start analysis of images before collecting all pictures for any neighboring site', async (t) => {
    let concurrentRequests: number = 0
    let faceRequestCount: number = 0
    let isFirst: boolean = true
    const mockConnections: Connections = {
      httpGet: function (url, timeout, callback) {
        concurrentRequests++
        if (url.includes('prop=links')) delay(() => { concurrentRequests--; callback(twoNeighborResponse) }, 1/*ms*/)
        else {
          const d = isFirst ? 1 : 1000
          isFirst = false
          delay(() => { concurrentRequests--; callback(dummyWikipediaResponse(10)) }, d/*ms*/)
        }
      },
      detectFaces: (imageUrl, timeout, callback) => delay(() => { faceRequestCount++; callback([]) }, 1/*ms*/),
      syncHttpGet: function (url: string, timeout: number): string { throw new Error('Synchronous functions should no longer be used'); }, syncDetectFaces: function (imageUrl: string, timeout: number): GoogleFaceAnnotations { throw new Error('Synchronous functions should no longer be used'); }
    }
    const app = smilingFacesBackend(mockConnections)
    const r1 = sendTestRequest(app, true)
    await sleep(500)
  
    t.truthy(faceRequestCount > 3)
    // t.is((await r1).status, 202)
    t.truthy((await r1).status <= 202 && (await r1).status >= 200)
})