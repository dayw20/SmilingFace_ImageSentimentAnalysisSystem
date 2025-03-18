import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import { spy } from 'sinon';
import { delay, sleep, sendTestRequest, dummyWikipediaResponse, sendStatusRequest } from '../tests_util/helpers.js';

test.serial('[9] should limit concurrent requests by queueing remaining requests', async (t) => {
    const mockConnections: Connections = {
      httpGet: (url, timeout, callback) => delay(() => callback(dummyWikipediaResponse(6)), 1/*ms*/),
      detectFaces: (imageUrl, timeout, callback) => delay(() => callback([]), 500/*ms*/),
      syncHttpGet: function (url: string, timeout: number): string { throw new Error('Synchronous functions should no longer be used'); }, syncDetectFaces: function (imageUrl: string, timeout: number): GoogleFaceAnnotations { throw new Error('Synchronous functions should no longer be used'); }
    }
    const connectionSpy = spy(mockConnections)
    const app = smilingFacesBackend(mockConnections)
    const p1 = sendTestRequest(app)
  
    await sleep(100)
    //assume only 5 requests at this point; 6th request should only happen later
    t.is(connectionSpy.detectFaces.callCount, 5)
    const response1 = await p1
    // t.is(response1.status, 202)
    t.truthy((await response1).status <= 202 && (await response1).status >= 200)
    let r = JSON.parse(response1.text)
    t.truthy(r.hasOwnProperty('id'))
    const jobId = r.id
  
    // wait 2 seconds for the job to finish, including the 6th request
    if (!r.done) {
      await sleep(2000)
  
      const response2 = await sendStatusRequest(app, jobId)
      t.is(response2.status, 200)
      const r2 = JSON.parse(response2.text)
      console.log(r2)
      t.truthy(r2.hasOwnProperty('id'))
      t.is(r2.id, jobId)
      t.truthy(r2.done)
      r = r2
    }
    t.falsy(typeof r.data["Test"]["http://test.com/imgurl0"] === "undefined")
    t.falsy(typeof r.data["Test"]["http://test.com/imgurl1"] === "undefined")
    t.falsy(typeof r.data["Test"]["http://test.com/imgurl2"] === "undefined")
    t.falsy(typeof r.data["Test"]["http://test.com/imgurl3"] === "undefined")
    t.falsy(typeof r.data["Test"]["http://test.com/imgurl4"] === "undefined")
    t.falsy(typeof r.data["Test"]["http://test.com/imgurl5"] === "undefined")
    t.truthy(typeof r.data["Test"]["http://test.com/imgurl6"] === "undefined")
 })  
  