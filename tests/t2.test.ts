import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import { spy } from 'sinon';
import { delay, sleep, dummyWikipediaResponse, sendTestRequest } from '../tests_util/helpers.js';

test.serial('[2] should perform google requests concurrently', async (t) => {
    // we expect that all 4 google requests are started within 100ms even though they take 2000ms to complete
    const mockConnections: Connections = {
      httpGet: (url, timeout, callback) => delay(() => callback(dummyWikipediaResponse(4)), 1/*ms*/),
      detectFaces: (imageUrl, timeout, callback) => delay(() => callback([]), 2000/*ms*/),
      syncHttpGet: function (url: string, timeout: number): string { throw new Error('Synchronous functions should no longer be used'); }, syncDetectFaces: function (imageUrl: string, timeout: number): GoogleFaceAnnotations { throw new Error('Synchronous functions should no longer be used'); }
    }
  
    const connectionSpy = spy(mockConnections)
    const app = smilingFacesBackend(mockConnections)
  
    const r1 = sendTestRequest(app)
    await sleep(100)
  
    t.is(connectionSpy.detectFaces.callCount, 4)
    // t.is((await r1).status, 202)
    t.truthy((await r1).status <= 202 && (await r1).status >= 200)
  })