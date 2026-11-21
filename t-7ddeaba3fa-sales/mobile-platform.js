'use strict';
// LINE の中のブラウザでは画面の下（送信ボタン）が隠れる（2026-11-19 会長）。LINE の決まりの印（openExternalBrowser=1）で Safari などに開き直す
try{if(/ Line\//i.test(navigator.userAgent)&&!/openExternalBrowser=1/.test(location.search)){location.replace(location.origin+location.pathname+'?openExternalBrowser=1'+location.hash);}}catch(_){}
// iPhone で落ちる対策（2026-11-15 会長「マイク使わずに落ちる」）：核のまわりの光を描く 7 枚の板（canvas）が、画面の細かさ（3 倍）で毎秒 60 回描き直していた
// → 板は普通の細かさ（1 倍）で描く（記憶はおよそ 9 分の 1）・描き直しは毎秒 30 回まで。見た目はほぼ変わらない。ページのほかの部品より先に読み込まれる
(function(){try{Object.defineProperty(window,'devicePixelRatio',{get:function(){return 1;},configurable:true});}catch(_){}
 try{var raf=window.requestAnimationFrame.bind(window),last=0,q=[],pending=false;
  var seq=0;window.requestAnimationFrame=function(cb){var id=++seq;q.push({id:id,cb:cb});if(!pending){pending=true;var tick=function(t){if(t-last<31){raf(tick);return;}last=t;pending=false;var run=q;q=[];for(var i=0;i<run.length;i++){try{run[i].cb(t);}catch(e){(function(err){setTimeout(function(){throw err;});})(e);}}};raf(tick);}return id;};
  window.cancelAnimationFrame=function(id){q=q.filter(function(x){return x.id!==id;});};}catch(_){}})();

window.__NEXUS_APP__=false;
window.NexusMobile=(()=>{
 const pcMessage='それはこのスマホ版ではできません。';
 const tools=new Set(['search_answer','ask_expert','add_memo','add_todo','remember','set_timer','set_reminder']);
 const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 const publicKey='r4L5fDGqcKdh0u0/k/eVlbrG83hFhZoW1JQW/oBbNOM=';
 async function verify(raw,save=true){try{
  const parts=raw.replace(/\s/g,'').split('.');if(parts.length!==3||parts[0]!=='NXL1')return {ok:false};
  const key=await crypto.subtle.importKey('raw',decode(publicKey),{name:'Ed25519'},false,['verify']);
  if(!await crypto.subtle.verify('Ed25519',key,decode(parts[2]),new TextEncoder().encode(parts[1])))return {ok:false};
  const p=JSON.parse(new TextDecoder().decode(decode(parts[1])));const tier=p.t||'standard';
  if(p.v!==1||p.e!=='sales'||typeof p.n!=='string'||!p.n||!['free','standard','pro','api'].includes(tier))return {ok:false};
  const r={ok:true,name:p.n,tier,maintenance_until:p.mu||''};window.__NX_LICENSE__=r;if(save)localStorage.setItem('nexus.mobile.license',raw.replace(/\s/g,''));return r;
 }catch(_){return {ok:false};}}
 const ready=(async()=>{try{const raw=localStorage.getItem('nexus.mobile.license');if(raw)await verify(raw,false);}catch(_){} })();
 // Only the selected AI provider receives its own API credentials. No analytics, proxy or key export.
 const nativeFetch=window.fetch.bind(window);
 const hosts=new Set(['generativelanguage.googleapis.com','api.groq.com','api.openai.com','api.anthropic.com','openrouter.ai','api.mistral.ai','api.cerebras.ai','api.deepseek.com','api.x.ai']);
 window.fetch=(input,init)=>{const u=new URL(typeof input==='string'?input:input.url,location.href);if(u.origin!==location.origin&&!hosts.has(u.hostname))return Promise.reject(new Error('スマホ版ではこの接続先は使えません'));return nativeFetch(input,init);};
 function isPC(s){if(/^[\x21-\x7e]{30,}$/.test(String(s).trim()))return false;if(/^(?:このアプリについて|アプリについて|情報|バージョン情報|クレジット|規約|利用規約|ライセンス|about)$/i.test(s.trim()))return false;if(/(?:画面|スクリーン).*(?:読んで|見て|読み取|認識)|(?:音量|明るさ).*(?:上げ|下げ|変え)|(?:メモ帳|notepad|Excel|エクセル|Word|ワード|フォルダ|ファイル|デスクトップ).*(?:開|書|保存|探|削除)|(?:アプリ|電卓).*(?:開|起動)|(?:PC|パソコン).*(?:操作|動か|消|切|再起動)/i.test(s))return true;return /(?:メモ帳|ノートパッド|notepad|エクセル|Excel|Word|ワード|電卓|アプリ|フォルダ|ファイル|デスクトップ|パソコン|PC|作業係|秘書|スクショ|スクリーンショット|クリップボード|画面を読|コピーした|明るさ|音量|ミュート|再起動|シャットダウン|ロックして|近道|いつも聞|マイクの感度|終了|閉じて)/i.test(s)&&!/(?:について|とは|やり方|方法|相談|なぜ|何故|教えて|ライセンス|このアプリについて|アプリについて)/.test(s)||/^(仕事|作業|タスク)[:：]/.test(s);}
 let recording=false,starting=false,stream=null,recorder=null,timer=0;
 // iPhone：マイクを使うと音の出口が「録音しながら話す」形（受話口・小さい音）になり、そのあと読み上げが聞こえなくなる → 録音の間だけ録音の形、終わったら再生（スピーカー）に戻す（2026-11-15 会長「声が出ない」）
 function audioMode(t){try{if(navigator.audioSession)navigator.audioSession.type=t;}catch(_){}}
 audioMode('playback');
 function relistenLater(button,before){button.classList.add('voice-on');const g=window.__nxRelGen=(window.__nxRelGen||0)+1;const t0=Date.now();let idleSince=0;const iv=setInterval(()=>{if(g!==window.__nxRelGen){clearInterval(iv);return;}if(!window.__nxHands){clearInterval(iv);button.classList.remove('voice-on');return;}const answered=document.querySelectorAll('#log .msg.nexus').length>before||Date.now()-t0>20000;const talking=(window.speechSynthesis&&speechSynthesis.speaking)||!!document.querySelector('.holo.speaking');if(answered&&!talking){if(!idleSince)idleSince=Date.now();else if(Date.now()-idleSince>700){clearInterval(iv);window.__nxRelisten=true;button.click();}}else idleSince=0;},200);}
 // 音を扱う部品（AudioContext）は一つだけ作って使い回す。毎回作って捨てると iPhone が落ちる（2026-11-15 会長「少し往復したら落ちる」）
 function sharedAC(){const C=window.AudioContext||window.webkitAudioContext;if(!window.__nxAC||window.__nxAC.state==='closed')window.__nxAC=new C();if(window.__nxAC.state==='suspended')window.__nxAC.resume().catch(()=>{});return window.__nxAC;}
 function release(){try{if(window.__nxVAD&&window.__nxVAD!==window.__nxAC&&window.__nxVAD.state!=='closed')window.__nxVAD.close().catch(()=>{});}catch(_){}window.__nxVAD=null;clearTimeout(timer);stream?.getTracks().forEach(t=>t.stop());stream=null;recording=false;audioMode('playback');
  // 2026-11-20 会長「マイク押さなくても声が大きくなった」：使い回す音の部品が動いたままだと、iPhone が通話用の音の出口のままになり声が大きくなる。録音が終わったら止めておく（次に Mic を押すと動かし直す）
  try{if(window.__nxAC&&window.__nxAC.state==='running')window.__nxAC.suspend().catch(()=>{});}catch(_){}}
 function attachMic(button,send,tell){window.__nxTell=tell;button.title='押して録音、もう一度押して送信';button.setAttribute('aria-pressed','false');button.addEventListener('click',async()=>{
  // iPhone：キーボードの音声入力（マイクの印）がいちばん確実に聞き取る。Mic は入力欄を開いて案内するだけ（2026-11-15 会長）
  // iPhone：AI の鍵があれば、キーボードを出さずに録音して AI で文字にする（話し終えると自動で送る）。鍵がなければキーボードの音声入力（2026-11-15 会長「マイクオンの時はキーボード出したくない」）
  const isIOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const aiOn=(()=>{try{return !!(window.NexusAI&&NexusAI.enabled());}catch(_){return false;}})();
  if(isIOS&&!aiOn&&!recording){const ed=document.getElementById('typingStatus');if(ed){try{ed.focus();}catch(_){}button.classList.add('voice-on');button.setAttribute('aria-pressed','true');if(!ed.__nxMicOff){ed.__nxMicOff=1;ed.addEventListener('blur',()=>{button.classList.remove('voice-on');button.setAttribute('aria-pressed','false');});}}if(!window.__nxDictHint){window.__nxDictHint=1;tell('キーボードの右下（または左下）のマイクの印を押して話してください。話し終えたら、もう一度マイクの印を押して「送信」を押します。');}return;}
  // 会話モード（2026-11-15 会長「一回一回オンオフは面倒」）：一度押せば、話す→黙ると送る→答え終えたらまた聞く、を続ける。もう一度押すと終わる
  const relisten=!!window.__nxRelisten;window.__nxRelisten=false;
  const talkingNow=(window.speechSynthesis&&speechSynthesis.speaking)||!!document.querySelector('.holo.speaking');if(!relisten)window.__nxRelGen=(window.__nxRelGen||0)+1;
  if(!relisten&&window.__nxHands&&!recording&&!talkingNow){window.__nxHands=false;button.classList.remove('voice-on');button.setAttribute('aria-pressed','false');tell('会話を終えました。');return;}
  if(starting)return;if(recording){window.__nxHands=false;recorder.stop();return;}
  if(!relisten){try{window.__nxInterrupt&&window.__nxInterrupt();}catch(_){}}   // 2026-11-20 会長「返信中マイクを押すと声が大きくなる」：返事の最中なら先に止めてから聞く
  if(!relisten){window.__nxHands=true;window.__nxHandsAt=Date.now();}
  if(!window.__NX_LICENSE__?.ok){tell('購入時のライセンスの鍵を入力してください。');return;}
  // iPhone などは端末の音声認識（鍵なし・速い）を先に使う。使えないときだけ録音して AI で文字にする
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  // ホーム画面から開いたアプリ（iPhone）では音声認識が使えないことが多いので、はじめから録音して AI で文字にする
  const standalone=navigator.standalone===true||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
  if(SR&&!window.__nxNoSR&&!standalone&&!isIOS){starting=true;try{const r=new SR();r.lang='ja-JP';r.interimResults=true;r.continuous=false;r.maxAlternatives=1;let fin='',got=false;recorder={stop:()=>{try{r.stop();}catch(_){}}};
   r.onresult=e=>{let t='';for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;fin=t;got=true;const ed=document.getElementById('typingStatus');if(ed)ed.textContent=t;};
   r.onerror=e=>{const m={'not-allowed':'マイクか音声認識が許可されていません。iPhone の「設定」→「Safari」→「マイク」と、「設定」→「プライバシー」→「音声認識」を確かめてください。','service-not-allowed':'この画面では音声認識が使えません。録音のやり方に切り替えます。もう一度 Mic を押してください。','no-speech':'声が聞こえませんでした。もう一度 Mic を押して話してください。','audio-capture':'マイクが見つかりません。'}[e.error]||('音声認識が止まりました（'+e.error+'）。');if(e.error!=='no-speech'&&e.error!=='aborted'){window.__nxNoSR=true;m+=' 次に Mic を押すと、録音して AI で文字にするやり方に切り替えます。';}tell(m);};
   r.onend=()=>{recording=false;starting=false;button.classList.remove('voice-on');button.setAttribute('aria-pressed','false');const t=fin.trim();if(got&&t){const ed=document.getElementById('typingStatus');if(ed)ed.textContent='';window.__mobileSubmit('voice',t);}};
   r.start();recording=true;button.classList.add('voice-on');button.setAttribute('aria-pressed','true');}catch(e){window.__nxNoSR=true;tell('音声認識を始められませんでした（'+(e.message||e)+'）。もう一度 Mic を押すと録音のやり方で聞きます。');}finally{starting=false;}return;}
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){tell('このブラウザでは録音できません。HTTPS 接続とマイクの許可を確かめてください。');return;}
  starting=true;
  // iPhone は「押したその瞬間」に作った音の部品しか動かさない → 待つ前に作って起こしておく（2026-11-15 会長「話しただけでは何も答えない」）
  let ac0=null;try{ac0=sharedAC();window.__nxVAD=ac0;}catch(_){}   // 2026-11-19 会長「めちゃくちゃ落ちる」：押すたびに作らず、一つを使い回す（押した瞬間に起こすのは同じ）
  window.__nxAutoTurn=relisten;
  // 2026-11-20 会長「発話中マイク押すとまだ声が大きくなる」：返事の声が止まりきってから録音に切り替える（止まる前に切り替わると、残りの声が大きく聞こえる）
  for(let i=0;i<20&&window.speechSynthesis&&(speechSynthesis.speaking||speechSynthesis.pending);i++){try{speechSynthesis.pause();speechSynthesis.cancel();}catch(_){}await new Promise(r=>setTimeout(r,50));}
  try{audioMode('play-and-record');stream=await navigator.mediaDevices.getUserMedia({audio:true});const chunks=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=async()=>{const blob=new Blob(chunks,{type:recorder.mimeType});release();button.classList.remove('voice-on');button.setAttribute('aria-pressed','false');try{const OC0=window.OfflineAudioContext||window.webkitOfflineAudioContext;const dctx=new OC0(1,16000,16000);const ab=await blob.arrayBuffer();const audio=await new Promise((ok,ng)=>{const r=dctx.decodeAudioData(ab,ok,ng);if(r&&r.then)r.then(ok,ng);});const rate=16000;let mono;try{const OC=window.OfflineAudioContext||window.webkitOfflineAudioContext;const oc=new OC(1,Math.max(1,Math.ceil(audio.duration*rate)),rate);const sn=oc.createBufferSource();sn.buffer=audio;sn.connect(oc.destination);sn.start();mono=(await oc.startRendering()).getChannelData(0);}catch(_){const ch=audio.getChannelData(0),m=Math.floor(audio.duration*rate);mono=new Float32Array(m);for(let i=0;i<m;i++)mono[i]=ch[Math.min(ch.length-1,Math.floor(i*audio.sampleRate/rate))];}
   // 声を聞き取りやすい大きさにそろえる（小さすぎる録音は大きく）
   let pk=0;for(let i=0;i<mono.length;i++){const a2=Math.abs(mono[i]);if(a2>pk)pk=a2;}const gain=pk>0.001?Math.min(8,0.9/pk):1;
   // 2026-11-20 会長「何も喋ってないのにエンジン・クランク・ストーマ」：録音そのものに声が入っているかを測る。20ms ごとの大きさで、まわりの音（静かな方から1割の値）の4倍かつ 0.01 を超える所が合わせて 0.25 秒ない録音は、聞き取りに送らない（無音だと聞き取りが言葉を作る）
   {const fl=320,rs=[];for(let i=0;i+fl<=mono.length;i+=fl){let e=0;for(let k=i;k<i+fl;k++)e+=mono[k]*mono[k];rs.push(Math.sqrt(e/fl));}const md=rs.slice().sort((x,y)=>x-y)[Math.floor(rs.length/10)]||0,auto=!!window.__nxAutoTurn,th=Math.max(auto?0.012:0.01,md*(auto?5:4));const loud=rs.filter(x=>x>th).length*20;window.__nxLoud=loud+"ms/"+md.toFixed(4)+"/"+pk.toFixed(3);if(loud<(auto?400:250)){const vh=window.__nxHeard===true;window.__nxDiscard=false;window.__nxHeard=null;if(vh&&auto)tell('声が小さくて聞き取れませんでした。もう少し大きな声でどうぞ。');if((window.__nxHands&&Date.now()-(window.__nxHandsAt||0)<120000))relistenLater(button,-1);else{window.__nxHands=false;tell("声が聞こえませんでした。もう一度 Mic を押して話してください。");}return;}}
   const n=mono.length,buf=new ArrayBuffer(44+n*2),v=new DataView(buf);const str=(o,s)=>[...s].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));str(0,'RIFF');v.setUint32(4,36+n*2,true);str(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,n*2,true);
   for(let i=0;i<n;i++){let x=mono[i]*gain;x=Math.max(-1,Math.min(1,x));v.setInt16(44+i*2,x<0?x*32768:x*32767,true);}const bytes=new Uint8Array(buf);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));if(window.__nxHeard===false){window.__nxHeard=null;window.__nxDiscard=false;if((window.__nxHands&&Date.now()-(window.__nxHandsAt||0)<120000))relistenLater(button,-1);else if(window.__nxHands){window.__nxHands=false;tell('しばらく声が無かったので、会話を終えました。');}}else if(window.__nxDiscard){window.__nxDiscard=false;}else{const before=document.querySelectorAll('#log .msg.nexus').length;window.__nxT={mic:performance.now()};window.__nxHandsAt=Date.now();await send(btoa(binary));if(window.__nxHands)relistenLater(button,before);}}catch(_){tell('録音した声を読み込めませんでした。文字入力をお使いください。');}};recorder.onerror=()=>{release();button.setAttribute('aria-pressed','false');button.classList.remove('voice-on');tell('録音できませんでした。もう一度お試しください。');};try{const a=document.activeElement;if(a&&a.blur)a.blur();}catch(_){}recorder.start();recording=true;button.classList.add('voice-on');button.setAttribute('aria-pressed','true');timer=setTimeout(()=>{if(recording)recorder.stop();},60000);if(!window.__nxRecHint){window.__nxRecHint=1;tell('聞いています。話し終えて少し黙ると自動で送り、答えたらまた聞きます。終えるときは Mic をもう一度押してください。');}
   // 話し終えたら自動で送る：まわりの音の大きさを最初に測り、それより大きい声が 0.4 秒以上続いたあと、1.6 秒黙ったら送る（話の途中の短い間では切らない）。12 秒声がなければ会話を終える
   try{const ac=ac0||new (window.AudioContext||window.webkitAudioContext)();window.__nxVAD=ac;if(ac.state==='suspended')ac.resume().catch(()=>{});const src=ac.createMediaStreamSource(stream);const an=ac.createAnalyser();an.fftSize=1024;src.connect(an);const buf2=new Float32Array(an.fftSize);const t0=Date.now();window.__nxHeard=false;let floor=0,nf=0,voiced=0,lastLoud=0,heard=false,prev=t0,maxR=0,warned=false;
    const tick=()=>{if(!recording){try{src.disconnect();an.disconnect();if(ac!==window.__nxAC&&ac.state!=='closed')ac.close().catch(()=>{});}catch(_){}return;}an.getFloatTimeDomainData(buf2);let r=0;for(let i=0;i<buf2.length;i++)r+=buf2[i]*buf2[i];r=Math.sqrt(r/buf2.length);const now=Date.now(),dt=now-prev;prev=now;
     if(now-t0<350){floor=nf?Math.min(floor,r):r;nf++;if(r>0.03){voiced+=dt;lastLoud=now;}requestAnimationFrame(tick);return;}
     const th=Math.min(0.03,Math.max(0.01,floor*2.6));if(r>maxR)maxR=r;if(!warned&&now-t0>2500&&maxR<1e-5){warned=true;window.__nxHeard=null;tell('いまは話し終えを自動で見分けられません。話し終えたら、もう一度 Mic を押してください。');}if(warned){requestAnimationFrame(tick);return;}
     if(r>th){voiced+=dt;lastLoud=now;if(voiced>400){heard=true;window.__nxHeard=true;}}
     if(heard&&now-lastLoud>1600){try{recorder.stop();}catch(_){}try{src.disconnect();an.disconnect();if(ac!==window.__nxAC&&ac.state!=='closed')ac.close().catch(()=>{});}catch(_){}return;}
     if(!heard&&now-t0>12000){try{recorder.stop();}catch(_){}try{src.disconnect();an.disconnect();if(ac!==window.__nxAC&&ac.state!=='closed')ac.close().catch(()=>{});}catch(_){}return;}
     requestAnimationFrame(tick);};tick();}catch(_){}
  }catch(e){try{if(ac0&&ac0!==window.__nxAC&&ac0.state!=='closed')ac0.close().catch(()=>{});}catch(_){}release();tell('マイクを使えません（'+((e&&(e.name||e.message))||e)+'）。ブラウザのマイク許可を確かめてください。');}finally{starting=false;}
 });document.addEventListener('visibilitychange',()=>{if(document.hidden&&recording)recorder.stop();});}
 function diagnosis(){return ['NEXUS v215（スマホ販売版・印 '+((document.querySelector('meta[name=nexus-build]')||{}).content||'なし')+'）','ライセンス：'+(window.__NX_LICENSE__?.ok?'確認済み':'未確認'),'AI：'+(window.NexusAI?.enabled()?'設定済み（通信の成功は未確認）':'未設定'),'マイク：ボタンで録音（実際の録音は未確認）','読み上げ：'+('speechSynthesis'in window?'ブラウザ対応（発声は未確認）':'未対応'),'音の出口：'+(navigator.audioSession?navigator.audioSession.type:'指定できない（iOS が古い）'),'声：'+(window.nxKokoro&&nxKokoro.on()?'新しい声（スマホの中で作る声）':'iPhone の標準の声')+'・声の鍵 '+(window.__nxSpeechUnlocked?'開いた':'まだ（画面を押すと開く）')+'・日本語の声 '+((window.speechSynthesis?speechSynthesis.getVoices():[]).filter(v=>/^ja/i.test(v.lang)).map(v=>v.name).join('、')||'なし'),'調べもの：通信の成功は未確認','ネットワーク：'+(navigator.onLine?'接続表示あり':'オフライン'),nxTimesLine()].join('\n');}
 addEventListener('load',()=>{ready.then(()=>window.NexusThemes?.apply());const editor=document.getElementById('typingStatus');editor.setAttribute('enterkeyhint','enter');editor.setAttribute('autocapitalize','off');const voice=document.getElementById('recordingBtn');if(voice){editor.parentElement.append(voice);voice.style.setProperty('display','inline-flex','important');}const send=document.createElement('button');send.type='button';send.className='tool-btn';send.textContent='送信';send.addEventListener('click',()=>window.__mobileSubmit('silent',editor.textContent));editor.parentElement.append(send);document.querySelectorAll('input[value=ollama],input[value=openai]').forEach(e=>e.closest('label')?.setAttribute('hidden','')); document.querySelectorAll('[data-cmd]').forEach(b=>{if(isPC(b.dataset.cmd))b.hidden=true;});});
 return {pcMessage,tools,isPC,verify,ready,attachMic,diagnosis};
})();

