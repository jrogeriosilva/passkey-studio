import { appPath } from "../../../navigation"
import { useEffect, useState, useRef, type ReactNode } from "react"
import { ChevronDown, X, ZoomIn } from "lucide-react"
import lifecycleImg from "@/inspector/assets/fido2-webauthn-diagrams-dark/01-webauthn-credential-lifecycle-dark.svg"
import anatomyImg from "@/inspector/assets/fido2-webauthn-diagrams-dark/02-publickeycredential-anatomy-dark.svg"
import authdataImg from "@/inspector/assets/fido2-webauthn-diagrams-dark/03-authenticatordata-byte-layout-dark.svg"
import attestationImg from "@/inspector/assets/fido2-webauthn-diagrams-dark/04-attestationobject-structure-dark.svg"

/* ---------------------------------------------------------------------------
 * Small presentational helpers shared by every section below.
 * ------------------------------------------------------------------------- */

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-20 space-y-4">
      <h3 id={id} className="flex items-center gap-3 text-xl font-semibold tracking-tight">

        {title}
      </h3>
      {children}
    </section>
  )
}

function Prose({ children }: { children: ReactNode }) {
  return <p className="max-w-prose text-pretty text-muted-foreground">{children}</p>
}

function DefinitionRows({ items }: { items: [string, string][] }) {
  return (
    <dl className="max-w-prose divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card/40">
      {items.map(([term, def]) => (
        <div key={term} className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-4">
          <dt className="font-mono text-xs font-medium text-tree-key">{term}</dt>
          <dd className="text-pretty text-muted-foreground">{def}</dd>
        </div>
      ))}
    </dl>
  )
}

type LightboxState = { src: string; alt: string } | null

function DiagramFigure({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  const [lightbox, setLightbox] = useState<LightboxState>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (lightbox) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [lightbox])

  return (
    <figure className="max-w-prose overflow-hidden rounded-xl border border-border bg-card/60 shadow-sm shadow-black/20">
      <button
        type="button"
        onClick={() => setLightbox({ src, alt })}
        aria-label={`Ampliar diagrama: ${caption}`}
        className="group/figure relative block w-full cursor-zoom-in p-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <img src={src} alt={alt} className="w-full rounded-lg" loading="lazy" />
        <span className="pointer-events-none absolute top-4 right-4 inline-flex items-center gap-1 rounded-md border border-border bg-background/80 px-2 py-1 text-[11px] text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover/figure:opacity-100 group-focus-visible/figure:opacity-100">
          <ZoomIn className="size-3" aria-hidden="true" />
          Ampliar
        </span>
      </button>
      <figcaption className="border-t border-border/60 px-4 py-2 text-xs text-pretty text-muted-foreground">
        {caption}
      </figcaption>
      <dialog ref={dialogRef} aria-label={caption} onCancel={() => setLightbox(null)}
        onClick={e => { if (e.target === e.currentTarget) setLightbox(null) }}
        className="diagram-dialog rounded-xl border border-border bg-card p-4 text-foreground backdrop:bg-black/80">
        <button type="button" aria-label="Fechar" onClick={() => setLightbox(null)} className="mb-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border px-3"><X className="size-4" /></button>
        {lightbox && <img src={lightbox.src} alt={lightbox.alt} className="max-h-[80vh] max-w-full rounded-lg" />}
      </dialog>
    </figure>
  )
}

function ScenarioCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="rounded-xl border border-border bg-card/40 p-4">
      <h4 className="font-medium text-foreground">{title}</h4>
      <p className="mt-1.5 text-pretty text-muted-foreground">{children}</p>
    </li>
  )
}

