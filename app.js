(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var OWNER = document.body.getAttribute('data-mode') === 'owner';
  var CFG = window.GALAKSI || {};
  var BUCKET = 'galaksi';
  var sb = null;
  if (window.supabase && CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY && String(CFG.SUPABASE_URL).indexOf('GANTI') < 0) {
    sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
  }

  /* ---------- Latar bintang ---------- */
  var cv = $('#stars'), cx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, stars = [], shoot = null, nextShoot = 4000;
  var TINTS = ['255,255,255', '255,225,170', '190,175,255', '160,220,255', '255,170,205'];
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(320, Math.round(W * H / 5200));
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + .25, p: Math.random() * 6.28,
        s: Math.random() * 1.6 + .4, d: Math.random() * .1 + .01, t: TINTS[(Math.random() * TINTS.length) | 0] });
    }
    if (RM) draw(0);
  }
  /* Ledakan galaksi acak di latar */
  var blasts = [], nextBlast = 1800;
  var BLAST_HUES = [[268, 330], [200, 290], [325, 45], [185, 265], [45, 330]];
  function spawnBlast(t) {
    var hh = BLAST_HUES[(Math.random() * BLAST_HUES.length) | 0], sp = [];
    for (var i = 0; i < 28; i++) sp.push({ a: Math.random() * 6.2832, v: .35 + Math.random() * .8, r: .6 + Math.random() * 1.6 });
    blasts.push({ x: Math.random() * W, y: Math.random() * H, t0: t, R: (W < 720 ? 70 : 100) + Math.random() * 150, h1: hh[0], h2: hh[1], dur: 3000 + Math.random() * 2400, sp: sp, spin: Math.random() < .5 ? 1 : -1 });
  }
  function drawBlasts(t) {
    if (t > nextBlast && blasts.length < 3) { spawnBlast(t); nextBlast = t + 2200 + Math.random() * 3800; }
    cx.save(); cx.globalCompositeOperation = 'lighter';
    for (var i = blasts.length - 1; i >= 0; i--) {
      var b = blasts[i], k = (t - b.t0) / b.dur;
      if (k >= 1) { blasts.splice(i, 1); continue; }
      var e = 1 - Math.pow(1 - k, 3), fade = 1 - k, r = b.R * (.2 + .8 * e);
      var g = cx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      g.addColorStop(0, 'hsla(' + b.h2 + ',100%,88%,' + (fade * .5).toFixed(3) + ')');
      g.addColorStop(.35, 'hsla(' + b.h1 + ',90%,62%,' + (fade * .3).toFixed(3) + ')');
      g.addColorStop(1, 'hsla(' + b.h2 + ',90%,60%,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(b.x, b.y, r, 0, 6.2832); cx.fill();
      if (k < .12) {
        cx.fillStyle = 'rgba(255,250,235,' + ((1 - k / .12) * .9).toFixed(3) + ')';
        cx.beginPath(); cx.arc(b.x, b.y, 3 + 10 * (k / .12), 0, 6.2832); cx.fill();
      }
      cx.strokeStyle = 'hsla(' + b.h1 + ',90%,76%,' + (fade * .5).toFixed(3) + ')'; cx.lineWidth = 1.4;
      cx.beginPath(); cx.arc(b.x, b.y, b.R * 1.15 * e, 0, 6.2832); cx.stroke();
      for (var arm = 0; arm < 2; arm++) {
        for (var j = 1; j <= 22; j++) {
          var rr = b.R * .95 * e * (j / 22), th = arm * 3.1416 + j * .24 * b.spin + k * 2.4 * b.spin;
          cx.fillStyle = 'hsla(' + (j % 2 ? b.h1 : b.h2) + ',95%,80%,' + (fade * (.85 - j / 34)).toFixed(3) + ')';
          cx.beginPath(); cx.arc(b.x + Math.cos(th) * rr, b.y + Math.sin(th) * rr * .62, 1.3, 0, 6.2832); cx.fill();
        }
      }
      for (var s = 0; s < b.sp.length; s++) {
        var q = b.sp[s], d = q.v * b.R * 1.25 * e;
        cx.fillStyle = 'hsla(' + b.h2 + ',100%,85%,' + (fade * .9).toFixed(3) + ')';
        cx.beginPath(); cx.arc(b.x + Math.cos(q.a) * d, b.y + Math.sin(q.a) * d, q.r, 0, 6.2832); cx.fill();
      }
    }
    cx.restore();
  }
  function draw(t) {
    cx.clearRect(0, 0, W, H);
    var sy = window.scrollY || 0;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var y = (((s.y - sy * s.d) % H) + H) % H;
      var a = RM ? .7 : .3 + .7 * (.5 + .5 * Math.sin(t / 1000 * s.s + s.p));
      cx.fillStyle = 'rgba(' + s.t + ',' + a.toFixed(3) + ')';
      cx.beginPath(); cx.arc(s.x, y, s.r, 0, 6.2832); cx.fill();
    }
    if (!RM) drawBlasts(t);
    if (!RM) {
      if (!shoot && t > nextShoot) {
        shoot = { x: Math.random() * W * .8 + W * .15, y: Math.random() * H * .4, l: 0 };
        nextShoot = t + 6000 + Math.random() * 7000;
      }
      if (shoot) {
        shoot.l += 14; shoot.x += 9; shoot.y += 5;
        var g = cx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.l, shoot.y - shoot.l * .55);
        g.addColorStop(0, 'rgba(255,240,200,.9)'); g.addColorStop(1, 'rgba(255,240,200,0)');
        cx.strokeStyle = g; cx.lineWidth = 1.5; cx.beginPath();
        cx.moveTo(shoot.x, shoot.y); cx.lineTo(shoot.x - shoot.l, shoot.y - shoot.l * .55); cx.stroke();
        if (shoot.l > 150 || shoot.x > W + 50) shoot = null;
      }
      requestAnimationFrame(draw);
    }
  }
  window.addEventListener('resize', resize);
  resize();
  if (!RM) requestAnimationFrame(draw);

  /* ---------- Ledakan yang membentuk kenangan ---------- */
  var bc = document.createElement('canvas');
  bc.setAttribute('aria-hidden', 'true');
  bc.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:3;pointer-events:none';
  document.body.appendChild(bc);
  var bx = bc.getContext('2d'), parts = [], rings = [], bRun = false, revealed = {};
  function sizeBurst() {
    bc.width = Math.round(window.innerWidth * dpr); bc.height = Math.round(window.innerHeight * dpr);
    bx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeBurst();
  window.addEventListener('resize', sizeBurst);
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeIO(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  var T_EXPLODE = 420, T_GATHER = 1250, T_FADE = 260;
  function spawnBurst(node, card, hue, big) {
    if (RM || !node) return;
    var nr = node.getBoundingClientRect(), sx = window.scrollX, sy = window.scrollY, now = performance.now();
    var ox = nr.left + nr.width / 2 + sx, oy = nr.top + nr.height / 2 + sy;
    var cr = card ? card.getBoundingClientRect() : null;
    var n = big ? 120 : (window.innerWidth < 720 ? 46 : 84);
    var cols = ['hsl(' + hue + ',95%,76%)', '#ffe7a8', '#ffffff', '#9fdcff', 'hsl(' + ((hue + 40) % 360) + ',90%,70%)'];
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.2832, reach = (big ? 90 : 40) + Math.random() * (big ? 260 : 150);
      var p = { ox: ox, oy: oy, ex: ox + Math.cos(a) * reach, ey: oy + Math.sin(a) * reach, t0: now + Math.random() * 90,
        r: .8 + Math.random() * 2.1, c: cols[(Math.random() * cols.length) | 0], sw: (Math.random() - .5) * 90 };
      if (cr) { p.tx = cr.left + sx + Math.random() * cr.width; p.ty = cr.top + sy + Math.random() * cr.height; }
      else { p.tx = p.ex + (p.ex - ox) * .7; p.ty = p.ey + (p.ey - oy) * .7; }
      parts.push(p);
    }
    rings.push({ x: ox, y: oy, t0: now, hue: hue, big: !!big });
    if (!bRun) { bRun = true; requestAnimationFrame(burstLoop); }
  }
  function burstLoop(now) {
    var w = window.innerWidth, h = window.innerHeight, sx = window.scrollX, sy = window.scrollY;
    bx.clearRect(0, 0, w, h);
    bx.save(); bx.globalCompositeOperation = 'lighter';
    for (var i = rings.length - 1; i >= 0; i--) {
      var rg = rings[i], age = now - rg.t0;
      if (age < 0) continue;
      if (age > 900) { rings.splice(i, 1); continue; }
      var X = rg.x - sx, Y = rg.y - sy;
      if (age < 480) {
        var f = bx.createRadialGradient(X, Y, 0, X, Y, rg.big ? 110 : 70);
        f.addColorStop(0, 'rgba(255,250,235,' + ((1 - age / 480) * .85).toFixed(3) + ')');
        f.addColorStop(1, 'rgba(255,200,230,0)');
        bx.fillStyle = f; bx.beginPath(); bx.arc(X, Y, rg.big ? 110 : 70, 0, 6.2832); bx.fill();
      }
      bx.strokeStyle = 'hsla(' + rg.hue + ',95%,78%,' + ((1 - age / 900) * .7).toFixed(3) + ')'; bx.lineWidth = 2;
      bx.beginPath(); bx.arc(X, Y, 8 + easeOut(age / 900) * (rg.big ? 230 : 130), 0, 6.2832); bx.stroke();
    }
    for (var j = parts.length - 1; j >= 0; j--) {
      var p = parts[j], t = now - p.t0;
      if (t < 0) continue;
      if (t > T_GATHER + T_FADE) { parts.splice(j, 1); continue; }
      var x, y, al = 1, size = p.r;
      if (t < T_EXPLODE) {
        var k = easeOut(t / T_EXPLODE);
        x = p.ox + (p.ex - p.ox) * k; y = p.oy + (p.ey - p.oy) * k;
      } else {
        var q = easeIO(Math.min(1, (t - T_EXPLODE) / (T_GATHER - T_EXPLODE)));
        var dx = p.tx - p.ex, dy = p.ty - p.ey, len = Math.sqrt(dx * dx + dy * dy) || 1, bend = Math.sin(q * 3.1416) * p.sw;
        x = p.ex + dx * q - (dy / len) * bend; y = p.ey + dy * q + (dx / len) * bend;
        size = p.r * (1 - .45 * q);
        if (t > T_GATHER) al = 1 - (t - T_GATHER) / T_FADE;
      }
      var gx = x - sx, gy = y - sy;
      if (gx < -20 || gy < -20 || gx > w + 20 || gy > h + 20) continue;
      bx.fillStyle = p.c; bx.globalAlpha = Math.max(0, al) * .28;
      bx.beginPath(); bx.arc(gx, gy, size * 3, 0, 6.2832); bx.fill();
      bx.globalAlpha = Math.max(0, al);
      bx.beginPath(); bx.arc(gx, gy, size, 0, 6.2832); bx.fill();
    }
    bx.restore();
    if (parts.length || rings.length) requestAnimationFrame(burstLoop);
    else { bRun = false; bx.clearRect(0, 0, w, h); }
  }
  function reveal(li) {
    revealed[li.getAttribute('data-id')] = true;
    li._st = 'revealing';
    var node = li.querySelector('.node'), nr = node.getBoundingClientRect();
    var off = nr.bottom < 0 || nr.top > window.innerHeight;
    var hue = parseInt(li.style.getPropertyValue('--hue'), 10) || 330;
    if (!off) spawnBurst(node, li.querySelector('.card'), hue, false);
    setTimeout(function () { li.classList.add('seen'); li._st = 'in'; }, off ? 0 : 380);
  }
  /* Kebalikan ledakan: kartu hancur jadi butiran bintang, lalu menyatu ke planet di jalur */
  function spawnDissolve(card, node, hue) {
    var nr = node.getBoundingClientRect(), cr = card.getBoundingClientRect(), vh = window.innerHeight;
    if (cr.top > vh || cr.bottom < 0) return;
    var sx = window.scrollX, sy = window.scrollY, now = performance.now();
    var tx = nr.left + nr.width / 2 + sx, ty = nr.top + nr.height / 2 + sy;
    var top = Math.max(cr.top, 0), bottom = Math.min(cr.bottom, vh);
    var n = window.innerWidth < 720 ? 44 : 80;
    var cols = ['hsl(' + hue + ',95%,76%)', '#ffe7a8', '#ffffff', '#9fdcff', 'hsl(' + ((hue + 40) % 360) + ',90%,70%)'];
    for (var i = 0; i < n; i++) {
      var px = cr.left + sx + Math.random() * cr.width, py = top + sy + Math.random() * Math.max(1, bottom - top);
      var a = Math.random() * 6.2832, d = 10 + Math.random() * 34;
      parts.push({ ox: px, oy: py, ex: px + Math.cos(a) * d, ey: py + Math.sin(a) * d, tx: tx, ty: ty, t0: now + Math.random() * 160,
        r: .8 + Math.random() * 2.2, c: cols[(Math.random() * cols.length) | 0], sw: (Math.random() - .5) * 110 });
    }
    rings.push({ x: tx, y: ty, t0: now + T_GATHER - 80, hue: hue, big: false });
    if (!bRun) { bRun = true; requestAnimationFrame(burstLoop); }
  }
  function dissolve(li) {
    revealed[li.getAttribute('data-id')] = false;
    li._st = 'dissolving';
    var node = li.querySelector('.node'), card = li.querySelector('.card');
    var hue = parseInt(li.style.getPropertyValue('--hue'), 10) || 330;
    if (!RM) spawnDissolve(card, node, hue);
    li.classList.remove('seen');
    setTimeout(function () { li._st = 'out'; }, 1300);
  }

  /* ---------- Data & util ---------- */
  var state = { items: [], meta: {}, songs: [], songsErr: false, mediaErr: false, ready: false, loadError: false, session: null };
  var pendingFocus = null;
  var HUES = [330, 265, 200, 45, 295, 185];
  var SAMPLES = [
    { id: 's1', title: 'Pertama kali bertemu', event_date: '2025-03-14', description: 'Ini contoh. Tulis di sini bagaimana kalian pertama kali bertemu, di mana, dan apa kesan pertamanya.' },
    { id: 's2', title: 'Perjalanan pertama berdua', event_date: '2025-08-02', description: 'Ini contoh. Ceritakan tempat yang kalian datangi, makanan yang dicoba, dan hal kecil yang bikin tertawa.' },
    { id: 's3', title: 'Hari yang kita rayakan', event_date: '2026-02-14', description: 'Ini contoh. Tambahkan foto kalian lewat tombol Tambah kenangan, lengkap dengan judul dan cerita.' }
  ];

  function editing() { return OWNER && !!state.session; }
  function parseD(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN; }
  function fmtD(s) {
    var t = parseD(s); if (isNaN(t)) return '';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(t);
  }
  function todayISO() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function dayNo(s) {
    var a = parseD(state.meta.start_date), b = parseD(s);
    if (isNaN(a) || isNaN(b) || b < a) return null;
    return Math.round((b - a) / 864e5) + 1;
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function publicUrl(path) { return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl; }
  /* Daftar media satu kenangan: dari tabel memory_media, atau foto/video tunggal lama */
  function mediaOf(it) {
    if (it.media && it.media.length) return it.media;
    if (it.photo_path) return [{ path: it.photo_path, type: it.media_type === 'video' ? 'video' : 'image' }];
    return [];
  }
  function hasMedia(it) { return mediaOf(it).length > 0 && !!sb; }
  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  function setStatus(id, text, err) { var s = $(id); if (!s) return; s.textContent = text || ''; s.className = 'status' + (err ? ' err' : ''); }
  function errText(e) {
    var m = String((e && (e.message || e.error_description)) || '');
    if (/songs/i.test(m) && /schema cache|does not exist|relation/i.test(m)) return 'Daftar lagu belum aktif. Jalankan supabase/migration-musik.sql di SQL Editor Supabase.';
    if (/memory_media/i.test(m) && /schema cache|does not exist|relation/i.test(m)) return 'Galeri belum aktif. Jalankan supabase/migration-galeri.sql di SQL Editor Supabase.';
    if (/media_type/i.test(m)) return 'Database belum diperbarui untuk video. Jalankan supabase/migration-video.sql di SQL Editor Supabase.';
    if (/row-level security|permission|not authorized|JWT/i.test(m)) return 'Akun ini tidak punya izin mengubah isi. Pastikan email di supabase/schema.sql sama dengan email loginmu.';
    if (/payload too large|too large|exceeded/i.test(m)) return 'File terlalu besar. Pakai file yang lebih kecil.';
    if (/Failed to fetch|network/i.test(m)) return 'Koneksi bermasalah. Coba lagi sebentar lagi.';
    return 'Belum berhasil. ' + (m ? m : 'Coba lagi sebentar lagi.');
  }

  /* ---------- Video di kartu: jalan sendiri, tanpa suara ---------- */
  var cardVideos = [], vio = null;
  if (!RM && 'IntersectionObserver' in window) {
    vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.intersectionRatio >= .3) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
      });
    }, { threshold: [0, .3] });
  }
  function resetCardVideos() { cardVideos.forEach(function (v) { if (vio) vio.unobserve(v); v.pause(); }); cardVideos = []; }
  function resumeCardVideos() {
    if (RM) return;
    cardVideos.forEach(function (v) {
      var r = v.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight * .8 && r.right > 0 && r.left < window.innerWidth) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    });
  }
  function makeVideo(url) {
    var v = document.createElement('video');
    v.src = url + '#t=0.1'; v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.preload = 'metadata'; v.disablePictureInPicture = true;
    return v;
  }

  /* ---------- Galeri geser: banyak foto dan video dalam satu kenangan ---------- */
  function buildGallery(list, opts) {
    var n = list.length, wrap = el('div', 'gal' + (n > 1 ? ' multi' : '')), track = el('div', 'track'), nodes = [], cur = 0, tm = 0;
    wrap.appendChild(track);
    list.forEach(function (m, i) {
      var url = publicUrl(m.path), sl = el('div', 'slide'), node, lab = (opts.title || 'kenangan') + (n > 1 ? ' (' + (i + 1) + ' dari ' + n + ')' : '');
      if (m.type === 'video') {
        if (opts.card) { node = makeVideo(url); cardVideos.push(node); if (vio) vio.observe(node); }
        else {
          node = document.createElement('video'); node.src = url; node.controls = true; node.playsInline = true; node.setAttribute('playsinline', '');
          node.preload = i === (opts.start || 0) ? 'auto' : 'metadata';
        }
        node.setAttribute('aria-label', 'Video: ' + lab);
      } else {
        node = el('img'); node.src = url; node.alt = lab; node.decoding = 'async'; if (i > 0 || opts.card) node.loading = 'lazy';
      }
      sl.appendChild(node); track.appendChild(sl); nodes.push(node);
    });
    wrap.slides = nodes;
    wrap.index = function () { return cur; };
    if (n < 2) { wrap.goTo = function () {}; wrap.step = function () {}; return wrap; }
    var prev = el('button', 'gnav prev', '‹'), next = el('button', 'gnav next', '›'), cnt = el('span', 'gcount'), dots = el('div', 'dots'), dotEls = [];
    prev.type = 'button'; next.type = 'button'; prev.setAttribute('aria-label', 'Sebelumnya'); next.setAttribute('aria-label', 'Berikutnya');
    cnt.setAttribute('aria-live', 'polite');
    for (var k = 0; k < n; k++) {
      var d = opts.card ? el('span') : el('button'); if (!opts.card) { d.type = 'button'; d.setAttribute('aria-label', 'Ke media ' + (k + 1)); }
      (function (idx) { if (!opts.card) d.addEventListener('click', function () { wrap.goTo(idx, true); }); })(k);
      dots.appendChild(d); dotEls.push(d);
    }
    wrap.appendChild(prev); wrap.appendChild(next); wrap.appendChild(cnt); wrap.appendChild(dots);
    function paint() {
      cnt.textContent = (cur + 1) + '/' + n;
      dotEls.forEach(function (d, j) { d.classList.toggle('on', j === cur); });
      prev.hidden = cur === 0; next.hidden = cur === n - 1;
    }
    function sync() {
      var w = track.clientWidth || 1, i = Math.max(0, Math.min(n - 1, Math.round(track.scrollLeft / w)));
      if (i !== cur) { cur = i; paint(); if (opts.onChange) opts.onChange(i); }
    }
    track.addEventListener('scroll', function () { clearTimeout(tm); tm = setTimeout(sync, 70); }, { passive: true });
    wrap.goTo = function (i, smooth) {
      i = Math.max(0, Math.min(n - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: smooth && !RM ? 'smooth' : 'auto' });
      if (!smooth) { var ch = i !== cur; cur = i; paint(); if (ch && opts.onChange) opts.onChange(i); }
    };
    wrap.step = function (d) { wrap.goTo(cur + d, true); };
    prev.addEventListener('click', function (e) { e.stopPropagation(); wrap.step(-1); });
    next.addEventListener('click', function (e) { e.stopPropagation(); wrap.step(1); });
    paint();
    return wrap;
  }

  /* ---------- Hero ---------- */
  function renderHero() {
    var a = (state.meta.name_a || '').trim(), b = (state.meta.name_b || '').trim();
    $('#names').textContent = a && b ? a + '  &  ' + b : (a || b || '');
    var c = $('#counter'); c.textContent = '';
    var n = dayNo(todayISO());
    if (n) {
      c.appendChild(el('span', 'num', n.toLocaleString('id-ID')));
      c.appendChild(el('span', 'lbl', 'hari berjalan bersama'));
    } else if (editing()) {
      c.appendChild(el('span', 'lbl', 'Atur tanggal mulai untuk menghitung hari kalian'));
    }
  }

  /* ---------- Roadmap ---------- */
  var io = null, stopEls = [];
  function makeStop(it, i, sample) {
    var li = el('li', 'stop'); li.style.setProperty('--hue', HUES[i % HUES.length]); li.setAttribute('data-id', it.id);
    li._it = it; li._i = i; li._sample = !!sample;
    li.appendChild(el('span', 'node'));
    var card = el('article', 'card');
    if (hasMedia(it)) {
      var med = mediaOf(it), fig = el('figure', 'photo'), g = buildGallery(med, { card: true, title: it.title || 'kenangan' });
      fig.appendChild(g);
      fig.appendChild(el('span', 'hintpill', med.length > 1 ? 'Lihat semua' : (med[0].type === 'video' ? 'Putar dengan suara' : 'Lihat')));
      card.appendChild(fig); li._gal = g;
    } else if (sample) {
      card.appendChild(el('div', 'photo ph', 'Tempat foto kalian'));
    }
    var body = el('div', 'body');
    var meta = el('p', 'meta');
    meta.appendChild(el('span', null, 'Kenangan ' + String(i + 1).padStart(2, '0')));
    if (sample) meta.appendChild(el('span', 'badge', 'Contoh'));
    else { var dn = dayNo(it.event_date); if (dn) meta.appendChild(el('span', null, 'Hari ke-' + dn)); }
    body.appendChild(meta);
    body.appendChild(el('h3', null, it.title || 'Tanpa judul'));
    body.appendChild(el('p', 'date', fmtD(it.event_date)));
    if (it.description) body.appendChild(el('p', 'desc', it.description));
    var ob = el('button', 'linkbtn open-btn', 'Lihat kenangan'); ob.type = 'button'; body.appendChild(ob);
    if (!sample && editing()) {
      var act = el('div', 'actions'), del = el('button', 'linkbtn', 'Hapus'); del.type = 'button';
      var yes = el('button', 'linkbtn danger', 'Yakin, hapus'); yes.type = 'button'; yes.hidden = true;
      var no = el('button', 'linkbtn', 'Batal'); no.type = 'button'; no.hidden = true;
      del.onclick = function () { del.hidden = true; yes.hidden = false; no.hidden = false; yes.focus(); };
      no.onclick = function () { del.hidden = false; yes.hidden = true; no.hidden = true; del.focus(); };
      yes.onclick = function () {
        yes.disabled = true;
        removeMemory(it).catch(function () { yes.disabled = false; yes.textContent = 'Gagal, coba lagi'; });
      };
      act.appendChild(del); act.appendChild(yes); act.appendChild(no); body.appendChild(act);
    }
    card.appendChild(body); li.appendChild(card);
    return li;
  }
  function render() {
    var real = state.items.slice().sort(function (a, b) {
      return (a.event_date || '').localeCompare(b.event_date || '') || (a.created_at || '').localeCompare(b.created_at || '');
    });
    var sample = real.length === 0 && state.ready, list = sample ? SAMPLES : real;
    var sn = $('#sampleNote');
    sn.hidden = !(sample && state.ready);
    sn.textContent = !sb ? 'Database belum tersambung. Isi config.js lalu muat ulang halaman. Yang tampil sekarang hanya contoh.'
      : editing() ? 'Ini contoh tampilan. Tambahkan kenangan pertama kalian dan contohnya akan hilang.'
      : 'Belum ada kenangan di sini. Yang tampil sekarang hanya contoh.';
    var ol = $('#stops'); ol.textContent = '';
    if (io) io.disconnect();
    resetCardVideos();
    list.forEach(function (it, i) { ol.appendChild(makeStop(it, i, sample)); });
    stopEls = Array.prototype.slice.call(ol.children);
    stopEls.forEach(function (s) {
      var on = RM || revealed[s.getAttribute('data-id')];
      s._st = on ? 'in' : 'out';
      if (on) s.classList.add('seen');
    });
    $('#pill').textContent = OWNER ? (editing() ? 'Mode pemilik' : '') : 'Mode pengunjung';
    document.body.classList.toggle('is-owner', editing());
    renderHero(); updateMode(); onScroll();
    if (pendingFocus) {
      var t = ol.querySelector('[data-id="' + pendingFocus + '"]');
      if (t) { pendingFocus = null; t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); }
    }
  }
  function updateMode() {
    $('#mode').textContent = !sb ? 'Database belum tersambung.'
      : state.loadError ? 'Data belum bisa dimuat. Coba muat ulang halaman.'
      : !state.ready ? 'Memuat kenangan...'
      : editing() ? 'Mode pemilik. Perubahan langsung terlihat oleh pengunjung.'
      : OWNER ? '' : 'Kamu melihat halaman ini sebagai pengunjung.';
  }
  var ticking = false, lastY = window.scrollY || 0, dirUp = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var vh = window.innerHeight, line = vh * .6;
      var y = window.scrollY || 0, moved = y !== lastY;
      if (y < lastY) dirUp = true; else if (y > lastY) dirUp = false;
      lastY = y;
      var jr = $('.journey').getBoundingClientRect();
      var h = Math.max(0, Math.min(line - jr.top, jr.height + 48));
      $('#railLit').style.height = h + 'px';
      stopEls.forEach(function (s) {
        var n = s.querySelector('.node'); if (!n) return;
        var top = n.getBoundingClientRect().top;
        s.classList.toggle('lit', top < line);
        if (RM) return;
        if (s._st === 'out' && top < vh * .68) reveal(s);
        else if (s._st === 'in' && moved && dirUp && top > vh * .8) dissolve(s);
      });
      var hz = $('#horizon'), hn = hz.querySelector('.node');
      hz.classList.toggle('lit', hn.getBoundingClientRect().top < line);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- Memuat data ---------- */
  function load() {
    if (!sb) { state.ready = true; render(); updateMusicUI(); return Promise.resolve(); }
    return Promise.all([
      sb.from('memories').select('*').order('event_date', { ascending: true }).order('created_at', { ascending: true }),
      sb.from('settings').select('*').eq('id', 1).maybeSingle(),
      sb.from('songs').select('*').order('created_at', { ascending: true }),
      sb.from('memory_media').select('*').order('position', { ascending: true }).order('created_at', { ascending: true })
    ]).then(function (r) {
      if (r[0].error) throw r[0].error;
      state.items = r[0].data || [];
      state.meta = (r[1] && r[1].data) || {};
      if (r[3] && r[3].error) { state.mediaErr = true; } else {
        state.mediaErr = false; var by = {};
        ((r[3] && r[3].data) || []).forEach(function (x) { (by[x.memory_id] = by[x.memory_id] || []).push({ path: x.file_path, type: x.media_type === 'video' ? 'video' : 'image' }); });
        state.items.forEach(function (it) { if (by[it.id]) it.media = by[it.id]; });
      }
      if (r[2] && r[2].error) {
        /* Tabel songs belum dibuat: pakai lagu tunggal lama supaya musik tetap jalan */
        state.songsErr = true;
        state.songs = state.meta.music_path ? [{ id: 'legacy', title: String(state.meta.music_name || 'Lagu kita').replace(/\.[A-Za-z0-9]+$/, ''), file_path: state.meta.music_path }] : [];
      } else { state.songsErr = false; state.songs = (r[2] && r[2].data) || []; }
      state.loadError = false;
    }).catch(function () { state.loadError = true; })
      .then(function () { state.ready = true; syncSongs(); render(); updateMusicUI(); if (OWNER) renderSongAdmin(); });
  }

  /* ---------- Musik: daftar lagu yang bisa dipilih (pengunjung dan pemilik) ---------- */
  var audio = null, curId = null, playing = false, musicErr = false, listOpen = false;
  function curIndex() { for (var i = 0; i < state.songs.length; i++) if (state.songs[i].id === curId) return i; return -1; }
  function stopPlayback() {
    if (audio) { audio.pause(); audio.removeAttribute('src'); try { audio.load(); } catch (e) {} }
    curId = null; playing = false;
  }
  function syncSongs() { if (curId && curIndex() < 0) stopPlayback(); }
  function setList(open) {
    listOpen = !!open;
    $('#playlist').hidden = !listOpen;
    $('#listBtn').setAttribute('aria-expanded', listOpen ? 'true' : 'false');
  }
  function renderSongList() {
    var ol = $('#songList'); ol.textContent = '';
    state.songs.forEach(function (sg, i) {
      var li = el('li'), on = sg.id === curId;
      var btn = el('button', 'song' + (on ? ' on' : '') + (on && playing ? ' playing' : '')); btn.type = 'button';
      var eq = el('span', 'eq'); eq.setAttribute('aria-hidden', 'true');
      for (var k = 0; k < 3; k++) eq.appendChild(document.createElement('i'));
      btn.appendChild(eq); btn.appendChild(el('span', 'stitle', sg.title || 'Tanpa judul'));
      if (on) btn.setAttribute('aria-current', 'true');
      btn.addEventListener('click', function () { playSong(i); });
      li.appendChild(btn); ol.appendChild(li);
    });
  }
  function updateMusicUI() {
    var n = state.songs.length, b = $('#musicBtn'), sg = state.songs[curIndex()] || null;
    $('#musicBar').hidden = n === 0;
    b.classList.toggle('playing', playing);
    b.setAttribute('aria-pressed', playing ? 'true' : 'false');
    b.setAttribute('aria-label', playing ? 'Jeda musik' : 'Putar musik');
    $('#musicLabel').textContent = musicErr ? 'Musik gagal diputar' : (playing && sg ? sg.title : 'Putar musik');
    $('#listBtn').hidden = n < 2; $('#plCtl').hidden = n < 2;
    if (n < 2 && listOpen) setList(false);
    renderSongList();
  }
  /* Saat pratinjau terbuka, musik tetap jalan tapi mengecil perlahan jadi 15%, lalu naik lagi saat ditutup */
  var VOL_LOW = .15, volRaf = 0;
  function fadeVolume(to, dur) {
    if (!audio) return;
    cancelAnimationFrame(volRaf);
    if (RM) { audio.volume = to; return; }
    var from = audio.volume, t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * e));
      if (k < 1) volRaf = requestAnimationFrame(step);
    })(t0);
  }
  function playSong(i) {
    var sg = state.songs[i]; if (!sg) return;
    var reload = musicErr; musicErr = false;
    if (!audio) {
      audio = new Audio(); audio.preload = 'auto';
      audio.addEventListener('ended', function () { stepSong(1); });
      audio.addEventListener('error', function () { if (audio.getAttribute('src')) { playing = false; musicErr = true; updateMusicUI(); } });
    }
    cancelAnimationFrame(volRaf);
    if (curId !== sg.id || reload || !audio.getAttribute('src')) { audio.src = publicUrl(sg.file_path); curId = sg.id; }
    audio.loop = state.songs.length === 1;
    audio.volume = vState !== 'closed' ? VOL_LOW : 1;
    var p = audio.play();
    playing = true; updateMusicUI();
    if (p && p.then) p.then(function () {}, function (err) {
      if (err && err.name === 'AbortError') return;
      playing = false; musicErr = true; updateMusicUI();
    });
  }
  function stepSong(d) {
    var n = state.songs.length; if (!n) return;
    var i = curIndex(); if (i < 0) i = d > 0 ? -1 : 0;
    playSong((i + d + n) % n);
  }
  $('#musicBtn').addEventListener('click', function () {
    if (!state.songs.length) return;
    if (playing) { audio.pause(); playing = false; updateMusicUI(); return; }
    playSong(curIndex() < 0 ? 0 : curIndex());
  });
  $('#listBtn').addEventListener('click', function () { setList(!listOpen); });
  $('#plPrev').addEventListener('click', function () { stepSong(-1); });
  $('#plNext').addEventListener('click', function () { stepSong(1); });
  document.addEventListener('click', function (e) {
    if (!listOpen) return;
    /* composedPath dicatat saat klik terjadi, jadi tetap benar walau tombol yang diklik sudah dibangun ulang */
    var path = e.composedPath ? e.composedPath() : [], bar = $('#musicBar');
    if (path.length ? path.indexOf(bar) < 0 : !e.target.closest('#musicBar')) setList(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && listOpen) setList(false); });

  /* ---------- Pratinjau kenangan: lorong galaksi ---------- */
  var viewer = $('#viewer'), vState = 'closed', vOrigin = { x: 0, y: 0 }, resumeMusic = false, vTimer = null, vTimer2 = null, lastFocusV = null;
  var wc = $('#warp'), wx = wc.getContext('2d'), warpRaf = 0;
  function runWarp(dir, cx, cy, dur) {
    var dp = Math.min(window.devicePixelRatio || 1, 2), w = window.innerWidth, h = window.innerHeight;
    wc.width = Math.round(w * dp); wc.height = Math.round(h * dp); wx.setTransform(dp, 0, 0, dp, 0, 0);
    var maxR = Math.sqrt(w * w + h * h), arr = [], i;
    for (i = 0; i < 170; i++) arr.push({ a: Math.random() * 6.2832, r0: Math.random() * 30, s: .35 + Math.random() * .75, w: .6 + Math.random() * 1.5, c: TINTS[(Math.random() * TINTS.length) | 0] });
    var t0 = performance.now();
    cancelAnimationFrame(warpRaf);
    (function frame(now) {
      var k = Math.min(1, (now - t0) / dur), kp = dir > 0 ? k : 1 - k;
      var alpha = dir > 0 ? Math.pow(1 - k, .8) : Math.min(1, k * 3) * (1 - k * .5);
      wx.clearRect(0, 0, w, h);
      var g = wx.createRadialGradient(cx, cy, 0, cx, cy, 40 + 160 * (dir > 0 ? 1 - k : k));
      g.addColorStop(0, 'rgba(255,245,225,' + (alpha * .9).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,200,230,0)');
      wx.fillStyle = g; wx.beginPath(); wx.arc(cx, cy, 200, 0, 6.2832); wx.fill();
      wx.lineCap = 'round';
      for (var j = 0; j < arr.length; j++) {
        var a = arr[j], pos = a.r0 + a.s * maxR * kp * kp, len = a.s * maxR * (.03 + .2 * kp);
        var cs = Math.cos(a.a), sn = Math.sin(a.a);
        wx.strokeStyle = 'rgba(' + a.c + ',' + alpha.toFixed(3) + ')'; wx.lineWidth = a.w;
        wx.beginPath(); wx.moveTo(cx + cs * Math.max(0, pos - len), cy + sn * Math.max(0, pos - len)); wx.lineTo(cx + cs * pos, cy + sn * pos); wx.stroke();
      }
      if (k < 1) warpRaf = requestAnimationFrame(frame); else wx.clearRect(0, 0, w, h);
    })(t0);
  }
  var vGalCur = null;
  function viewerSlide(i) {
    if (!vGalCur) return;
    vGalCur.slides.forEach(function (node, j) {
      if (node.tagName !== 'VIDEO') return;
      if (Math.abs(j - i) <= 1) node.preload = 'auto';
      if (j === i && vState === 'open') { node.muted = false; var pp = node.play(); if (pp && pp.catch) pp.catch(function () {}); }
      else node.pause();
    });
  }
  function openViewer(li, ev, startIdx) {
    if (vState !== 'closed') return;
    var it = li._it, sample = li._sample, idx = li._i;
    var x = ev && ev.clientX, y = ev && ev.clientY;
    if (!x && !y) {
      var r = (ev && ev.target && ev.target.getBoundingClientRect) ? ev.target.getBoundingClientRect() : li.getBoundingClientRect();
      x = r.left + r.width / 2; y = r.top + r.height / 2;
    }
    vOrigin = { x: x, y: y }; vState = 'opening'; lastFocusV = document.activeElement;
    var hue = parseInt(li.style.getPropertyValue('--hue'), 10) || 330;
    viewer.style.setProperty('--hue', hue); viewer.style.setProperty('--cx', x + 'px'); viewer.style.setProperty('--cy', y + 'px');
    var m = $('#vMedia'), vid = null, med = mediaOf(it), start = Math.max(0, Math.min(med.length - 1, startIdx || 0)); m.textContent = '';
    vGalCur = null;
    if (hasMedia(it)) {
      if (med.length > 1) {
        vGalCur = buildGallery(med, { title: it.title || 'kenangan', start: start, onChange: viewerSlide }); m.appendChild(vGalCur);
      } else {
        var url = publicUrl(med[0].path);
        if (med[0].type === 'video') {
          vid = document.createElement('video'); vid.src = url; vid.controls = true; vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.preload = 'auto';
          vid.setAttribute('aria-label', 'Video: ' + (it.title || 'kenangan')); m.appendChild(vid);
        } else { var im = el('img'); im.src = url; im.alt = it.title || 'Foto kenangan'; m.appendChild(im); }
      }
    } else if (sample) m.appendChild(el('div', 'ph', 'Tempat foto kalian'));
    m.hidden = !m.firstChild; $('#vInner').classList.toggle('nomedia', !m.firstChild);
    var meta = $('#vMeta'); meta.textContent = '';
    meta.appendChild(el('span', null, 'Kenangan ' + String(idx + 1).padStart(2, '0')));
    if (sample) meta.appendChild(el('span', 'badge', 'Contoh'));
    else { var dn = dayNo(it.event_date); if (dn) meta.appendChild(el('span', null, 'Hari ke-' + dn)); }
    $('#vTitle').textContent = it.title || 'Tanpa judul'; $('#vDate').textContent = fmtD(it.event_date);
    var d = $('#vDesc'); d.textContent = it.description || ''; d.hidden = !it.description;
    document.documentElement.style.overflow = 'hidden'; document.body.classList.add('viewing');
    var mainEl = $('main'); if (mainEl) mainEl.inert = true;
    cardVideos.forEach(function (v) { v.pause(); });
    if (playing) fadeVolume(VOL_LOW, 1600);
    viewer.hidden = false; viewer.setAttribute('aria-hidden', 'false'); viewer.scrollTop = 0;
    void viewer.offsetWidth;
    if (vGalCur && start > 0) vGalCur.goTo(start, false);
    viewer.classList.add('open');
    if (!RM) runWarp(1, x, y, 1000);
    vTimer = setTimeout(function () {
      viewer.classList.add('show'); vState = 'open'; $('#vClose').focus();
      if (vGalCur) viewerSlide(vGalCur.index());
      else if (vid) { vid.muted = false; var pp = vid.play(); if (pp && pp.catch) pp.catch(function () {}); }
    }, RM ? 0 : 620);
  }
  function closeViewer() {
    if (vState !== 'open' && vState !== 'opening') return;
    clearTimeout(vTimer); vState = 'closing';
    if (playing) fadeVolume(1, 1400);
    Array.prototype.forEach.call(viewer.querySelectorAll('video'), function (v) { v.pause(); });
    viewer.classList.remove('show'); viewer.classList.remove('open');
    if (!RM) runWarp(-1, vOrigin.x, vOrigin.y, 750);
    vTimer2 = setTimeout(function () {
      viewer.hidden = true; viewer.setAttribute('aria-hidden', 'true'); $('#vMedia').textContent = ''; vGalCur = null; vState = 'closed';
      document.documentElement.style.overflow = ''; document.body.classList.remove('viewing');
      var mainEl = $('main'); if (mainEl) mainEl.inert = false;
      resumeCardVideos();
      if (lastFocusV && lastFocusV.focus) lastFocusV.focus();
    }, RM ? 0 : 800);
  }
  $('#stops').addEventListener('click', function (e) {
    if (e.target.closest('.actions, .gnav, .dots')) return;
    var li = e.target.closest('.stop');
    if (li && li._it) openViewer(li, e, li._gal ? li._gal.index() : 0);
  });
  $('#vClose').addEventListener('click', closeViewer);
  viewer.addEventListener('click', function (e) { if (e.target === viewer || e.target.id === 'vInner') closeViewer(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && vState !== 'closed') closeViewer();
    else if (vState === 'open' && vGalCur && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !(e.target && e.target.tagName === 'VIDEO')) vGalCur.step(e.key === 'ArrowRight' ? 1 : -1);
  });

  /* ---------- Roadmap dimulai ---------- */
  render();
  load();

  /* Ledakan besar saat perjalanan sampai di ujung jalur */
  (function () {
    var hn = $('#horizon .node');
    if (RM || !hn || !('IntersectionObserver' in window)) return;
    var o = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { o.disconnect(); spawnBurst(hn, null, 45, true); }
    }, { threshold: 1 });
    o.observe(hn);
  })();

  if (!OWNER) return;

  /* =====================================================
     Bagian pemilik: hanya ada di admin.html
     ===================================================== */
  var openId = null, lastFocus = null;
  function openSheet(name) {
    lastFocus = document.activeElement; openId = name;
    $('#sheet-' + name).hidden = false;
    if (name === 'memory') {
      if (!$('#fDate').value) $('#fDate').value = todayISO();
      setTimeout(function () { $('#fTitle').focus(); }, 30);
    } else if (name === 'settings') {
      $('#sA').value = state.meta.name_a || ''; $('#sB').value = state.meta.name_b || ''; $('#sStart').value = state.meta.start_date || '';
      setTimeout(function () { $('#sA').focus(); }, 30);
    } else if (name === 'music') {
      renderSongAdmin(); setStatus('#musStatus', '');
      setTimeout(function () { var n = $('#mName'); if (n) n.focus(); }, 30);
    } else if (name === 'login') {
      setTimeout(function () { $('#lEmail').focus(); }, 30);
    }
  }
  function closeSheet() {
    if (!openId || openId === 'login') return;
    $('#sheet-' + openId).hidden = true; openId = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]'); if (o) { openSheet(o.getAttribute('data-open')); return; }
    if (e.target.closest('[data-close]')) { closeSheet(); return; }
    if (e.target.classList && e.target.classList.contains('scrim')) closeSheet();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });

  /* ---------- Login ---------- */
  function applySession(s) {
    state.session = s || null;
    if (state.session) {
      if (openId === 'login') { $('#sheet-login').hidden = true; openId = null; }
    } else {
      document.querySelectorAll('.scrim').forEach(function (n) { n.hidden = true; });
      openSheet('login');
      if (!sb) setStatus('#logStatus', 'Database belum tersambung. Isi config.js dulu.', true);
    }
    render();
  }
  if (sb) {
    sb.auth.getSession().then(function (r) { applySession(r.data && r.data.session); });
    sb.auth.onAuthStateChange(function (ev, s) { if (ev === 'SIGNED_OUT' || ev === 'SIGNED_IN') applySession(s); });
  } else applySession(null);

  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault(); if (!sb) return;
    var email = $('#lEmail').value.trim(), pass = $('#lPass').value;
    if (!email || !pass) { setStatus('#logStatus', 'Isi email dan kata sandi.', true); return; }
    $('#logSave').disabled = true; setStatus('#logStatus', 'Masuk...');
    sb.auth.signInWithPassword({ email: email, password: pass }).then(function (r) {
      if (r.error) setStatus('#logStatus', 'Email atau kata sandi salah.', true);
      else { $('#lPass').value = ''; setStatus('#logStatus', ''); }
    }, function () { setStatus('#logStatus', 'Koneksi bermasalah. Coba lagi.', true); })
      .then(function () { $('#logSave').disabled = false; });
  });
  $('#logoutBtn').addEventListener('click', function () { if (sb) sb.auth.signOut(); });

  /* ---------- Foto dan video: banyak file dalam satu kenangan ---------- */
  var pendingList = [], MAX_VIDEO = 40 * 1024 * 1024, MAX_MEDIA = 10;
  function compress(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var sc = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.naturalWidth * sc)); c.height = Math.max(1, Math.round(img.naturalHeight * sc));
        var x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('bad')); }, 'image/jpeg', .82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('bad')); };
      img.src = url;
    });
  }
  function renderThumbs() {
    var ul = $('#fThumbs'); ul.textContent = '';
    pendingList.forEach(function (m, i) {
      var li = el('li', 'thumb'), node;
      if (m.kind === 'video') { node = document.createElement('video'); node.src = m.url + '#t=0.1'; node.muted = true; node.playsInline = true; node.setAttribute('playsinline', ''); node.preload = 'metadata'; }
      else { node = el('img'); node.src = m.url; node.alt = 'Foto ' + (i + 1); }
      li.appendChild(node);
      li.appendChild(el('span', 'tbadge', (i + 1) + (m.kind === 'video' ? ' · video' : '')));
      var ctl = el('span', 'tctl');
      function mk(txt, lab, fn, off) { var b = el('button', null, txt); b.type = 'button'; b.setAttribute('aria-label', lab); b.disabled = !!off; b.addEventListener('click', fn); ctl.appendChild(b); }
      mk('‹', 'Geser ke kiri', function () { pendingList.splice(i - 1, 0, pendingList.splice(i, 1)[0]); renderThumbs(); }, i === 0);
      mk('×', 'Hapus file ' + (i + 1), function () { URL.revokeObjectURL(pendingList[i].url); pendingList.splice(i, 1); renderThumbs(); });
      mk('›', 'Geser ke kanan', function () { pendingList.splice(i + 1, 0, pendingList.splice(i, 1)[0]); renderThumbs(); }, i === pendingList.length - 1);
      li.appendChild(ctl); ul.appendChild(li);
    });
    $('#fPhotoClear').hidden = !pendingList.length;
  }
  function clearPhoto() {
    pendingList.forEach(function (m) { URL.revokeObjectURL(m.url); });
    pendingList = []; $('#fPhoto').value = ''; renderThumbs();
  }
  $('#fPhoto').addEventListener('change', function () {
    var files = Array.prototype.slice.call(this.files || []); this.value = '';
    if (!files.length) return;
    var cap = state.mediaErr ? 1 : MAX_MEDIA, room = cap - pendingList.length, notes = [];
    if (files.length > room) {
      notes.push(state.mediaErr ? 'Fitur banyak media belum aktif, jadi hanya 1 file yang bisa dipakai. Jalankan supabase/migration-galeri.sql di Supabase.' : 'Maksimal ' + MAX_MEDIA + ' file per kenangan. Sisanya tidak dipakai.');
      files = files.slice(0, Math.max(0, room));
    }
    setStatus('#memStatus', files.length ? 'Memproses file...' : notes.join(' '), !files.length);
    var seq = Promise.resolve();
    files.forEach(function (f) {
      seq = seq.then(function () {
        if (f.type && f.type.indexOf('video/') === 0) {
          if (f.size > MAX_VIDEO) { notes.push('"' + f.name + '" lebih dari 40 MB, dilewati.'); return; }
          pendingList.push({ blob: f, kind: 'video', url: URL.createObjectURL(f), name: f.name });
          return;
        }
        return compress(f).then(function (b) { pendingList.push({ blob: b, kind: 'image', url: URL.createObjectURL(b), name: f.name }); },
          function () { notes.push('"' + f.name + '" tidak bisa dibaca, dilewati. Pakai JPG, PNG, mp4, atau webm.'); });
      });
    });
    seq.then(function () { renderThumbs(); setStatus('#memStatus', notes.join(' '), notes.length > 0); });
  });
  $('#fPhotoClear').addEventListener('click', clearPhoto);

  /* ---------- Simpan data ---------- */
  function addMemory(rec, list) {
    var uploaded = [], seq = Promise.resolve();
    list.forEach(function (m, i) {
      seq = seq.then(function () {
        setStatus('#memStatus', 'Mengunggah ' + (i + 1) + ' dari ' + list.length + (m.kind === 'video' ? ' (video, jangan tutup halaman)...' : '...'));
        var opts = { cacheControl: '31536000' }, path;
        if (m.kind === 'video') {
          var ext = (/\.(mp4|webm|mov|m4v)$/i.exec(m.name || '') || [null, 'mp4'])[1].toLowerCase();
          path = 'videos/' + uid() + '.' + ext; opts.contentType = m.blob.type || 'video/mp4';
        } else { path = 'photos/' + uid() + '.jpg'; opts.contentType = 'image/jpeg'; }
        return sb.storage.from(BUCKET).upload(path, m.blob, opts).then(function (r) { if (r.error) throw r.error; uploaded.push({ path: path, type: m.kind }); });
      });
    });
    return seq.then(function () {
      var first = uploaded[0];
      return sb.from('memories').insert({ title: rec.title, event_date: rec.date, description: rec.desc, photo_path: first ? first.path : null, media_type: first ? first.type : 'image' }).select().single();
    }).then(function (r) {
      if (r.error) throw r.error;
      var id = r.data.id;
      if (!uploaded.length || state.mediaErr) return id;
      var rows = uploaded.map(function (u, i) { return { memory_id: id, file_path: u.path, media_type: u.type, position: i }; });
      return sb.from('memory_media').insert(rows).select().then(function (rr) {
        if (rr.error || !rr.data || rr.data.length !== rows.length) {
          sb.from('memories').delete().eq('id', id).then(function () {});
          throw rr.error || new Error('Media belum tersimpan semua. Coba lagi.');
        }
        return id;
      });
    }).catch(function (err) {
      if (uploaded.length) sb.storage.from(BUCKET).remove(uploaded.map(function (u) { return u.path; }));
      throw err;
    });
  }
  function removeMemory(it) {
    return sb.from('memories').delete().eq('id', it.id).select().then(function (r) {
      if (r.error) throw r.error;
      if (!r.data || !r.data.length) throw new Error('Tidak ada izin menghapus.');
      var paths = mediaOf(it).map(function (m) { return m.path; });
      if (it.photo_path && paths.indexOf(it.photo_path) < 0) paths.push(it.photo_path);
      if (paths.length) sb.storage.from(BUCKET).remove(paths);
      return load();
    });
  }
  var busy = false;
  $('#memoryForm').addEventListener('submit', function (e) {
    e.preventDefault(); if (busy || !sb) return;
    var title = $('#fTitle').value.trim(), date = $('#fDate').value;
    if (!title || !date) { setStatus('#memStatus', 'Isi judul dan tanggal dulu.', true); return; }
    busy = true; $('#memSave').disabled = true;
    var list = pendingList.slice();
    setStatus('#memStatus', list.length ? 'Menyiapkan unggahan...' : 'Menyimpan...');
    addMemory({ title: title.slice(0, 120), date: date, desc: $('#fDesc').value.trim().slice(0, 1200) }, list)
      .then(function (id) {
        pendingFocus = id; return load();
      }).then(function () {
        var o = openId; if (o) { $('#sheet-' + o).hidden = true; openId = null; }
        $('#memoryForm').reset(); clearPhoto(); setStatus('#memStatus', '');
      }, function (err) { setStatus('#memStatus', errText(err), true); })
      .then(function () { busy = false; $('#memSave').disabled = false; });
  });
  $('#settingsForm').addEventListener('submit', function (e) {
    e.preventDefault(); if (!sb) return;
    $('#setSave').disabled = true; setStatus('#setStatus', 'Menyimpan...');
    sb.from('settings').upsert({ id: 1, name_a: $('#sA').value.trim().slice(0, 40), name_b: $('#sB').value.trim().slice(0, 40), start_date: $('#sStart').value || null }).select()
      .then(function (r) {
        if (r.error) throw r.error;
        if (!r.data || !r.data.length) throw new Error('Tidak ada izin menyimpan.');
        return load();
      }).then(function () { setStatus('#setStatus', ''); closeSheet(); }, function (err) { setStatus('#setStatus', errText(err), true); })
      .then(function () { $('#setSave').disabled = false; });
  });

  /* ---------- Lagu: tambah, ubah judul, hapus ---------- */
  var musicBusy = false;
  function renderSongAdmin() {
    var ul = $('#musList'); if (!ul) return;
    var w = $('#musWarn');
    w.textContent = state.songsErr ? 'Daftar lagu belum aktif di database. Jalankan supabase/migration-musik.sql di SQL Editor Supabase, lalu muat ulang halaman.' : '';
    w.className = 'status' + (state.songsErr ? ' err' : '');
    $('#musSave').disabled = state.songsErr || musicBusy;
    ul.textContent = '';
    if (!state.songs.length) { ul.appendChild(el('li', 'songempty', 'Belum ada lagu. Tambahkan lagu pertama di bawah.')); return; }
    state.songs.forEach(function (sg) {
      var li = el('li', 'songrow'), name = el('span', 'sname', sg.title || 'Tanpa judul');
      li.appendChild(name);
      if (state.songsErr) { ul.appendChild(li); return; }
      var acts = el('span', 'acts');
      var ren = el('button', 'linkbtn', 'Ubah judul'); ren.type = 'button';
      var del = el('button', 'linkbtn', 'Hapus'); del.type = 'button';
      var yes = el('button', 'linkbtn danger', 'Yakin, hapus'); yes.type = 'button'; yes.hidden = true;
      var no = el('button', 'linkbtn', 'Batal'); no.type = 'button'; no.hidden = true;
      var inp = null;
      function saveTitle() {
        var t = inp.value.trim().slice(0, 80);
        if (!t) { setStatus('#musStatus', 'Judul tidak boleh kosong.', true); return; }
        ren.disabled = true; setStatus('#musStatus', 'Menyimpan judul...');
        sb.from('songs').update({ title: t }).eq('id', sg.id).select().then(function (r) {
          if (r.error) throw r.error;
          if (!r.data || !r.data.length) throw new Error('Tidak ada izin mengubah judul.');
          return load();
        }).then(function () { setStatus('#musStatus', 'Judul diperbarui.'); renderSongAdmin(); },
          function (err) { ren.disabled = false; setStatus('#musStatus', errText(err), true); });
      }
      ren.onclick = function () {
        if (inp) { saveTitle(); return; }
        inp = document.createElement('input'); inp.type = 'text'; inp.maxLength = 80; inp.value = sg.title || '';
        inp.setAttribute('aria-label', 'Judul lagu');
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); saveTitle(); } });
        li.replaceChild(inp, name); ren.textContent = 'Simpan'; del.hidden = true; inp.focus(); inp.select();
      };
      del.onclick = function () { del.hidden = true; ren.hidden = true; yes.hidden = false; no.hidden = false; yes.focus(); };
      no.onclick = function () { del.hidden = false; ren.hidden = false; yes.hidden = true; no.hidden = true; del.focus(); };
      yes.onclick = function () {
        yes.disabled = true; setStatus('#musStatus', 'Menghapus...');
        sb.from('songs').delete().eq('id', sg.id).select().then(function (r) {
          if (r.error) throw r.error;
          if (!r.data || !r.data.length) throw new Error('Tidak ada izin menghapus.');
          sb.storage.from(BUCKET).remove([sg.file_path]);
          return load();
        }).then(function () { setStatus('#musStatus', 'Lagu dihapus.'); renderSongAdmin(); },
          function (err) { yes.disabled = false; setStatus('#musStatus', errText(err), true); });
      };
      acts.appendChild(ren); acts.appendChild(del); acts.appendChild(yes); acts.appendChild(no);
      li.appendChild(acts); ul.appendChild(li);
    });
  }
  $('#musicForm').addEventListener('submit', function (e) {
    e.preventDefault(); if (musicBusy || !sb || state.songsErr) return;
    var f = $('#mFile').files && $('#mFile').files[0];
    if (!f) { setStatus('#musStatus', 'Pilih file musik dulu.', true); return; }
    if (f.size > 40 * 1024 * 1024) { setStatus('#musStatus', 'File lebih dari 40 MB. Kecilkan dulu atau pilih lagu lain.', true); return; }
    var title = ($('#mName').value.trim() || f.name.replace(/\.[^.]+$/, '')).slice(0, 80) || 'Lagu kita';
    musicBusy = true; $('#musSave').disabled = true; setStatus('#musStatus', 'Mengunggah lagu...');
    var safe = f.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').slice(-60), path = 'music/' + Date.now() + '-' + safe;
    sb.storage.from(BUCKET).upload(path, f, { contentType: f.type || 'audio/mpeg', cacheControl: '31536000' })
      .then(function (r) {
        if (r.error) throw r.error;
        return sb.from('songs').insert({ title: title, file_path: path }).select();
      }).then(function (r) {
        if (r.error || !r.data || !r.data.length) { sb.storage.from(BUCKET).remove([path]); throw r.error || new Error('Tidak ada izin menyimpan.'); }
        $('#mFile').value = ''; $('#mName').value = '';
        return load();
      }).then(function () { setStatus('#musStatus', 'Lagu "' + title + '" ditambahkan. Pengunjung bisa memilihnya dari tombol Lagu.'); },
        function (err) { setStatus('#musStatus', errText(err), true); })
      .then(function () { musicBusy = false; renderSongAdmin(); });
  });
})();