// iPhone：核の動画が流れ始めてから核を出す（流れる前はオレンジの四角に見える）
(function () {
  function hook() {
    var box = document.getElementById('nxCore2'); var v = box && box.querySelector('video');
    if (!v) return false;
    var on = function () { box.classList.add('nx-playing'); };
    if (!v.paused && v.readyState >= 2) on(); else v.addEventListener('playing', on, { once: true });
    return true;
  }
  var n = 0, t = setInterval(function () { if (hook() || ++n > 120) clearInterval(t); }, 250);
})();

// 版と VOICE OUT を入力欄の下の一行に移す
addEventListener('load',function(){setTimeout(function(){var area=document.querySelector('.input-area');if(!area||document.getElementById('nxFoot'))return;var f=document.createElement('div');f.id='nxFoot';var ed=document.getElementById('nxEdition'),vo=document.getElementById('recordingBtn');f.append(ed||document.createElement('span'));if(vo)f.append(vo);area.append(f);},300);});

// スマホ版：押したときの説明の吹き出し（PC 向けの title）は出さない（2026-11-15 会長）
(function(){function strip(root){try{(root.querySelectorAll?root:document).querySelectorAll('[title]').forEach(function(e){e.removeAttribute('title');});if(root.removeAttribute&&root.hasAttribute&&root.hasAttribute('title'))root.removeAttribute('title');}catch(_){}}
addEventListener('load',function(){strip(document);new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='attributes'&&m.attributeName==='title')m.target.removeAttribute('title');m.addedNodes&&m.addedNodes.forEach(function(n){if(n.nodeType===1)strip(n);});});}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['title']});});})();

