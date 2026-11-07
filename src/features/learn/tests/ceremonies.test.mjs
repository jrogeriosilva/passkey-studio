import { createElement, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CONTENT } from '../data/content.ts'
import { createCeremonies } from '../data/ceremonies.ts'

function stepText(step) {
  return renderToStaticMarkup(step.data).replace(/<[^>]*>/g, '').replace(/&quot;/g, '"')
}

for (const [ceremony, count] of Object.entries({ usb: 8, hello: 9, phone: 11 })) {
  for (const mode of ['login', 'register']) {
    test(`${ceremony} ${mode} retains its complete ceremony`, () => {
      const definition = createCeremonies(CONTENT)[ceremony]
      const steps = definition.steps(mode)
      assert.equal(steps.length, count)
      assert.equal(steps[0].st, 'idle')
      assert.equal(steps.at(-1).st, 'done')
      assert.match(renderToStaticMarkup(steps[0].data), new RegExp(`/webauthn/${mode}/options`))
      assert.match(renderToStaticMarkup(steps[2].data), new RegExp(mode === 'login' ? 'webauthn.get' : 'webauthn.create'))
      assert.match(renderToStaticMarkup(steps.at(-2).data), new RegExp(`/webauthn/${mode}/verify`))
      assert.equal(steps.at(-1).t, mode === 'login' ? CONTENT.verify.tLogin : CONTENT.verify.tReg)
      for (const step of steps) {
        assert.ok(step.t && step.d && step.data)
        assert.ok(!renderToStaticMarkup(step.data).includes('undefined'))
        if (step.pkt) for (const actor of [step.pkt.from, step.pkt.to]) assert.ok(['rp', 'client', 'auth'].includes(actor))
      }
      if (ceremony === 'phone') assert.equal(steps[3].st, 'qr')
    })
  }
}

test('illustrative values render as escaped React text, without HTML injection', () => {
  const T = { ...CONTENT, domain: '<script>alert("test")</script>' }
  const data = createCeremonies(T).usb.steps('login')[2].data
  const markup = renderToStaticMarkup(createElement('pre', null, data))
  assert.ok(markup.includes('&lt;script&gt;'))
  assert.ok(!markup.includes('<script>'))
  assert.ok(markup.includes('class="v"'))
})

test('rich content uses React elements rather than embedded markup', () => {
  const T = CONTENT
  for (const key of ['lede', 'ctaDecP', 'disclaimer']) {
    assert.ok(Array.isArray(T[key]))
    assert.ok(T[key].every(part => typeof part !== 'string' || !/<\/?(strong|code)>/.test(part)))
    assert.match(renderToStaticMarkup(createElement(Fragment, null, ...T[key])), /<(strong|code)>/)
  }
  assert.ok(!T.ctaLede.includes('&mdash;'))
})

test('every ceremony preserves the server challenge bytes in clientDataJSON', () => {
  for (const definition of Object.values(createCeremonies(CONTENT))) {
    for (const mode of ['register', 'login']) {
      const steps = definition.steps(mode)
      const challengeHex = stepText(steps[1]).match(/^challenge: ([\da-f\s]+)\nrp/)[1].replace(/\s/g, '')
      const clientData = JSON.parse(stepText(steps[2]).split(' = ')[1])
      assert.equal(Buffer.from(clientData.challenge, 'base64url').toString('hex'), challengeHex)
      assert.equal(clientData.type, mode === 'login' ? 'webauthn.get' : 'webauthn.create')
      assert.equal(clientData.origin, 'https://bank.example')
    }
  }
})

