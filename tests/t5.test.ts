import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import request from 'supertest';
import { spy } from 'sinon';
import { delay, sleep, sendTestRequest, dummyWikipediaResponse } from '../tests_util/helpers.js';

test.serial('[5] should return an analysis correctly', async (t) => {
    const mockConnections: Connections = {
      httpGet: function (url: string, timeout: number, callback: (result?: string | undefined, error?: Error | undefined) => void): void {
        delay(() => callback(dummyWikipediaResponse(2)), 1/*ms*/)
      },
      detectFaces: function (imageUrl: string, timeout: number, callback: (result?: GoogleFaceAnnotations, error?: Error | undefined) => void): void {
        delay(() => callback([]), 1/*ms*/)
      },
      syncHttpGet: function (url: string, timeout: number): string { throw new Error('Synchronous functions should no longer be used'); }, syncDetectFaces: function (imageUrl: string, timeout: number): GoogleFaceAnnotations { throw new Error('Synchronous functions should no longer be used'); }
    }
  
    const connectionSpy = spy(mockConnections)
    const app = smilingFacesBackend(mockConnections)
  
    const response = await sendTestRequest(app)
    // t.is(response.status, 202)
    t.truthy(response.status <= 202 && response.status >= 200)
    let r = JSON.parse(response.text)
    t.truthy(r.hasOwnProperty('id'))
    const jobId = r.id
  
    if (!r.done) {
      // wait 500 mseconds for the job to finish
      await sleep(500)
  
      const response2 = await (await request(app).get('/job/' + jobId))
      t.is(response2.status,200)
      const r2 = JSON.parse(response2.text)
      t.truthy(r2.hasOwnProperty('id'))
      t.is(r2.id, jobId)
      r = r2
    }
    t.truthy(r.done)
    t.falsy(typeof r.data === "undefined")
    t.deepEqual(r.data, {
      Test: { 'http://test.com/imgurl0': [], 'http://test.com/imgurl1': [] }
    })
})