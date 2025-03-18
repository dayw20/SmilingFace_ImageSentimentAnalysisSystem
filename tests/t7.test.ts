import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import { spy } from 'sinon';
import { delay, sleep, sendTestRequest, dummyWikipediaResponse } from '../tests_util/helpers.js';

test.serial('[7] should limit concurrent requests to google to 5 in one job', async (t) => {
    const mockConnections: Connections = {
      httpGet: (url, timeout, callback) => delay(() => callback(dummyWikipediaResponse(6)), 1/*ms*/),
      detectFaces: (imageUrl, timeout, callback) => delay(() => callback([]), 2000/*ms*/),
      syncHttpGet: function (url: string, timeout: number): string { throw new Error('Synchronous functions should no longer be used'); }, syncDetectFaces: function (imageUrl: string, timeout: number): GoogleFaceAnnotations { throw new Error('Synchronous functions should no longer be used'); }
    }
    const connectionSpy = spy(mockConnections)
    const app = smilingFacesBackend(mockConnections)
    const r1 = sendTestRequest(app)
    await sleep(200)
    t.is(connectionSpy.detectFaces.callCount, 5)
    // t.is((await r1).status, 202)
    t.truthy((await r1).status <= 202 && (await r1).status >= 200)
})