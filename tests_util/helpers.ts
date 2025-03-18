import request from 'supertest';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import { Express } from 'express';
import { ExecutionContext } from 'ava';

const tenNeighborResponse: string = '{"continue":{"plcontinue":"4770341|0|2022_Charlotte_FC_season","continue":"||"},"query":{"normalized":[{"from":"David_Tepper","to":"David Tepper"}],"pages":{"4770341":{"pageid":4770341,"ns":0,"title":"David Tepper","links":[{"ns":0,"title":"1987 stock market crash"},{"ns":0,"title":"1995 NFL expansion draft"},{"ns":0,"title":"1996 Carolina Panthers season"},{"ns":0,"title":"2003 Carolina Panthers season"},{"ns":0,"title":"2005 Carolina Panthers season"},{"ns":0,"title":"2008 Carolina Panthers season"},{"ns":0,"title":"2013 Carolina Panthers season"},{"ns":0,"title":"2014 Carolina Panthers season"},{"ns":0,"title":"2015 Carolina Panthers season"},{"ns":0,"title":"2017 Carolina Panthers season"}]}}}}'
const twoNeighborResponse: string = '{"continue":{"plcontinue":"4770341|0|2022_Charlotte_FC_season","continue":"||"},"query":{"normalized":[{"from":"David_Tepper","to":"David Tepper"}],"pages":{"4770341":{"pageid":4770341,"ns":0,"title":"David Tepper","links":[{"ns":0,"title":"1987 stock market crash"},{"ns":0,"title":"1995 NFL expansion draft"}]}}}}'

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function dummyWikipediaResponse(nrImages: number = 1): string {
  let resp = ""
  for (let i = 0; i < nrImages; i++) {
    resp = resp + `<img src=\\\"http://test.com/imgurl${i}\\\" width=\\\"200\\\"/>`
  }
  console.log(resp)
  return '{ "parse": { "title": "Test", "pageid": 1, "text": "'+resp + '" } }'
}

function delay(f: (args: void) => void, ms: number) {
  setTimeout(f, ms)
}

async function sendTestRequest(app: Express, withNeighbors: boolean = false) {
  return await request(app).post('/job').send(JSON.stringify({ name: 'Test', withNeighbors: withNeighbors })).set('Content-Type', 'application/json')
}
async function sendStatusRequest(app: Express, jobId: string) {
  return await request(app).get('/job/' + jobId)
}

async function sendTestRequestAndGetFinishedJob(app: Express, waitBetweenRequests: number, t: ExecutionContext<unknown>): Promise<any> {
  const response = await sendTestRequest(app)
  let r = JSON.parse(response.text)
  // if (!r.done) t.is(response.status, 202)
  if (!r.done) t.truthy(response.status <= 202 && response.status >= 200)
  t.truthy(r.hasOwnProperty('id'))
  const jobId = r.id
  if (r.done) return r

  await sleep(waitBetweenRequests)
  const responseStatus = await sendStatusRequest(app, jobId)
  // t.is(responseStatus.status, 200)
  t.truthy(response.status <= 202 && response.status >= 200)
  const r2 = JSON.parse(responseStatus.text)
  t.truthy(r.hasOwnProperty('id'))
  t.truthy(r.hasOwnProperty('done'))
  return r2
}


function standardMockConnection(wikipediaDelay: number, googleDelay: number): Connections {
  return {
    httpGet: (url, timeout, callback) => {
      delay(() => callback(dummyWikipediaResponse()), wikipediaDelay/*ms*/)
    },
    detectFaces: (imageUrl, timeout, callback) => {
      delay(() => callback([]), googleDelay/*ms*/)
    },
    syncHttpGet: function (url: string, timeout: number): string { throw new Error('Synchronous functions should no longer be used'); }, syncDetectFaces: function (imageUrl: string, timeout: number): GoogleFaceAnnotations { throw new Error('Synchronous functions should no longer be used'); }
  }
}

// sorry guys
export { sleep, dummyWikipediaResponse, delay, sendTestRequest, sendStatusRequest, sendTestRequestAndGetFinishedJob, standardMockConnection, twoNeighborResponse, tenNeighborResponse }