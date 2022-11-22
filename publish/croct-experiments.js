// ==UserScript==
// @name         Use Croct experimental endpoints
// @namespace    https://croct.com/
// @version      0.1
// @author       Luiz Ferraz
// @description  Plugs Croct with the experimental endpoints
// @match        *
// @icon         https://www.google.com/s2/favicons?sz=64&domain=croct.com
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

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

  console.log(event);

  if (event.code === 'KeyC' && event.ctrlKey && event.altKey) {
    GM_config.open();
  }
});

(function() {
  'use strict';

  if (croct !== undefined) {
    // Keep the existing App ID
    const previousAppId = croct.instance.sdk.appId;

    const config = {
      appId: previousAppId,
      debug: GM_config.get('enable-debug'),
      ...GM_config.get('change-evaluation') && {
        evaluationEndpointUrl: GM_config.get('evaluation-endpoint'),
      },
    };

    croct.unplug();
    croct.plug(config);
  }
})();
