import { smilingFacesBackend } from '../src/backend.js';
import { Connections } from '../src/connections.js';
import test from 'ava';
import { standardMockConnection, sendTestRequest } from '../tests_util/helpers.js';

test.serial('[0a] should return from post /job with done=false before completing the entire job (required for incremental loading)', async (t) => {
    const mockConnections: Connections = standardMockConnection(1000, 10)
  
    const app = smilingFacesBackend(mockConnections)
  
    const r1 = await sendTestRequest(app, false)
  
    // t.is(r1.status, 202)
    t.truthy(r1.status <= 202 && r1.status >= 200)
    let r = JSON.parse(r1.text)
    t.truthy(r.hasOwnProperty('id'))
    t.truthy(r.hasOwnProperty('done'))
    //expect initial request to be incomplete
    t.falsy(r.done)
  })