import { createElement, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CONTENT } from '../data/content.ts'
import { createCeremonies } from '../data/ceremonies.ts'

for (const [ceremony, count] of Object.entries({ usb: 8, nfc: 8, hello: 9, phone: 11 })) {
  for (const mode of ['login', 'register']) {
    test(`${ceremony} ${mode} retains its complete ceremony`, () => {
      const definition = createCeremonies(CONTENT)[ceremony]
      const steps = definition.steps(mode)
      assert.equal(steps.length, count)
      assert.equal(steps[0].screen.type, 'login')
      assert.equal(steps.at(-1).screen.type, 'ok')
      assert.match(renderToStaticMarkup(steps[0].data), new RegExp(`/webauthn/${mode}/options`))
      assert.match(renderToStaticMarkup(steps[2].data), new RegExp(mode === 'login' ? 'webauthn.get' : 'webauthn.create'))
      assert.match(renderToStaticMarkup(steps.at(-2).data), new RegExp(`/webauthn/${mode}/verify`))
      assert.equal(steps.at(-1).t, mode === 'login' ? CONTENT.verify.tLogin : CONTENT.verify.tReg)
      for (const step of steps) {
        assert.ok(step.t && step.d && step.data)
        assert.ok(!renderToStaticMarkup(step.data).includes('undefined'))
        assert.ok(Array.isArray(definition.states[step.st]), `Missing visual state: ${step.st}`)
        if (step.pkt) for (const actor of [step.pkt.from, step.pkt.to]) assert.ok(['rp', 'client', 'auth'].includes(actor))
      }
      if (ceremony === 'phone') assert.equal(steps[3].screen.type, 'qr')
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
