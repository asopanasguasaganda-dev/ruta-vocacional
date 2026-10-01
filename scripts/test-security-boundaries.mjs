import assert from 'node:assert/strict';
import { readJsonObject, readBoundedBody } from '../lib/server/request-body.ts';
import { trustedMutationOrigin } from '../lib/server/request-origin.ts';

const request = (body, headers = {}) => new Request('https://ruta.example/api/state', {
  method:'POST', headers:{'Content-Type':'application/json', ...headers}, body,
});
assert.deepEqual(await readJsonObject(request('{"ok":true}')), {ok:true});
for (const value of ['null','[]','"text"','{broken'])
  await assert.rejects(readJsonObject(request(value)), e=>e.status===400);
await assert.rejects(readJsonObject(request('{}', {'Content-Type':'text/plain'})), e=>e.status===415);
await assert.rejects(readBoundedBody(request('123456789', {'Content-Length':'1'}), 8), e=>e.status===413);
await assert.rejects(readBoundedBody(request('ááá'), 5), e=>e.status===413);
let cancelled=false;
const stream=new ReadableStream({pull(c){c.enqueue(new Uint8Array(1024));},cancel(){cancelled=true;}});
await assert.rejects(readBoundedBody(new Request('https://ruta.example', {method:'POST',body:stream,duplex:'half'}),1023),e=>e.status===413);
assert(cancelled);
const previous=process.env.APP_URL;
process.env.APP_URL='https://ruta.example';
assert(trustedMutationOrigin(request('{}',{Origin:'https://ruta.example'})));
assert(!trustedMutationOrigin(request('{}')));
assert(!trustedMutationOrigin(request('{}',{Origin:'null'})));
assert(!trustedMutationOrigin(request('{}',{Origin:'https://evil.example'})));
assert(!trustedMutationOrigin(new Request('https://evil.example/api/state',{headers:{Origin:'https://evil.example'}})));
assert(!trustedMutationOrigin(request('{}',{Origin:'https://ruta.example','Sec-Fetch-Site':'cross-site'})));
if(previous===undefined)delete process.env.APP_URL;else process.env.APP_URL=previous;
console.log('PASS: real byte limits, stream cancellation, JSON/type validation, canonical origin, missing/cross-site origin denied.');
