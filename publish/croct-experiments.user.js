// ==UserScript==
// @name         Use Croct experimental endpoints
// @version      0.2.5
// @license      MIT
// @author       Fryuni
// @copyright    2022, Luiz Ferraz
// @updateURL    https://openuserjs.org/meta/Fryuni/Use_Croct_experimental_endpoints.meta.js
// @downloadURL  https://openuserjs.org/install/Fryuni/Use_Croct_experimental_endpoints.user.js
// @description  Plugs Croct with the experimental endpoints. Configurable with Ctrl+Alt+C.
// @match        *
// @icon         https://www.google.com/s2/favicons?sz=64&domain=croct.com
// @run-at       document-body
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
  'use strict';

  const croct = window.croct ?? unsafeWindow.croct;

  if (croct !== undefined) {
    GM_config.init({
      id: 'croct-experiments',
      fields: {
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
          'label': 'Evaluation URL',
          'type': 'select',
          'options': [
            'https://experiments.croct.tech/client/web/evaluate',
            'https://api.croct.io/alpha/client/web/evaluate',
            'https://api.croct.io/beta/client/web/evaluate',
          ],
          'default': 'https://api.croct.io/beta/client/web/evaluate',
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

    // Keep the existing App ID
    const previousAppId = croct.instance.sdk.appId;

    const config = {
      appId: previousAppId,
      debug: GM_config.get('enable-debug'),
      ...GM_config.get('change-evaluation') && {
        evaluationEndpointUrl: GM_config.get('evaluation-endpoint'),
      },
    };

    console.log('Configuring croct plug with:', config);

    croct.unplug();
    croct.plug(config);
  }
})();
