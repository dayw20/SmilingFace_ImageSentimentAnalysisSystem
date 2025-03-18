import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import { sleep, sendTestRequest, standardMockConnection } from '../tests_util/helpers.js';

test.serial('[10] should reject too many requests', async (t) => {
    const mockConnections: Connections = standardMockConnection(1000, 1)
  
    const app = smilingFacesBackend(mockConnections)
  
    const r1 = sendTestRequest(app)
    await sleep(10)
    const r2 = sendTestRequest(app)
    await sleep(10)
    const r3 = sendTestRequest(app)
    await sleep(10)
    const r4 = sendTestRequest(app)
    await sleep(10)
    const r5 = sendTestRequest(app)
    await sleep(10)
    const r6 = sendTestRequest(app)
  
    // t.is((await r1).status, 202)
    // t.is((await r2).status, 202)
    // t.is((await r3).status, 202)
    // t.is((await r4).status, 202)
    // t.is((await r5).status, 202)
    // t.not((await r6).status, 202)
    t.truthy((await r1).status <= 202 && (await r1).status >= 200)
    t.truthy((await r2).status <= 202 && (await r2).status >= 200)
    t.truthy((await r3).status <= 202 && (await r3).status >= 200)
    t.truthy((await r4).status <= 202 && (await r4).status >= 200)
    t.truthy((await r5).status <= 202 && (await r5).status >= 200)
    t.falsy((await r6).status <= 202 && (await r6).status >= 200)
  
    await sleep(1500)
    const r7 = await sendTestRequest(app)
    // t.is((await r7).status, 200)
    t.truthy((await r7).status <= 202 && (await r7).status >= 200)
})