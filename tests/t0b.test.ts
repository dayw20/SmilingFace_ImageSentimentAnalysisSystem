import { smilingFacesBackend } from '../src/backend.js';
import { Connections, GoogleFaceAnnotations } from '../src/connections.js';
import test from 'ava';
import { standardMockConnection, sendTestRequest, sendStatusRequest, sleep } from '../tests_util/helpers.js';

test.serial('[0b] should return on get /job/:id with done=true after completing the entire job', async (t) => {
  const mockConnections: Connections = standardMockConnection(1000, 10)

  const app = smilingFacesBackend(mockConnections)

  const r1 = await sendTestRequest(app, false)

  // t.is(r1.status,202)
  t.truthy(r1.status <= 202 && r1.status >= 200)
  let r = JSON.parse(r1.text)
  t.truthy(r.hasOwnProperty('id'))
  t.truthy(r.hasOwnProperty('done'))
  //expect initial request to be incomplete
  t.falsy(r.done)
  const jobId = r.id

  await sleep(1500)
  //expect it to complete within 1500ms
  const r3 = await sendStatusRequest(app, jobId)
  r = JSON.parse(r3.text)
  t.truthy(r.hasOwnProperty('done'))
  t.truthy(r.done)
})