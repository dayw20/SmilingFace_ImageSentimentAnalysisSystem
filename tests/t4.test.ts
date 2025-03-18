import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import { delay, sleep, sendStatusRequest, sendTestRequest, dummyWikipediaResponse } from '../tests_util/helpers.js';

test.serial('[4] should return an analysis', async (t) => {
    const mockConnections: Connections = {
      httpGet: function (url: string, timeout: number, callback: (result?: string | undefined, error?: Error | undefined) => void): void {
        delay(() => callback(dummyWikipediaResponse(2)), 1/*ms*/)
      },
      detectFaces: function (imageUrl: string, timeout: number, callback: (result?: GoogleFaceAnnotations, error?: Error | undefined) => void): void {
        delay(() => callback([]), 1/*ms*/)
      },
      syncHttpGet: function (url: string, timeout: number): string { throw new Error('Synchronous functions should no longer be used'); }, syncDetectFaces: function (imageUrl: string, timeout: number): GoogleFaceAnnotations { throw new Error('Synchronous functions should no longer be used'); }
    }
  
  
    const app = smilingFacesBackend(mockConnections)
  
    const response = await sendTestRequest(app)
    // t.is(response.status, 202)
    t.truthy(response.status <= 202 && response.status >= 200)
    const r = JSON.parse(response.text)
    t.truthy(r.hasOwnProperty('id'))
    const jobId = r.id
  
    // either the initial job or the follow up status request should return the result
    if (!r.done) {
      // wait 500 mseconds for the job to finish
      await sleep(500)
  
      const response2 = await sendStatusRequest(app, jobId)
      t.is(response2.status, 200)
      const r2 = JSON.parse(response2.text)
      t.truthy(r2.hasOwnProperty('id'))
      t.is(r2.id, jobId)
      t.truthy(r2.done)
      t.falsy(typeof r2.data === "undefined")
    } else {
      t.falsy(typeof r.data === "undefined")
    }
  })