test('registration carries the selected algorithm and attestation through to the credential record', () => {
  const ceremonies = createCeremonies(CONTENT)
  for (const [name, algorithm, alg, format] of [
    ['usb', 'ES256', -7, 'packed'],
    ['hello', 'RS256', -257, 'tpm'],
    ['phone', 'ES256', -7, 'none'],
  ]) {
    const steps = ceremonies[name].steps('register')
    const creation = steps.find(step => step.who === 'auth' && /publicKey/.test(stepText(step)))
    const response = stepText(creation)
    const verified = stepText(steps.at(-1))
    assert.match(stepText(steps[1]), new RegExp(`alg: ${alg}`))
    assert.match(response, new RegExp(`3: ${alg} \\(${algorithm}\\)`))
    if (algorithm === 'ES256') assert.match(response, /-1: 1 \(P-256\)/)
    assert.match(response, new RegExp(`fmt: "${format}"`))
    assert.match(verified, new RegExp(`fmt: "${format}"`))
    assert.match(verified, new RegExp(`publicKey: COSE ${algorithm}`))
    assert.match(response, /signCount 0/)
    assert.match(verified, /signCount: authData.signCount \(0\)/)
    for (const check of ['type: webauthn.create', 'fresh and unused', 'rpIdHash', 'UP=1', 'offered', 'not already registered', 'challenge: consumed']) {
      assert.ok(verified.includes(check), `${name}: missing registration check ${check}`)
    }
    assert.match(stepText(steps[1]), new RegExp(`attestation: "${name === 'phone' ? 'none' : 'direct'}"`))
    if (name === 'phone') assert.match(verified, /attStmt: \{\} \(no attestation statement\)/)
  }
})

test('discoverability and UV policy distinguish the presence-only USB credential from passkeys', () => {
  for (const [name, definition] of Object.entries(createCeremonies(CONTENT))) {
    const registration = stepText(definition.steps('register')[1])
    assert.match(registration, new RegExp(`residentKey: "${name === 'usb' ? 'discouraged' : 'required'}"`))
    for (const mode of ['register', 'login']) {
      const steps = definition.steps(mode)
      const policy = name === 'usb' ? 'preferred' : 'required'
      assert.match(stepText(steps[1]), new RegExp(`userVerification: "${policy}"`))
      assert.match(stepText(steps.at(-1)), new RegExp(`UP=1 UV=${name === 'usb' ? 0 : 1}`))
    }
  }
})

test('assertion verification uses the counter and signature actually returned by each authenticator', () => {
  for (const [name, definition] of Object.entries(createCeremonies(CONTENT))) {
    const steps = definition.steps('login')
    const signing = steps.find(step => step.who === 'auth' && /signature:/.test(stepText(step)))
    const signed = stepText(signing)
    const count = signed.match(/signCount\s*:?\s*(\d+)/)[1]
    const signature = signed.match(/signature: (.+)/)[1]
    assert.ok(stepText(steps.at(-2)).includes(`signature: ${signature}`))
    const verified = stepText(steps.at(-1))
    assert.match(verified, new RegExp(`signCount: \\d+ → ${count}`))
    if (name === 'phone') {
      assert.match(verified, /0 → 0 \(counter not supported\)/)
      assert.match(signed, /BE=1 BS=1/)
      assert.doesNotMatch(verified, /41 → 42/)
    }
    assert.match(verified, /type: webauthn.get/)
    assert.match(verified, /authData ‖ SHA-256\(clientDataJSON\)/)
    assert.match(verified, /challenge: consumed/)
  }
})

test('hybrid CTAP2 exchanges carry the client data hash and keep clientDataJSON in the browser', () => {
  for (const mode of ['register', 'login']) {
    const steps = createCeremonies(CONTENT).phone.steps(mode)
    const command = steps.find(step => step.pkt?.from === 'client' && step.pkt?.to === 'auth')
    const reply = steps.find(step => step.pkt?.from === 'auth' && step.pkt?.to === 'client')
    assert.match(stepText(command), /clientDataHash: SHA-256\(clientDataJSON\)/)
    assert.match(stepText(reply), /clientDataJSON: retained by the browser, not sent over CTAP2/)
    assert.doesNotMatch(stepText(reply), /\+ clientDataJSON/)
    assert.match(stepText(steps.at(-2)), /clientDataJSON: …/)
  }
})
