// ==UserScript==
// @name         Use Croct experimental endpoints
// @version      0.3.0-beta2
// @license      MIT
// @author       Fryuni
// @copyright    2022, Luiz Ferraz
// @updateURL    https://openuserjs.org/meta/Fryuni/Use_Croct_experimental_endpoints.meta.js
// @downloadURL  https://openuserjs.org/install/Fryuni/Use_Croct_experimental_endpoints.user.js
// @description  Plugs Croct with the experimental endpoints. Configurable with Ctrl+Alt+C.
// @match        **/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=croct.com
// @run-at       document-body
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==


function injectEap(croct, croctEap) {
  const originalEap = { ...croctEap };

  // Return and mutate in-place. Works in as many browser isolations as possible.
  return Object.assign(croctEap, {
    ...GM_config.get('hijack-fetch-eap') && {
      fetch: async (slotId, options) => {
        const url = GM_config.get('fetch-eap-endpoint');

        const headers = new Headers();

        // Constants for experimental environments.
        // TODO: Drop this once PMS is released.
        headers.set('X-Organization-Id', GM_config.get('dev-organization'));
        headers.set('X-Workspace-Id', GM_config.get('dev-workspace'));
        headers.set('X-Application-Id', GM_config.get('dev-application'));
        headers.set('X-Visitor-Id', '00000000-0000-0000-0000-000000000000');
        headers.set('X-Client-Id', await croct.instance.sdk.cidAssigner.assignCid());

        headers.set('Content-Type', 'application/json');

        const response = await fetch(url, {
          method: 'POST',
          headers,
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache',
          body: JSON.stringify({
            slotId,
          }),
        });

        const data = await response.json();

        return { payload: data.content };
      },
    },
  })
}

(async function() {
  'use strict';

  const croctEap = window.croctEap ?? unsafeWindow.croctEap ?? {};
  const croct = window.croct ?? unsafeWindow.croct;

  if (croct !== undefined) {
    GM_config.init({
      id: 'croct-experiments',
      fields: {
        'dev-organization': {
          label: 'Organization ID',
          type: 'uuid',
          default: 'd23da44c-470e-439c-84d0-27c04f5c9f1d',
        },
        'dev-workspace': {
          label: 'Workspace ID',
          type: 'uuid',
          default: 'f65133ea-e745-4f6c-bc2e-542be9b1681d',
        },
        'dev-application': {
          label: 'Application ID',
          type: 'uuid',
          default: croct.instance.sdk.appId,
        },
        'enable-debug': {
          label: 'Enable Croct debug logs',
          type: 'checkbox',
          default: false,
        },
        'change-evaluation': {
          label: 'Use custom evaluation endpoint',
          type: 'checkbox',
          default: false,
        },
        'evaluation-endpoint': {
          label: 'Evaluation URL',
          type: 'select',
          options: [
            'https://experiments.croct.tech/client/web/evaluate',
            'https://api.croct.io/alpha/client/web/evaluate',
            'https://api.croct.io/beta/client/web/evaluate',
          ],
          default: 'https://api.croct.io/beta/client/web/evaluate',
        },
        'hijack-fetch-eap': {
          label: 'Hijack Fetch EAP',
          type: 'checkbox',
          default: false,
        },
        'fetch-eap-endpoint': {
          label: 'Fetch EAP Endpoint',
          type: 'select',
          options: [
            'https://content-service-xzexsnymka-rj.a.run.app/content',
          ],
          default: 'https://content-service-xzexsnymka-rj.a.run.app/content',
        },
      },
      events: {
        close: () => { window.location.reload(); },
      },
    });

    document.addEventListener('keydown', event => {
      if (!(event instanceof KeyboardEvent)) return;

      if (event.code === 'KeyC' && event.ctrlKey && event.altKey) {
        GM_config.open();
      }
    });

    const config = {
      appId: GM_config.get('dev-application'),
      debug: GM_config.get('enable-debug'),
      ...GM_config.get('change-evaluation') && {
        evaluationEndpointUrl: GM_config.get('evaluation-endpoint'),
      },
    };

    console.log('Configuring croct plug with:', config);

    croct.unplug();
    croct.plug(config);

    window.croctEap = unsafeWindow.croctEap = injectEap(croct, croctEap);
  }
})();
