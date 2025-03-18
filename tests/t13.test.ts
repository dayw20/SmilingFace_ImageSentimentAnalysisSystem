import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import { delay, sendTestRequestAndGetFinishedJob, dummyWikipediaResponse } from '../tests_util/helpers.js';

test.serial('[13] should retry on failed wikipedia connections', async (t) => {
    let requestNr: number = 0
    const mockConnections: Connections = {
      httpGet: function (url: string, timeout: number, callback: (result?: string | undefined, error?: Error | undefined) => void): void {
        console.log(`mock httpGet(${url}), ${requestNr}}`)
        if (requestNr++ < 2)
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
  
    const r2 = await sendTestRequestAndGetFinishedJob(app, 2500, t)
    t.truthy(r2.done)
    t.truthy(typeof r2.error === "undefined")
  })