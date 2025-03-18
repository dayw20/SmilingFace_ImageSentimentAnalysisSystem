import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import { delay, sendTestRequestAndGetFinishedJob, dummyWikipediaResponse } from '../tests_util/helpers.js';

test.serial('[16] should recover from errors', async (t) => {
    let failConnection = true
    const mockConnections: Connections = {
      httpGet: function (url: string, timeout: number, callback: (result?: string | undefined, error?: Error | undefined) => void): void {
        if (failConnection)
          delay(() => callback(undefined, new Error("Test error")), 2)
        else
          delay(() => callback(dummyWikipediaResponse()), 2/*ms*/)
      },
      detectFaces: function (imageUrl: string, timeout: number, callback: (result?: GoogleFaceAnnotations, error?: Error | undefined) => void): void {
        delay(() => callback([]), 1/*ms*/)
      },
      syncHttpGet: function (url: string, timeout: number): string { throw new Error('Synchronous functions should no longer be used'); }, syncDetectFaces: function (imageUrl: string, timeout: number): GoogleFaceAnnotations { throw new Error('Synchronous functions should no longer be used'); }
    }
  
    const app = smilingFacesBackend(mockConnections)
  
    failConnection = true
  
    const rs = await Promise.all([
      sendTestRequestAndGetFinishedJob(app, 2500, t),
      sendTestRequestAndGetFinishedJob(app, 2500, t),
      sendTestRequestAndGetFinishedJob(app, 2500, t),
      sendTestRequestAndGetFinishedJob(app, 2500, t),
      sendTestRequestAndGetFinishedJob(app, 2500, t),
    ])
    rs.forEach(r => t.falsy(typeof r.error === "undefined"))
  
    //after 5 failed jobs, nr 6 should still work when connections are restored
    failConnection = false
  
    const r2 = await sendTestRequestAndGetFinishedJob(app, 500, t)
    t.truthy(typeof r2.error === "undefined")
    console.log(r2)
    t.falsy(typeof r2.data["Test"]["http://test.com/imgurl0"] === "undefined")
})