// iPhone は、アプリを裏に回すときの画面を覚えておき、次に開くときまずそれを見せる。その「覚えた画面」が NEXUS の画面だと、
// 起動のたびに NEXUS の画面が一瞬見えてから起動画面になる → 裏に回る瞬間だけ起動画面と同じ暗い幕をかけて、覚える画面を暗くする（2026-11-15 会長）
(function(){var c=null;function cover(on){if(!c){c=document.createElement('div');c.id='nxCover';c.style.cssText='position:fixed;inset:0;z-index:2147483647;background:radial-gradient(circle at 50% 46%,rgba(23,96,138,.32),transparent 42%),#01030a;display:none;pointer-events:none';document.body.appendChild(c);}c.style.display=on?'block':'none';}
document.addEventListener('visibilitychange',function(){if(document.hidden)cover(true);else setTimeout(function(){cover(false);},250);});
addEventListener('pagehide',function(){cover(true);});addEventListener('pageshow',function(){setTimeout(function(){cover(false);},250);});})();

// iPhone は「最初の一言を、指で押したその瞬間に出した場合だけ」あとの声を許す → 最初に画面を押した瞬間に、聞こえない一言で声の鍵を開ける。
// 押す前に出そうとして黙った最初のあいさつは、そのあとで読み直す（2026-11-15 会長「最初の挨拶は毎回声無し」「直すたびに声が出なくなる」）
(function(){var t0=Date.now();try{var sp=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=function(u){try{u.addEventListener('start',function(){if((u.text||'').trim())window.__nxSpokeOnce=true;});}catch(_){}return sp(u);};}catch(_){}
 // 起動画面を押したその瞬間に、あいさつ（決まった文）をそのまま読む。待たない（2026-11-15 会長「最初の挨拶はテンプレートだから簡単なはず」）
 function greet(){var h=new Date().getHours();return (h<10?'おはようございます':h<18?'こんにちは':'こんばんは')+'、マスター。';}
 function unlock(){if(window.__nxSpeechUnlocked||!window.speechSynthesis||window.__nxBootHold)return;   /* 2026-11-20：会長用の起動ロゴの光の間は、起動画面の側があいさつを受け持つ */
  window.__nxSpeechUnlocked=true;
  var on=true;try{on=JSON.parse(localStorage.getItem('nexus.jarvis.v1')||'{}').speakAlways!==false;}catch(_){}
  try{speechSynthesis.cancel();var m=document.querySelector('#log .msg.nexus');var t=m?(m.innerText||'').replace(/^NEXUS\s*/,'').trim():'';if(!t||t.length>60)t=greet();
   var u=new SpeechSynthesisUtterance(on&&Date.now()-t0<30000?t:' ');u.lang='ja-JP';if(!(on&&Date.now()-t0<30000))u.volume=0;speechSynthesis.speak(u);}catch(_){}}
 ['touchend','click','keydown'].forEach(function(ev){document.addEventListener(ev,unlock,{capture:true,passive:true});});})();

