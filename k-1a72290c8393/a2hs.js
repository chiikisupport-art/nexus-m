(function () {
  'use strict';

  const standalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  const key = 'nexus.a2hs.openedStandalone';
  try {
    if (standalone) {
      localStorage.setItem(key, '1');
      return;
    }
    if (localStorage.getItem(key) === '1') return;
  } catch (_) {}

  const ua = navigator.userAgent;
  if (standalone || navigator.standalone !== false || !/\biPhone\b/.test(ua) ||
      !/\bVersion\/[\d.]+.*\bSafari\/[\d.]+\s*$/.test(ua) ||
      /\b(?:CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA)\b/.test(ua)) return;

  function showGuide() {
    const dialog = document.createElement('dialog');
    dialog.id = 'nx-a2hs';
    dialog.setAttribute('aria-label', 'ホーム画面に追加');
    dialog.innerHTML = `
      <style>
        #nx-a2hs{pointer-events:auto;position:fixed;inset:auto 0 0;margin:0 auto;box-sizing:border-box;width:min(100%,30rem);max-width:100%;max-height:50dvh;overflow:auto;padding:1.25rem 1.25rem calc(1rem + env(safe-area-inset-bottom));border:1px solid #735938;border-radius:1rem 1rem 0 0;background:#0c101a;color:#fff5e6;font:500 1.2rem/1.55 system-ui,sans-serif}
        #nx-a2hs::backdrop{background:rgba(0,0,0,.45)}
        #nx-a2hs p{margin:0 0 1rem}
        #nx-a2hs .nx-a2hs-buttons{display:flex;flex-wrap:wrap;gap:.6rem}
        #nx-a2hs button{min-height:44px;padding:.5rem .85rem;border:1px solid #b49260;border-radius:.5rem;background:#edc987;color:#141016;font:inherit}
        #nx-a2hs button[data-later]{background:transparent;color:inherit}
        #nx-a2hs svg{width:1.15em;height:1.15em;vertical-align:-.18em}
        #nx-a2hs .nx-a2hs-arrow{text-align:center;margin:.5rem 0 0;font-size:1.8rem;line-height:1;animation:nx-a2hs-down 2s ease-in-out infinite}
        @keyframes nx-a2hs-down{50%{transform:translateY(5px)}}
        @media(prefers-reduced-motion:reduce){#nx-a2hs .nx-a2hs-arrow{animation:none}}
      </style>
      <p id="nx-a2hs-step" aria-live="polite"></p>
      <div class="nx-a2hs-buttons">
        <button type="button" data-next>やり方を見る</button>
        <button type="button" data-later>あとで</button>
      </div>
      <div class="nx-a2hs-arrow" aria-hidden="true" hidden>↓</div>`;
    const share = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8H5v13h14V8h-3M12 15V2m-4 4 4-4 4 4"/></svg>';
    const steps = [
      'ホーム画面に追加すると、アプリのように使えます。追加しないと、入れた鍵が消えることがあります',
      '① 画面の下の 共有の印 ' + share + '（四角から上向きの矢印）を押します。見つからないときは「…」を押すと出ます',
      '② 下へずらして「ホーム画面に追加」を押します',
      '③ 右上の「追加」を押します。できたら、ホーム画面の NEXUS のロゴから開いてください'
    ];
    const message = dialog.querySelector('p');
    const next = dialog.querySelector('[data-next]');
    const later = dialog.querySelector('[data-later]');
    const arrow = dialog.querySelector('.nx-a2hs-arrow');
    let step = 0;
    message.textContent = steps[0];
    later.addEventListener('click', () => dialog.close());
    next.addEventListener('click', () => {
      if (++step === steps.length) {
        dialog.close();
        return;
      }
      message.innerHTML = steps[step];
      next.textContent = step === steps.length - 1 ? 'わかった' : '次へ';
      later.hidden = true;
      arrow.hidden = step !== 1;
      dialog.scrollTop = 0;
    });
    dialog.addEventListener('close', () => dialog.remove(), { once: true });
    // NEXUS は body に直接差し込まれた物を消す（外の拡張機能の守り）。画面の内側の見えている箱に入れる（showModal なので見た目は一番上）
    const host = [...document.body.children].find((e) => e.id !== "nexusBoot" && !/^(SCRIPT|STYLE|LINK|DIALOG)$/.test(e.tagName) && getComputedStyle(e).display !== "none") || document.body;
    host.append(dialog);
    dialog.showModal();
  }

  window.addEventListener('nx-boot-finished', () => {
    // 販売版はこのイベントであいさつを始める。読み上げと起動画面の暗転が終わるまで待つ。
    const boot = document.getElementById('nexusBoot');
    const speech = window.speechSynthesis;
    function afterGreeting() {
      if ((boot && !boot.classList.contains('gone') && getComputedStyle(boot).visibility !== 'hidden') ||
          document.getElementById('nxVeil') || (speech && (speech.speaking || speech.pending))) {
        setTimeout(afterGreeting, 150);
        return;
      }
      showGuide();
    }
    setTimeout(afterGreeting, 150);
  }, { once: true });

  // 会長版の起動画面はイベントを出さず、画面を閉じてからその場であいさつを読む。
  if (window.__NX_PERSONAL_MOBILE__) {
    const boot = document.getElementById('nexusBoot');
    if (!boot) return;
    const observer = new MutationObserver(checkBoot);
    function checkBoot() {
      if (!boot.classList.contains('gone') || window.__nxBootHold) return;
      observer.disconnect();
      window.dispatchEvent(new Event('nx-boot-finished'));
    }
    observer.observe(boot, { attributes: true, attributeFilter: ['class'] });
    checkBoot();
  }
})();
