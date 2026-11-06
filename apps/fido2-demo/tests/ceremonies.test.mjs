import { createElement, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { I18N, detectLanguage } from '../src/data/i18n.ts'
import { createCeremonies } from '../src/data/ceremonies.ts'

for (const language of ['pt', 'en']) {
  for (const [ceremony, count] of Object.entries({ usb: 8, nfc: 8, hello: 9, phone: 11 })) {
    for (const mode of ['login', 'register']) {
      test(`${language}: ${ceremony} ${mode} retains its complete ceremony`, () => {
        const definition = createCeremonies(I18N[language])[ceremony]
        const steps = definition.steps(mode)
        assert.equal(steps.length, count)
        assert.equal(steps[0].screen.type, 'login')
        assert.equal(steps.at(-1).screen.type, 'ok')
        assert.match(renderToStaticMarkup(steps[0].data), new RegExp(`/webauthn/${mode}/options`))
        assert.match(renderToStaticMarkup(steps[2].data), new RegExp(mode === 'login' ? 'webauthn.get' : 'webauthn.create'))
        assert.match(renderToStaticMarkup(steps.at(-2).data), new RegExp(`/webauthn/${mode}/verify`))
        assert.equal(steps.at(-1).t, mode === 'login' ? I18N[language].verify.tLogin : I18N[language].verify.tReg)
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
}

test('language preference survives reload and unavailable storage', () => {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  try {
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { language: 'pt-BR' } })
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => 'en' } })
    assert.equal(detectLanguage(), 'en')
    globalThis.localStorage.getItem = () => 'invalid'
    assert.equal(detectLanguage(), 'pt')
    globalThis.localStorage.getItem = () => { throw new Error('Storage disabled') }
    assert.equal(detectLanguage(), 'pt')
    globalThis.navigator.language = 'fr-FR'
    assert.equal(detectLanguage(), 'en')
  } finally {
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage)
    else delete globalThis.localStorage
    Object.defineProperty(globalThis, 'navigator', originalNavigator)
  }
})

test('illustrative values render as escaped React text, without HTML injection', () => {
  const T = { ...I18N.en, domain: '<script>alert("test")</script>' }
  const data = createCeremonies(T).usb.steps('login')[2].data
  const markup = renderToStaticMarkup(createElement('pre', null, data))
  assert.ok(markup.includes('&lt;script&gt;'))
  assert.ok(!markup.includes('<script>'))
  assert.ok(markup.includes('class="v"'))
})

test('rich translations use React elements rather than embedded markup', () => {
  for (const T of Object.values(I18N)) {
    for (const key of ['lede', 'ctaDecP', 'disclaimer']) {
      assert.ok(Array.isArray(T[key]))
      assert.ok(T[key].every(part => typeof part !== 'string' || !/<\/?(strong|code)>/.test(part)))
      assert.match(renderToStaticMarkup(createElement(Fragment, null, ...T[key])), /<(strong|code)>/)
    }
    assert.ok(!T.ctaLede.includes('&mdash;'))
  }
})
