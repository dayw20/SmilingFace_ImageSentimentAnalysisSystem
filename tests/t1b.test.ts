import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import { delay, sleep, dummyWikipediaResponse, sendTestRequest, twoNeighborResponse } from '../tests_util/helpers.js';

test.serial('[1b] should perform wikipedia requests of neighbors concurrently', async (t) => {
    // we expect that multiple wikipedia requests are running concurrently (after the initial one) within 100ms even though all requests take 2 seconds to complete
    let concurrentRequests = 0
    const mockConnections: Connections = {
      httpGet: function (url, timeout, callback) {
        concurrentRequests++
        if (url.includes('prop=links')) delay(() => { concurrentRequests--; callback(twoNeighborResponse) }, 1/*ms*/)
        else if (url.includes('page=Test')) delay(() => { concurrentRequests--; callback(dummyWikipediaResponse()) }, 1/*ms*/)
        else delay(() => { concurrentRequests--; callback(dummyWikipediaResponse()) }, 1000/*ms*/)
      },
      detectFaces: (imageUrl, timeout, callback) => delay(() => callback([]), 10/*ms*/),
      syncHttpGet: function (url: string, timeout: number): string { throw new Error('Synchronous functions should no longer be used'); }, syncDetectFaces: function (imageUrl: string, timeout: number): GoogleFaceAnnotations { throw new Error('Synchronous functions should no longer be used'); }
    }
  
    const app = smilingFacesBackend(mockConnections)
  
    const r1 = sendTestRequest(app, true)
    await sleep(100)
  
    t.truthy(concurrentRequests >= 2)
    // t.is((await r1).status, 202)
    t.truthy((await r1).status <= 202 && (await r1).status >= 200)
  })
