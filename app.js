(() => {
  'use strict';
  // ===== CONFIGURACIÓN DE WHATSAPP =====
  // Número con código de país, sin "+" ni espacios. Argentina: 549 + código de área + número (sin 0 ni 15).
  const WA_NUMERO = '5491157597489';
  const WA_MENSAJE = 'Hola Rodrigo, vi tu portfolio y quería consultarte por un proyecto.';
  // ======================================
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const restart = el => { el.style.animation = 'none'; void el.offsetHeight; el.style.animation = ''; };

  document.querySelectorAll('[data-wa]').forEach(a => {
    a.href = `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(WA_MENSAJE)}`;
    a.target = '_blank'; a.rel = 'noopener';
  });

  // Pantalla de carga: contador 000 a 100 y palabras rotando
  const loader = $('#loader'), word = $('#ldWord'), count = $('#ldCount'), bar = $('#ldBar');
  const words = ['Diseño', 'Código', 'Sistemas'];
  let w = 0;
  const wt = setInterval(() => { w = (w + 1) % words.length; word.textContent = words[w]; restart(word); }, 900);
  const D = reduce ? 300 : 2700, t0 = performance.now();
  const finish = () => {
    clearInterval(wt);
    loader.classList.add('out');
    document.body.classList.add('loaded');
    setTimeout(() => loader.remove(), 700);
  };
  const tick = now => {
    const p = Math.min((now - t0) / D, 1);
    count.textContent = String(Math.round(p * 100)).padStart(3, '0');
    bar.style.transform = `scaleX(${p})`;
    p < 1 ? requestAnimationFrame(tick) : setTimeout(finish, 400);
  };
  requestAnimationFrame(tick);

  // Palabra rotativa del hero
  const roleEl = $('#role');
  const roles = ['sistemas', 'sitios web', 'bases de datos', 'apps Android'];
  let r = 0;
  if (!reduce) setInterval(() => { r = (r + 1) % roles.length; roleEl.textContent = roles[r]; restart(roleEl); }, 2000);

  // Navbar: sombra al scrollear y enlace activo
  const nav = $('.nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 100), { passive: true });
  const links = $$('.menu a');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = $(a.getAttribute('href')); if (s) spy.observe(s); });

  // Stack: etiqueta fija y tecnologías que se desplazan en fila
  const chips = $$('.chip-btn'), rows = $$('.srow');
  const buildLane = lane => {
    const belt = $('.belt', lane), src = $('ul', belt);
    const w = src.offsetWidth;
    if (!w || !lane.clientWidth) return;
    $$('ul[aria-hidden]', belt).forEach(n => n.remove());
    const sets = Math.max(1, Math.ceil(lane.clientWidth / w));
    for (let i = 1; i < sets * 2; i++) {
      const c = src.cloneNode(true); c.setAttribute('aria-hidden', 'true'); belt.appendChild(c);
    }
    belt.style.setProperty('--t', (w * sets / 55) + 's');
  };
  const buildAll = () => $$('.lane').forEach(buildLane);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(buildAll);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(buildAll, 200); });
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.classList.toggle('is-active', x === c));
    rows.forEach(row => {
      row.hidden = c.dataset.filter !== 'all' && row.dataset.cat !== c.dataset.filter;
      if (!row.hidden) buildLane($('.lane', row));
    });
  }));

  // Aparición al hacer scroll
  const items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es, o) => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
    }), { rootMargin: '0px 0px -100px 0px' });
    items.forEach(el => io.observe(el));
  } else items.forEach(el => el.classList.add('in'));

  // Estadísticas: el número cuenta y el texto se descifra
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#+0123456789';
  const animateStat = el => {
    clearInterval(el._t);
    if (reduce) return;
    const t0 = performance.now();
    if (el.dataset.count) {
      const end = +el.dataset.count;
      el._t = setInterval(() => {
        const p = Math.min((performance.now() - t0) / 1400, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p >= 1) clearInterval(el._t);
      }, 40);
    } else {
      const final = el.dataset.text;
      el._t = setInterval(() => {
        const p = Math.min((performance.now() - t0) / 900, 1), fixed = Math.floor(p * final.length);
        el.textContent = [...final].map((ch, i) => i < fixed ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
        if (p >= 1) { el.textContent = final; clearInterval(el._t); }
      }, 50);
    }
  };
  const statIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) animateStat($('strong', e.target));
  }), { threshold: .6 });
  $$('.proof li').forEach(li => {
    statIO.observe(li);
    li.addEventListener('mouseenter', () => animateStat($('strong', li)));
  });

  // Avatar y capturas opcionales: se muestran solo si el archivo existe
  const ready = el => el.classList.add('ready');
  $$('.avatar img, .project-image img').forEach(im =>
    im.complete && im.naturalWidth ? ready(im) : im.addEventListener('load', () => ready(im)));
  $$('.avatar video').forEach(v =>
    v.readyState >= 2 ? ready(v) : v.addEventListener('loadeddata', () => ready(v)));

  // Vista previa en vivo de cada sitio: el iframe se escala para cubrir la tarjeta
  const W = 1280, H = 800;
  const fit = box => {
    const f = $('iframe', box); if (!f) return;
    const w = box.clientWidth, h = box.clientHeight, s = Math.max(w / W, h / H);
    f.style.transform = `scale(${s})`;
    f.style.left = (w - W * s) / 2 + 'px';
    f.style.top = (h - H * s) / 2 + 'px';
  };
  const ro = new ResizeObserver(es => es.forEach(e => fit(e.target)));
  $$('.project-image').forEach(box => {
    const f = $('iframe', box); if (!f) return;
    ro.observe(box);
    f.addEventListener('load', () => f.classList.add('ready'));
  });

  // Código que se escribe solo (sección de contacto)
  const codeEl = $('#code');
  const lines = [
    [['k','var'],['',' '],['v','rodrigo'],['p',' = '],['k','new'],['',' '],['t','Developer'],['p',' {']],
    [['','    '],['v','Stack'],['p',' = '],['s','"C#, SQL Server, JavaScript"'],['p',',']],
    [['','    '],['v','Disponible'],['p',' = '],['k','true']],
    [['p','};']],
    [],
    [['k','if'],['p',' ('],['v','tenesUnaIdea'],['p',') {']],
    [['','    '],['v','rodrigo'],['p','.'],['f','Responder'],['p','('],['v','tuMensaje'],['p',');']],
    [['p','}']],
    [['c','// escribime y lo armamos juntos']]
  ];
  const flat = [];
  lines.forEach((ln, i) => {
    ln.forEach(([c, t]) => [...t].forEach(ch => flat.push([c, ch])));
    if (i < lines.length - 1) flat.push(['', '\n']);
  });
  const caret = document.createElement('span'); caret.className = 'caret';
  const paint = n => {
    codeEl.textContent = '';
    let span = null, cur = null;
    for (let i = 0; i < n; i++) {
      const [c, ch] = flat[i];
      if (!span || c !== cur) { span = document.createElement('span'); if (c) span.className = 'tk-' + c; codeEl.appendChild(span); cur = c; }
      span.textContent += ch;
    }
    codeEl.appendChild(caret);
  };
  if (reduce) paint(flat.length);
  else {
    let n = 0, timer;
    const step = () => {
      paint(n);
      if (n < flat.length) { n++; timer = setTimeout(step, 28 + Math.random() * 45); }
      else timer = setTimeout(() => { n = 0; step(); }, 4000);
    };
    new IntersectionObserver(es => es.forEach(e => {
      clearTimeout(timer);
      if (e.isIntersecting) step();
    })).observe($('.code-win'));
  }

  // Marquesina
  const unit = 'CONSTRUYENDO SISTEMAS • '.repeat(10);
  $('#track').innerHTML = `<span>${unit}</span><span>${unit}</span>`;

  $$('a[data-todo]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
  $('#year').textContent = new Date().getFullYear();

  // Formulario (Netlify Forms) con confirmación visible
  const form = $('#form'), status = $('.status', form), send = $('button[type=submit]', form);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const label = send.textContent;
    status.className = 'status'; status.textContent = '';
    send.disabled = true; send.textContent = 'Enviando...';
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      form.classList.add('sent');
    } catch {
      status.className = 'status err';
      status.textContent = 'No se pudo enviar el mensaje. Probá de nuevo o escribime por WhatsApp.';
    } finally { send.disabled = false; send.textContent = label; }
  });
  $('#again').addEventListener('click', () => {
    form.classList.remove('sent');
    $('input[name=nombre]', form).focus();
  });
})();
