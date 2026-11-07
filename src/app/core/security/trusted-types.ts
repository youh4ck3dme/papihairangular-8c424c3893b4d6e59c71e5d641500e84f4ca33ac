/**
 * Trusted Types (CSP `require-trusted-types-for 'script'`, scripts/csp.mjs): prehliadač odmietne
 * zápis reťazca do nebezpečných miest (innerHTML, script.text, URL skriptu…), ak neprejde politikou.
 * Angular má vlastné politiky ('angular', 'angular#unsafe-bypass'); tu sú len dve úzke výnimky webu.
 * Prehliadače bez Trusted Types (Firefox, Safari) dostanú pôvodný reťazec – správanie sa nemení.
 */
interface Policy { createScript?: (s: string) => unknown; createScriptURL?: (s: string) => unknown }
interface TT { createPolicy: (name: string, rules: Policy) => Policy }
const tt = (globalThis as { trustedTypes?: TT }).trustedTypes;

/** URL skriptov, ktoré smú bežať ako service worker – nič iné. */
const SW_SCRIPTS = new Set(['/ngsw-worker.js']);

/**
 * 'default' politika sa použije len tam, kde knižnica posiela obyčajný reťazec a nedá sa zmeniť:
 * Angular registruje service worker cez navigator.serviceWorker.register('ngsw-worker.js').
 * Povolí iba URL z SW_SCRIPTS na vlastnej doméne; všetko ostatné (aj HTML a skripty) zablokuje.
 */
export function installTrustedTypesDefaultPolicy(): void {
  if (!tt) return;
  try {
    tt.createPolicy('default', {
      createScriptURL: (url: string) => {
        // relatívna URL sa rieši voči <base href="/">, rovnako ako v navigator.serviceWorker.register
        const u = new URL(url, document.baseURI);
        return u.origin === location.origin && SW_SCRIPTS.has(u.pathname) ? u.href : null;
      },
    });
  } catch {
    // politika už existuje (HMR vo vývoji) – nič
  }
}

let jsonLd: Policy | undefined;
/** JSON-LD do <script type="application/ld+json">: vstup je vždy výstup JSON.stringify, nie HTML. */
export function trustedJsonLd(data: unknown): string {
  const json = JSON.stringify(data);
  if (!tt) return json;
  jsonLd ??= tt.createPolicy('papi#jsonld', { createScript: (s: string) => s });
  return jsonLd.createScript!(json) as string;
}
