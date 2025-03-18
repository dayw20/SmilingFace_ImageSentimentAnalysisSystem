import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import { spy } from 'sinon';
import { delay, sleep, dummyWikipediaResponse, sendTestRequest } from '../tests_util/helpers.js';

test.serial('[1a] should perform wikipedia requests of multiple jobs concurrently', async (t) => {
    //we simply test that two requests are running, even if the first one takes 2 seconds to finish
    let concurrentRequests = 0
    const mockConnections: Connections = {
      httpGet: (url, timeout, callback) => {
        concurrentRequests++
        delay(() => { concurrentRequests--; callback(dummyWikipediaResponse()) }, 2000/*ms*/)
      },
      detectFaces: (imageUrl, timeout, callback) => {
        delay(() => callback([]), 10/*ms*/)
      },
      syncHttpGet: function (url: string, timeout: number): string { throw new Error('Synchronous functions should no longer be used'); }, syncDetectFaces: function (imageUrl: string, timeout: number): GoogleFaceAnnotations { throw new Error('Synchronous functions should no longer be used'); }
    }
  
    const connectionSpy = spy(mockConnections)
    const app = smilingFacesBackend(mockConnections)
  
    const p1 = sendTestRequest(app, false)
    await sleep(100)
    const p2 = sendTestRequest(app, false)
    await sleep(100)
  
    t.is(connectionSpy.httpGet.callCount, 2)
    t.is(concurrentRequests, 2)
    await Promise.all([p1, p2])
    // t.is((await p1).status, 202)
    // t.is((await p2).status, 202)
    t.truthy((await p1).status <= 202 && (await p1).status >= 200)
    t.truthy((await p2).status <= 202 && (await p2).status >= 200)
  })
