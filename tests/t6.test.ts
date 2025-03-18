import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import { delay, sleep, sendTestRequest, dummyWikipediaResponse, tenNeighborResponse } from '../tests_util/helpers.js';

test.serial('[6] should limit concurrent requests to wikipedia to 5 (tested with getting neighbors for one request)', async (t) => {
    let concurrentRequests = 0
    const mockConnections: Connections = {
      httpGet: function (url, timeout, callback) {
        concurrentRequests++
        if (url.includes('prop=links')) delay(() => { concurrentRequests--; callback(tenNeighborResponse) }, 1/*ms*/)
        else if (url.includes('page=Test')) delay(() => { concurrentRequests--; callback(dummyWikipediaResponse()) }, 1/*ms*/)
        else delay(() => { concurrentRequests--; callback(dummyWikipediaResponse()) }, 1000/*ms*/)
      },
      detectFaces: (imageUrl, timeout, callback) => delay(() => callback([]), 10/*ms*/),
      syncHttpGet: function (url: string, timeout: number): string { throw new Error('Synchronous functions should no longer be used'); }, syncDetectFaces: function (imageUrl: string, timeout: number): GoogleFaceAnnotations { throw new Error('Synchronous functions should no longer be used'); }
    }
    const app = smilingFacesBackend(mockConnections)
    const p1 = sendTestRequest(app, true)
    await sleep(100)
    t.is(concurrentRequests, 5)
    // t.is((await p1).status, 202)
    t.truthy((await p1).status <= 202 && (await p1).status >= 200)
  })