import { smilingFacesBackend } from '../src/backend.js';
import { Connections } from '../src/connections.js';
import test from 'ava';
import { spy } from 'sinon';
import {  sleep, standardMockConnection, sendTestRequest } from '../tests_util/helpers.js';

test.serial('[3] should start a second job before the first finishes', async (t) => {
    const mockConnections: Connections = standardMockConnection(2000, 10)
    const connectionSpy = spy(mockConnections)
  
    const app = smilingFacesBackend(mockConnections)
    const p1 = sendTestRequest(app)
    await sleep(100)
    const p2 = sendTestRequest(app)
    await sleep(100)
  
    // expecting two calls now independent of whether we have a result yet
    t.is(connectionSpy.httpGet.callCount, 2)
  
    await p1
    await p2
})