import { expect, test } from 'vitest';
import { encode } from 'cbor-x';
import { base64 } from '@hexagon/base64';
import { detectAndNormalize } from './format-detection';
import { tryExtractPublicKeyCredential } from './publickeycredential-input';
import { decodeFullCredential } from './decode-orchestrator';
import { autoDetectAndDecode } from './payload-type-detection';
import { parseAuthData } from './decode-authdata';
import { preprocessForTree } from './tree-preprocess';
const b64 = (b: Uint8Array) => base64.fromArrayBuffer(new Uint8Array(b).buffer, true);
const auth = new Uint8Array(37); auth[32] = 0x1d;
const client = JSON.stringify({type:'webauthn.get',origin:'https://example.com',challenge:'c2FtcGxl'});
test('decodes an authentication envelope preserving signature and userHandle', () => {
  const envelope = tryExtractPublicKeyCredential(JSON.stringify({rawId:'AQ',response:{authenticatorData:b64(auth),clientDataJSON:b64(new TextEncoder().encode(client)),signature:'AQI',userHandle:'Aw'}}));
  expect(envelope).not.toBeNull();
  const r = decodeFullCredential(envelope!);
  expect(r).toMatchObject({ok:true,type:'publicKeyCredential',data:{response:{authenticatorData:{flags:{be:true,bs:true}},signature:new Uint8Array([1,2]),userHandle:new Uint8Array([3])}}});
});
test('normalizes JSON bytes and routes clientDataJSON', () => {
  const r = detectAndNormalize(client); expect(r.ok && r.bytes.byteLength).toBe(new TextEncoder().encode(client).length);
  if(r.ok) expect(autoDetectAndDecode(r.bytes).result).toMatchObject({ok:true,type:'clientDataJSON'});
});
test('detects bare authenticatorData but rejects trailing data and invalid extension structures', () => {
  expect(autoDetectAndDecode(auth).result).toMatchObject({ok:true,type:'authenticatorData'});
  expect(parseAuthData(new Uint8Array([...auth,0]))).toMatchObject({ok:false});
  const missing = auth.slice(); missing[32] |= 0x80;
  expect(parseAuthData(missing)).toMatchObject({ok:false});
  expect(parseAuthData(new Uint8Array([...missing,...encode(1)]))).toMatchObject({ok:false});
});
test('renders primitive CBOR and diagnoses standard Base64', () => {
  expect(preprocessForTree({ok:true,type:'raw-cbor',data:1}).tree).toEqual({value:1});
  expect(detectAndNormalize('+/8=')).toMatchObject({ok:false,error:expect.stringMatching(/Base64/)});
});
