import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import { delay, sleep, sendTestRequest, dummyWikipediaResponse, tenNeighborResponse } from '../tests_util/helpers.js';

test.serial('[12b] should start analysis of images before collecting all pictures for all neighboring sites', async (t) => {
    let faceRequestCount: number = 0
    let wikiRequestCount: number = 0
    const mockConnections: Connections = {
      httpGet: function (url, timeout, callback) {
        if (url.includes('prop=links')) delay(() => callback(tenNeighborResponse), 1/*ms*/)
        else {
          const d = wikiRequestCount < 2 ? 1 : 1000
          wikiRequestCount++
          delay(() => callback(dummyWikipediaResponse(1)), d/*ms*/)
        }
      },
      detectFaces: (imageUrl, timeout, callback) => delay(() => { faceRequestCount++; callback([]) }, 1/*ms*/),
      syncHttpGet: function (url: string, timeout: number): string { throw new Error('Synchronous functions should no longer be used'); }, syncDetectFaces: function (imageUrl: string, timeout: number): GoogleFaceAnnotations { throw new Error('Synchronous functions should no longer be used'); }
    }
    const app = smilingFacesBackend(mockConnections)
    const r1 = sendTestRequest(app, true)
    await sleep(500)
  
    t.is(faceRequestCount, 2)
    // t.is((await r1).status, 202)
    t.truthy((await r1).status <= 202 && (await r1).status >= 200)
  })
