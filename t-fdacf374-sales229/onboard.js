// 初めての導入案内（テンプレート・2026-11-15 会長「起動したら鍵を入れて使えるまでを NEXUS が説明する」）
// AI を使わない決まった案内。今の状態（ライセンス・AI の鍵・はじめての会話）を見て、次の一手だけを画面に出す。
// 文面は STEPS だけを書き換えれば、PC の販売版・友達用にもそのまま使える。
(function () {
  'use strict';
  var STEPS = {
    license: {
      title: '準備 1/3　ライセンスの鍵を入れる',
      short: '受け取ったライセンスの鍵をコピーして、下の青いボタンを押すだけです。',
      app: [
        'ホーム画面のアプリは、Safari と中身を別々にしまうため、Safari で入れた鍵はここには届きません（iPhone の決まりです）。',
        'Safari の NEXUS で入れてあるなら：Safari の NEXUS の入力欄に「鍵をまとめてコピー」と打って送信 → このアプリに戻り、入力欄を長押しして「ペースト」→「送信」。ライセンスと AI の鍵が一度に入ります。',
        'はじめての場合は、下の手順で入れてください。'
      ],
      lines: [
        '受け取った「NXL1.」で始まる長い文字（ライセンスの鍵）を長押しして「コピー」します。',
        'NEXUS に戻り、上の「コピーした鍵を貼り付けて送信」を押します（「ペースト」の確認が出たら押します）。',
        'または、「Mic」の右の枠（入力欄）を長押しして「ペースト」→「送信」でも入ります。',
        '「ライセンスを確かめました」と出れば、この手順は終わりです。'
      ]
    },
    ai: {
      title: '準備 2/3　Groq の鍵を作って入れる（無料）',
      short: '①を押す → Google で続ける →「Create API Key」→ nexus と入力して「Submit」→「Copy」→ ここに戻って②を押す。',
      lines: [
        '①「Groq の鍵のページ」を押し、「Continue with Google」でいつもの Google アカウントを選びます。',
        '「Create API Key」を押します。お支払いの画面が出たら、そこで止めてください。',
        '「Display Name」に nexus と入力し、「Submit」を押します。',
        '「gsk_」で始まる鍵が出たら、横の「Copy」を押します。',
        'NEXUS に戻り、「② コピーした鍵を入れる」を押します。',
        '案内が「準備 3/3」に進めば、この手順は終わりです。'
      ],
      button: { label: 'Groq の鍵のページ', href: 'https://console.groq.com/keys' }
    },
    backup: {
      title: '予備の鍵（無料・入れなくてよい）',
      short: '①を押す → 英語の「Create API key」→ 出た鍵の横のコピーの印 → ここに戻って②を押す。これで終わりです。',
      lines: [
        '①「Gemini の鍵のページ」を押します（Google のページが開きます）。',
        'Google のアカウントでログインします（Gmail と同じものです）。',
        '「Create API key」（日本語の画面なら「API キーを作成」）を押します。プロジェクトを聞かれたら、新しく作る方を選びます。',
        '「AIza」で始まる鍵が出たら、横のコピーの印を押します。',
        'NEXUS に戻り、「② コピーした鍵を入れる」を押します。'
      ],
      button: { label: 'Gemini の鍵のページ', href: 'https://aistudio.google.com/apikey' }
    },
    talk: {
      title: '準備 3/3　話しかけてみる',
      lines: [
        '「Mic」を押すとキーボードが出ます。キーボードのマイクの印を押して「こんにちは」と話し、もう一度マイクの印を押してから「送信」を押します。',
        '話すのが苦手なら、入力欄に文字で打っても同じです。',
        '答えが返ってきたら、準備はすべて終わりです。'
      ]
    },
    done: {
      title: '準備ができました',
      lines: [
        '話す：「Mic」→ キーボードのマイクの印を押して話す →「送信」。打つ：入力欄に書いて「送信」。',
        '調べもの：「〇〇を調べて」。困ったとき：「診断」と打つと、どこが悪いかと直し方を答えます。',
        'この案内をもう一度見るには「案内」、新しい版にするには「最新にして」と打ってください。'
      ]
    }
  };
  var LS = 'nxOnboard';
  var linkSet = null;
  try { var hm = location.hash.match(/nxset=([^&]+)/); if (hm) { linkSet = 'NXSET1.' + decodeURIComponent(hm[1]); history.replaceState(null, '', location.pathname + location.search); } } catch (e) { }
  function standalone() { return navigator.standalone === true || !!(window.matchMedia && matchMedia('(display-mode: standalone)').matches); }
  function aiSettings() { try { return JSON.parse(localStorage.getItem('nexus.ai.v1') || '{}') || {}; } catch (e) { return {}; } }
  function geminiKey(cfg) { return (cfg.gemini || {}).key || ''; }
  function groqKey(cfg) { return ((cfg.keys || {}).groq || {}).key || ''; }
  // Safari とホーム画面のアプリで鍵を渡す：ライセンスと Groq・Gemini の鍵を1つの文字にまとめる
  function packSet() {
    var l = localStorage.getItem('nexus.mobile.license') || '';
    if (!l) return '';
    var cfg = aiSettings();
    return 'NXSET1.' + btoa(unescape(encodeURIComponent(JSON.stringify({ l: l, g: geminiKey(cfg), q: groqKey(cfg) }))));
  }
  function say(t) { try { if (window.__nxTell) window.__nxTell(t); } catch (e) { } }
  // ボタン一つで、コピーした鍵を読み取って送る（iPhone は「ペースト」の確認が出るので押す）
  function pasteSend() {
    if (!navigator.clipboard || !navigator.clipboard.readText) { say('この画面では読み取れません。入力欄（「Mic」の右の枠）を長押しして「ペースト」→「送信」を押してください。'); return; }
    navigator.clipboard.readText().then(function (t) {
      t = String(t || '').replace(/\s+/g, '');
      if (!t) { say('コピーされた文字がありません。先に鍵をコピーしてください。'); return; }
      if (window.__mobileSubmit) window.__mobileSubmit('silent', t);
    }, function () { say('貼り付けが許されませんでした。入力欄（「Mic」の右の枠）を長押しして「ペースト」→「送信」を押してください。'); });
  }
  function copySet() {
    var t = packSet(); if (!t) { say('まだライセンスの鍵が入っていません。'); return; }
    var ok = function () { say('鍵をまとめてコピーしました。ホーム画面の NEXUS を開き、入力欄を長押しして「ペースト」→「送信」を押してください。'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function () { say('コピーできませんでした。次の文字を長押ししてコピーしてください：' + t); });
    else say('次の文字を長押ししてコピーしてください：' + t);
  }
  function get() { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } }
  function put(o) { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) { } }
  function licensed() { return !!(window.__NX_LICENSE__ && window.__NX_LICENSE__.ok); }
  function step() {
    var s = get();
    if (!licensed()) return 'license';
    var cfg = aiSettings();
    if (!geminiKey(cfg) && s.wantGemini) return 'backup';
    if (!groqKey(cfg) && !geminiKey(cfg)) return 'ai';   // Groq を入れるかは自由（会長 2026-11-20）。Gemini だけでも先へ進む
    if (!s.talked) return 'talk';
    return s.closed ? null : 'done';
  }
  var card = null, shown = '';
  function render() {
    var st = step(); if (st === shown && card) return; shown = st;
    // 案内の窓は .app（重なり順 1）の中にある。上に重なる飾りの層（天の川・オーロラ＝7・8）に隠されないよう、案内の間だけ .app を上げる（2026-11-27 会長「iPhone で青い窓が出ない」）
    var appBox = document.querySelector('.app');
    if (!st) { if (card) card.remove(); card = null; if (appBox) appBox.style.zIndex = ''; return; }
    if (appBox) appBox.style.zIndex = '9';
    var area = document.querySelector('.input-area'); if (!area) return;
    if (!card) { card = document.createElement('section'); card.id = 'nxOnboard'; card.setAttribute('aria-live', 'polite'); area.parentElement.insertBefore(card, area); }
    var d = STEPS[st], h = '<h3>' + d.title + '</h3>';
    var opened = !!((get().opened || {})[d.button && d.button.href]);
    if (d.short) h += '<p class="nxob-short">' + d.short + '</p>';
    if (d.button && !opened) h += '<a class="nxob-btn nxob-big" data-open href="' + d.button.href + '" target="_blank" rel="noopener">① ' + d.button.label + '</a>';
    if (st === 'license' || st === 'ai' || st === 'backup') h += '<button type="button" class="nxob-paste' + (d.button && !opened ? ' nxob-dim' : '') + '" data-paste>' + (d.button ? '② ' : '') + 'コピーした鍵を入れる</button>';
    if (d.app && standalone()) { h += '<ul class="nxob-app">'; d.app.forEach(function (l) { h += '<li>' + l + '</li>'; }); h += '</ul>'; }
    var ol = '<ol>'; d.lines.forEach(function (l) { ol += '<li>' + l + '</li>'; }); ol += '</ol>';
    if (d.short) h += '<details class="nxob-more"><summary>くわしい手順</summary>' + ol + '</details>'; else h += ol;
    if (d.button && opened) h += '<a class="nxob-btn" href="' + d.button.href + '" target="_blank" rel="noopener">もう一度 ' + d.button.label + '</a>';
    if (st === 'backup') h += '<button type="button" class="nxob-btn" data-skip>あとで</button>';
    if (st === 'done' && !standalone()) h += '<button type="button" class="nxob-btn" data-copyset>ホーム画面のアプリ用に鍵をまとめてコピー</button>';
    if (st === 'done') h += '<button type="button" class="nxob-btn" data-close>閉じる</button>';
    card.innerHTML = h;
    var sk = card.querySelector('[data-skip]'); if (sk) sk.addEventListener('click', function () { var s = get(); s.wantGemini = false; put(s); render(); });
    var op = card.querySelector('[data-open]'); if (op) op.addEventListener('click', function () { var s = get(); s.opened = s.opened || {}; s.opened[d.button.href] = true; put(s); setTimeout(function () { shown = ''; render(); }, 300); });
    var ps = card.querySelector('[data-paste]'); if (ps) ps.addEventListener('click', pasteSend);
    var cs = card.querySelector('[data-copyset]'); if (cs) cs.addEventListener('click', copySet);
    var c = card.querySelector('[data-close]'); if (c) c.addEventListener('click', function () { var s = get(); s.closed = true; put(s); render(); });
  }
  // 送ったとき：「案内」は案内を出し直す。準備 3/3 の間に送れたら「話せた」とする
  window.nxOnboardReset = function () { put({}); shown = ''; clearTimeout(doneTimer); doneTimer = 0; render(); };
  function wrap() {
    var orig = window.__mobileSubmit; if (!orig || orig.__nxob) return !!orig;
    var w = function (mode, text) {
      var tt = String(text || '').trim();
      if (tt === '案内') { window.nxOnboardReset(); return; }
      if (/^予備の鍵(を入れる|を入れたい)?$/.test(tt)) {
        if (geminiKey(aiSettings())) { say('予備の鍵（Gemini）は設定済みです。'); return; }
        var sb = get(); sb.wantGemini = true; sb.closed = false; put(sb); shown = ''; render(); return;
      }
      // 読み方をふつうの言い方で教える：「長崎はながさきと読んで」「番はばんと読む」→「読み方：長崎＝ながさき」として登録（2026-11-15 会長「読み間違えは治らない？」）
      var rm = tt.match(/^「?(.{1,20}?)」?は「?([ぁ-んァ-ヶー]{1,30})」?(?:と|って)(?:読んで|読む|読みます|よんで|よむ)(?:よ|ね|ください)?[。！!]?$/);
      if (rm) { return orig.call(this, mode, '読み方：' + rm[1] + '＝' + rm[2]); }
      // 試せる声（スマホの中で作る声・Kokoro）は、iPhone では重くてアプリが落ちたので外した（2026-11-15 会長）
      if (/^(新しい声|ココロ|kokoro)(を試して|にして|で話して)?$/i.test(tt)) { say('新しい声は、iPhone では重くてアプリが落ちたため外しました。いつもの声で話します。'); return; }
      if (/^(声を戻して|声を元に戻して|kyokoに戻して|キョウコに戻して|いつもの声にして)$/i.test(tt)) {
        try { localStorage.removeItem('nxVoiceEngine'); } catch (e) { } say('いつもの声（iPhone の声）で話します。'); return;
      }
      // 「声のテスト」：iPhone の標準の声で一言だけ読む（声が出ないときの切り分け）
      if (/^声のテスト$|^声を?試して$/.test(tt)) {
        try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance('声のテストです。聞こえますか。'); u.lang = 'ja-JP'; u.onstart = function () { say('いま声を出しています。聞こえなければ、iPhone の音量・消音スイッチ・Bluetooth のつなぎ先を確かめてください。'); }; u.onerror = function (e) { say('声を出せませんでした（' + (e.error || '不明') + '）。アプリを閉じて開き直してください。'); }; speechSynthesis.speak(u); } catch (e) { say('この画面では声を出せません。'); }
        return;
      }
      // スマホ版の「最新にして」：手元にしまった画面を捨て、GitHub から読み直す（鍵や設定は消えない）
      if (/^(最新にして|更新して|アップデートして|最新版にして)$/.test(tt)) {
        say('最新の版を読み込みます。数秒お待ちください。');
        var go = function () { location.replace(location.pathname + '?v=' + Date.now()); };
        try {
          Promise.all([
            window.caches ? caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); }) : 0,
            navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.update().catch(function () { }); })); }) : 0
          ]).then(function () { setTimeout(go, 600); }, go);
        } catch (e) { go(); }
        return;
      }
      if (/^鍵をまとめて(コピー|渡す)|^鍵を渡して?$/.test(tt)) { copySet(); return; }
      if (/^NXSET1\./.test(tt)) {
        try { var o = JSON.parse(decodeURIComponent(escape(atob(tt.slice(7))))); var self = this;
          if (o.l) orig.call(self, mode, o.l);
          if (o.g) setTimeout(function () { orig.call(self, mode, o.g); }, 1800);
          if (o.q) setTimeout(function () { orig.call(self, mode, o.q); }, 3600);
        } catch (e) { say('まとめた鍵が読めませんでした。もう一度コピーしてから貼ってください。'); }
        return;
      }
      if (step() === 'talk' && String(text || '').trim()) { var s = get(); s.talked = true; put(s); setTimeout(render, 1500); }
      return orig.apply(this, arguments);
    };
    w.__nxob = true; window.__mobileSubmit = w; return true;
  }
  // どの入口から送っても（送信ボタン・改行キー・声）、準備 3/3 の間に会長の言葉が会話に増えたら「話せた」とする
  var userBase = -1;
  function watchTalk() {
    var n = document.querySelectorAll('#log .msg:not(.nexus)').length;
    if (step() !== 'talk') { userBase = -1; return; }
    if (userBase < 0) { userBase = n; return; }
    if (n > userBase) { var s = get(); s.talked = true; put(s); }
  }
  // 準備ができたら、案内は 12 秒で自動で閉じる（「案内」でいつでも出せる）
  var doneTimer = 0;
  function autoClose() {
    if (step() === 'done' && !doneTimer) doneTimer = setTimeout(function () { var s = get(); s.closed = true; put(s); render(); }, 12000);
  }
  // iPhone の Safari では load の合図が来ないことがある（2026-11-26 会長「ライセンスの案内すら出ない」）。合図を待たずに、読み込みの途中でも 1.5 秒で始める
  var started = false;
  function start() {
    if (started) return; started = true;
    try { localStorage.removeItem('nxVoiceEngine'); } catch (e) { }
    try { var vo = JSON.parse(localStorage.getItem('nexus.voice.v1') || '{}'); if (vo.sysVoice) { delete vo.sysVoice; localStorage.setItem('nexus.voice.v1', JSON.stringify(vo)); } } catch (e) { }
    setInterval(function () {
      wrap();
      if (linkSet && window.__mobileSubmit && wrap()) {
        var ls = linkSet, cfg = aiSettings(); linkSet = null;
        if (!licensed() || !groqKey(cfg) || !geminiKey(cfg)) window.__mobileSubmit('silent', ls);
      }
      watchTalk(); render(); autoClose();
    }, 800);
    addEventListener('nexus-ai-changed', render);
  }
  if (document.readyState === 'complete') start(); else { addEventListener('load', start); addEventListener('DOMContentLoaded', function () { setTimeout(start, 1500); }); setTimeout(start, 4000); }
})();
