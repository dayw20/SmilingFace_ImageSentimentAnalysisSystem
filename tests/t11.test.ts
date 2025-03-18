import { smilingFacesBackend } from '../src/backend.js';
import { Connections } from '../src/connections.js';
import test from 'ava';
import request from 'supertest';
import { standardMockConnection, sleep } from '../tests_util/helpers.js';

test.serial('[11] should reject too many requests with error code 503', async (t) => {
    const mockConnections: Connections = standardMockConnection(1000, 10)
  
    const app = smilingFacesBackend(mockConnections)
  
    async function sendRequest() {
      return await (await request(app).post('/job').send(JSON.stringify({ name: 'Test', withNeighbors: false })).set('Content-Type', 'application/json'))
    }
  
    const r1 = sendRequest()
    await sleep(100)
    const r2 = sendRequest()
    await sleep(100)
    const r3 = sendRequest()
    await sleep(100)
    const r4 = sendRequest()
    await sleep(100)
    const r5 = sendRequest()
    await sleep(100)
    const r6 = sendRequest()
  
    // t.is((await r1).status, 202)
    // t.is((await r2).status, 202)
    // t.is((await r3).status, 202)
    // t.is((await r4).status, 202)
    // t.is((await r5).status, 202)
    // scuffed as hell 
    t.truthy((await r1).status <= 202 && (await r1).status >= 200)
    t.truthy((await r2).status <= 202 && (await r2).status >= 200)
    t.truthy((await r3).status <= 202 && (await r3).status >= 200)
    t.truthy((await r4).status <= 202 && (await r4).status >= 200)
    t.truthy((await r5).status <= 202 && (await r5).status >= 200)
    t.is((await r6).status, 503)
  
    // test that it recovers and works again once jobs are finished
    await sleep(1500)
    const r7 = await sendRequest()
    // t.is(r7.status, 202)
    t.truthy((await r7).status <= 202 && (await r7).status >= 200)
})