function Faq({ items }: { items: [string, string][] }) {
  return (
    <div className="max-w-prose space-y-2">
      {items.map(([q, a]) => (
        <details
          key={q}
          className="group rounded-xl border border-border bg-card/40 open:bg-card/70 transition-colors"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-medium text-foreground outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset rounded-xl">
            {q}
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
            />
          </summary>
          <p className="px-4 pb-4 text-pretty text-muted-foreground">{a}</p>
        </details>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------- */

export function EducationalContent() {
  return <details className="mt-8 border-t border-border py-4">
    <summary className="cursor-pointer py-3 text-lg font-semibold">Guia dos payloads WebAuthn</summary>
    <article aria-labelledby="guide-heading" className="space-y-8 py-6 text-base leading-relaxed">
      <header className="space-y-3">
        <h2 id="guide-heading" className="text-2xl font-semibold">Referência para inspecionar os campos</h2>
        <Prose>Use esta referência junto à árvore. Para acompanhar as cerimônias passo a passo, abra a área <a className="text-primary underline" href={appPath('/fido2-demo/')}>Aprender</a> do Passkey Studio.</Prose>
      </header>
      <Section id="what-is-fido2" title="FIDO2 e o ciclo da credencial">
        <Prose>WebAuthn define a API do navegador e os dados que o servidor verifica. CTAP2 define a comunicação com autenticadores. No registro, o autenticador cria um par de chaves. Na autenticação, ele usa a chave privada para assinar authenticatorData ‖ SHA-256(clientDataJSON).</Prose>
        <DiagramFigure src={lifecycleImg} alt="Ciclo WebAuthn: registro com create e autenticação com get. Diagrama em inglês." caption="Registro cria a credencial; autenticação demonstra sua posse." />
        <DefinitionRows items={[
          ['Registro', 'navigator.credentials.create() retorna attestationObject e clientDataJSON. O servidor associa a chave pública e o identificador à conta.'],
          ['Autenticação', 'navigator.credentials.get() retorna authenticatorData, signature, clientDataJSON e, opcionalmente, userHandle.'],
        ]} />
      </Section>
      <Section id="anatomy" title="PublicKeyCredential">
        <DiagramFigure src={anatomyImg} alt="Campos da credencial: id, rawId e response. Diagrama em inglês." caption="O envelope reúne metadados e a resposta da cerimônia." />
        <DefinitionRows items={[
          ['id / rawId', 'Identificador da credencial: id é base64url; rawId é binário na API e base64url na representação JSON.'],
          ['response.attestationObject', 'Mapa CBOR do registro, com fmt, authData e attStmt.'],
          ['response.authenticatorData', 'Estrutura binária da autenticação. No registro, fica em authData dentro de attestationObject.'],
          ['response.clientDataJSON', 'JSON UTF-8 com type, challenge e origin, codificado em base64url na representação JSON.'],
          ['response.signature', 'Assinatura de authenticatorData ‖ SHA-256(clientDataJSON), na autenticação.'],
          ['response.userHandle', 'Identificador opaco da pessoa definido no registro; pode ser nulo.'],
        ]} />
      </Section>
      <Section id="attestation-object" title="attestationObject e formatos de atestação">
        <DiagramFigure src={attestationImg} alt="Estrutura CBOR com fmt, authData e attStmt. Diagrama em inglês." caption="fmt identifica o formato; authData contém bytes; attStmt contém a declaração." />
        <DefinitionRows items={[
          ['none', 'Sem declaração de atestação. attStmt é um mapa vazio.'],
          ['packed', 'Formato compacto de atestação definido por WebAuthn.'],
          ['fido-u2f', 'Compatibilidade com autenticadores FIDO U2F.'],
          ['tpm', 'Atestação de Trusted Platform Module.'],
          ['android-key', 'Atestação do Android Keystore.'],
          ['apple', 'Formato de atestação anônima da Apple.'],
        ]} />
      </Section>
      <Section id="authenticator-data" title="authenticatorData: bytes e flags">
        <DiagramFigure src={authdataImg} alt="Layout de rpIdHash, flags, signCount, dados atestados e extensões. Diagrama em inglês." caption="A estrutura externa é binária. A chave COSE e as extensões internas usam CBOR." />
        <DefinitionRows items={[
          ['rpIdHash · bytes 0–31', 'SHA-256 do RP ID. Compare com o hash do domínio esperado pelo servidor.'],
          ['flags · byte 32', 'UP (bit 0): presença. UV (bit 2): verificação da pessoa. BE (bit 3): elegível para backup. BS (bit 4): estado de backup. AT (bit 6): dados atestados. ED (bit 7): extensões.'],
          ['signCount · bytes 33–36', 'Contador sem sinal de 32 bits, big-endian. Uma regressão pode indicar clonagem, mas alguns autenticadores mantêm zero; o servidor deve considerar a política e o contexto.'],
          ['AT · bytes 37+', 'AAGUID de 16 bytes, tamanho do credentialId em 2 bytes big-endian, credentialId e chave pública COSE.'],
          ['ED · bytes finais', 'Mapa CBOR de extensões, presente somente com ED ativo.'],
        ]} />
      </Section>
      <Section id="cose-keys" title="Rótulos COSE">
        <DefinitionRows items={[
          ['1 (kty)', 'Tipo: 1 = OKP, 2 = EC2, 3 = RSA.'],
          ['3 (alg)', 'Algoritmo: -7 = ES256, -8 = EdDSA, -257 = RS256.'],
          ['-1 (crv / n)', 'Curva para EC2/OKP: 1 = P-256, 2 = P-384, 3 = P-521, 6 = Ed25519. Em RSA, é o módulo n.'],
          ['-2 (x / e)', 'Coordenada x para EC2/OKP; expoente público e para RSA.'],
          ['-3 (y)', 'Coordenada y de EC2, ausente em OKP e RSA.'],
        ]} />
      </Section>
      <Section id="client-data-json" title="clientDataJSON">
        <DefinitionRows items={[
          ['type', 'webauthn.create no registro; webauthn.get na autenticação. Verifique o tipo esperado para evitar reutilização entre cerimônias.'],
          ['challenge', 'Desafio aleatório fornecido pelo servidor, em base64url. Compare os bytes com o desafio da sessão.'],
          ['origin', 'Esquema, domínio e porta da página que chamou WebAuthn. Compare com a origem esperada.'],
          ['crossOrigin', 'Indica uma chamada em contexto de origem cruzada. Valide conforme a política do RP.'],
          ['tokenBinding', 'Campo histórico opcional relacionado a TLS Token Binding.'],
        ]} />
      </Section>
      <Section id="debugging" title="Diagnósticos frequentes">
        <ul className="max-w-prose space-y-3">
          <ScenarioCard title="Origin divergente">Confira domínio, esquema e porta. localhost e produção são origens diferentes.</ScenarioCard>
          <ScenarioCard title="RP ID hash divergente">Compare rpIdHash com SHA-256 do RP ID configurado, sem esquema nem porta.</ScenarioCard>
          <ScenarioCard title="Contador regrediu">Confira o valor anterior, a política do servidor e se a credencial é compartilhada entre dispositivos.</ScenarioCard>
          <ScenarioCard title="AAGUID inesperado">Consulte o registro local ou os metadados FIDO para identificar o modelo. Uma amostra sintética não comprova origem do dispositivo.</ScenarioCard>
          <ScenarioCard title="Formato não suportado">Confira fmt e os formatos aceitos pela biblioteca do servidor. Use attestation: none quando a política dispensar atestação.</ScenarioCard>
          <ScenarioCard title="UP ou UV ausente">Confira a capacidade do autenticador e userVerification. A visualização dos campos não valida a assinatura.</ScenarioCard>
        </ul>
      </Section>
      <Section id="privacy" title="Privacidade e limites">
        <Prose>JSON, CBOR, hex e base64url são processados neste navegador. Payloads não são enviados a um servidor, telemetria ou serviço externo, nem persistidos pelo Inspector. Ao recarregar, a entrada é descartada. A navegação interna preserva o trabalho em memória. Exemplos são sintéticos; o AAGUID de catálogo serve apenas para demonstrar a identificação.</Prose>
      </Section>
      <Section id="faq" title="Perguntas frequentes">
        <Faq items={[
          ['Base64url é diferente de Base64?', 'Sim. Usa - no lugar de + e _ no lugar de /, sem padding =. O Inspector orienta a conversão quando detecta Base64 padrão.'],
          ['O que é AAGUID?', 'Identificador de 16 bytes do modelo do autenticador, atribuído pelo fabricante e presente nos dados atestados.'],
          ['Por que authenticatorData não é CBOR?', 'Seu layout externo é binário e tem campos em posições definidas. Apenas a chave COSE e as extensões são CBOR.'],
          ['O que significam BE e BS?', 'BE indica elegibilidade para backup; BS indica o estado atual de backup. Interprete esses sinais conforme a política do RP.'],
          ['Quais formatos são aceitos?', 'JSON PublicKeyCredential de registro ou autenticação, clientDataJSON em JSON ou base64url, attestationObject, authenticatorData binário e CBOR codificados em hex ou base64url.'],
          ['Funciona offline?', 'Depois que a página e seus recursos forem carregados, a decodificação funciona sem rede. O build estático também pode ser hospedado localmente.'],
          ['Qual a diferença entre atestação e assertion?', 'Atestação pertence ao registro e pode demonstrar a origem do autenticador. Assertion pertence à autenticação e contém a assinatura feita com a chave da credencial.'],
        ]} />
      </Section>
    </article>
  </details>
}