// 直前のやりとりの秒数（聞き取り・答えの文字・声が出るまで）。端末の中だけで、どこにも送らない
(function(){
 const sec=(a,b)=>a&&b&&b>=a?((b-a)/1000).toFixed(1)+'秒':'―';
 window.nxTimesLine=function(){const t=window.__nxTL||{};return '直前のやりとり：聞き取り '+sec(t.mic,t.sent)+'・答えの文字まで '+sec(t.sent,t.answer)+'・声が出るまで '+sec(t.answer,t.voice);};
 const wrap=()=>{const f=window.__mobileSubmit;if(!f||window.__nxTimedOnce)return;window.__nxTimedOnce=true;const w=function(mode,text){const t=window.__nxT||{};if(!(window.__nxTL&&performance.now()-window.__nxTL.sent<300)&&String(text||'').trim()&&!/^(診断|案内)$/.test(String(text).trim())){window.__nxTL={mic:t.mic||0,sent:performance.now(),answer:0,voice:0};window.__nxT={};}return f.apply(this,arguments);};w.__nxTimed=true;window.__mobileSubmit=w;};
 setInterval(wrap,500);
 new MutationObserver(()=>{const t=window.__nxTL;if(t&&t.sent&&!t.answer&&document.querySelector('#log .msg.nexus:last-child'))t.answer=performance.now();}).observe(document.documentElement,{childList:true,subtree:true});
 try{const sp=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=function(u){try{u.addEventListener('start',()=>{const t=window.__nxTL;if(t&&t.answer&&!t.voice)t.voice=performance.now();});}catch(_){}return sp(u);};}catch(_){}
})();
