/* Alia's University Decision: vanilla JS, no dependencies. */
(function () {
  'use strict';

  var TABS = ['overview', 'single-honours', 'joint-honours', 'my-5', 'dates'];
  var MAX_PICKS = 5;
  var DEADLINE = Date.UTC(2027, 0, 13, 18, 0, 0); // 13 Jan 2027 18:00 GMT (UK time in January)
  var KEYS = { picks: 'alia.picks', checklist: 'alia.checklist', tab: 'alia.tab' };
  var TIER_LABEL = { aspirational: 'Aspirational', match: 'Match', safer: 'Safer', stretch: 'Stretch' };
  var TIER_ORDER = { stretch: 0, aspirational: 1, match: 2, safer: 3 };

  var unis = {};
  var courses = [];
  var courseById = {};
  var picks = [];
  var subjects = [];

  /* ---------- storage (always guarded) ---------- */
  function load(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') node.textContent = attrs[k];
        else if (k === 'class') node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }
  function extLink(href, text) {
    return el('a', { href: href, target: '_blank', rel: 'noopener noreferrer' }, [
      text, el('span', { class: 'sr-only', text: ' (opens in a new tab)' })
    ]);
  }
  function tierBadge(tier) {
    return el('span', { class: 'tier tier-' + tier, text: TIER_LABEL[tier] });
  }
  // Stretch counts as aspirational for the 1 / 3 / 1 mix
  function mixGroup(tier) { return tier === 'stretch' ? 'aspirational' : tier; }

  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }

  /* ---------- countdown ---------- */
  function updateCountdown() {
    var out = $('#countdown-value');
    var diff = DEADLINE - Date.now();
    if (diff <= 0) { out.textContent = 'Deadline has passed'; return; }
    var mins = Math.floor(diff / 60000);
    var d = Math.floor(mins / 1440);
    var h = Math.floor((mins % 1440) / 60);
    var m = mins % 60;
    out.textContent = d + ' day' + (d === 1 ? '' : 's') + ' ' + h + ' hr' + (h === 1 ? '' : 's') + ' ' + m + ' min to go';
    $('#countdown').setAttribute('title', 'Until 13 January 2027, 18:00 UK time');
  }

  /* ---------- tabs + hash routing ---------- */
  function currentTabFromHash() {
    var h = (location.hash || '').replace('#', '');
    return TABS.indexOf(h) > -1 ? h : null;
  }

  function showTab(name, opts) {
    opts = opts || {};
    TABS.forEach(function (t) {
      var tab = document.getElementById('tab-' + t);
      var panel = document.getElementById(t);
      var on = t === name;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
    });
    save(KEYS.tab, name);
    var titles = { 'single-honours': 'Single honours', 'joint-honours': 'Joint honours', 'my-5': 'My 5 choices', dates: 'Key dates & checklist' };
    document.title = (titles[name] ? titles[name] + ' · ' : '') + "Alia's University Decision";
    if (opts.focusTab) document.getElementById('tab-' + name).focus();
    if (opts.scrollTop) window.scrollTo(0, 0);
  }

  function goTo(name, opts) {
    if (location.hash !== '#' + name) {
      history.pushState(null, '', '#' + name);
    }
    showTab(name, opts);
  }

  function initTabs() {
    var tablist = $('[role="tablist"]');
    tablist.addEventListener('click', function (e) {
      var btn = e.target.closest('[role="tab"]');
      if (!btn) return;
      goTo(btn.dataset.tab, { scrollTop: true });
    });
    tablist.addEventListener('keydown', function (e) {
      var btn = e.target.closest('[role="tab"]');
      if (!btn) return;
      var i = TABS.indexOf(btn.dataset.tab);
      var next = null;
      if (e.key === 'ArrowRight') next = TABS[(i + 1) % TABS.length];
      else if (e.key === 'ArrowLeft') next = TABS[(i - 1 + TABS.length) % TABS.length];
      else if (e.key === 'Home') next = TABS[0];
      else if (e.key === 'End') next = TABS[TABS.length - 1];
      if (next) {
        e.preventDefault();
        goTo(next, { focusTab: true });
      }
    });
    window.addEventListener('popstate', function () {
      showTab(currentTabFromHash() || 'overview');
    });
    // In-page links like <a href="#joint-honours"> go through the router
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var target = a.getAttribute('href').slice(1);
      if (TABS.indexOf(target) > -1) {
        e.preventDefault();
        goTo(target, { scrollTop: true });
        $('#main').focus({ preventScroll: true });
      }
    });

    var start = currentTabFromHash() || load(KEYS.tab, null);
    if (TABS.indexOf(start) === -1) start = 'overview';
    if (!currentTabFromHash()) history.replaceState(null, '', '#' + start);
    showTab(start);
  }

  /* ---------- overview ---------- */
  var disciplines = [];

  function highlight(text, q) {
    if (!q) return [text];
    var i = text.toLowerCase().indexOf(q);
    if (i === -1) return [text];
    return [text.slice(0, i), el('mark', { text: text.slice(i, i + q.length) }), text.slice(i + q.length)];
  }

  function renderOverview() {
    var q = $('#search').value.trim().toLowerCase();
    var starOnly = $('#star-only').checked;
    var wrap = $('#disciplines');
    wrap.innerHTML = '';
    var total = 0;

    disciplines.forEach(function (d) {
      var matchesHeading = q && d.name.toLowerCase().indexOf(q) > -1;
      var items = d.courses.filter(function (c) {
        if (starOnly && !c.star) return false;
        if (!q || matchesHeading) return true;
        return (c.n + ' ' + (c.note || '')).toLowerCase().indexOf(q) > -1;
      });
      if (!items.length) return;
      total += items.length;

      var heading = el('h3', null, highlight(d.name, matchesHeading ? q : ''));
      if (d.tag) heading.appendChild(el('span', { class: 'tag', text: d.tag }));
      var list = el('ul', { class: 'chips' });
      items.forEach(function (c) {
        var label = [];
        if (c.star) label.push('uses your subjects');
        if (c.warn) label.push('may also need Maths or Physics');
        var li = el('li', { class: c.star ? 'star' : '' }, highlight(c.n, matchesHeading ? '' : q));
        if (c.star) li.appendChild(el('span', { 'aria-hidden': 'true', text: ' ★' }));
        if (c.warn) li.appendChild(el('span', { 'aria-hidden': 'true', text: ' ⚠' }));
        if (label.length) li.appendChild(el('span', { class: 'sr-only', text: ' (' + label.join(', ') + ')' }));
        if (c.note) li.appendChild(el('span', { class: 'chip-note', text: ' · ' + c.note }));
        list.appendChild(li);
      });
      wrap.appendChild(el('section', { class: 'card discipline' }, [heading, list]));
    });

    $('#empty-search').hidden = total > 0;
    $('#result-count').textContent = (q || starOnly) ? total + ' subject' + (total === 1 ? '' : 's') + ' shown' : '';
  }

  function initOverview() {
    var t;
    $('#search').addEventListener('input', function () { clearTimeout(t); t = setTimeout(renderOverview, 120); });
    $('#star-only').addEventListener('change', renderOverview);
    renderOverview();
  }

  /* ---------- single honours ---------- */
  function subjectAnchor(sub) { return 'subj-' + sub.id; }

  function renderSingle() {
    var wrap = document.getElementById('single-subjects');
    if (!wrap) return;
    wrap.innerHTML = '';
    var groups = [
      { key: 'core', title: null },
      { key: 'wildcard', title: 'Wild cards', intro: 'Less obvious options that still use your subjects. Several lead to a regulated profession, such as pharmacist or speech and language therapist.' }
    ];
    groups.forEach(function (g) {
      var subs = subjects.filter(function (s) { return s.group === g.key; });
      if (!subs.length) return;
      if (g.title) {
        wrap.appendChild(el('h3', { class: 'group-heading', text: g.title }));
        if (g.intro) wrap.appendChild(el('p', { class: 'hint', text: g.intro }));
      }
      subs.forEach(function (sub) {
        var list = courses
          .filter(function (c) { return c.list === 'single' && c.subject === sub.id; })
          .sort(function (a, b) { return TIER_ORDER[a.tier] - TIER_ORDER[b.tier]; });
        if (!list.length) return;
        var headingId = subjectAnchor(sub);
        var links = el('p', { class: 'subject-links' });
        if (sub.ucasGuide) links.appendChild(extLink(sub.ucasGuide, 'UCAS ' + sub.name.toLowerCase() + ' guide'));
        if (sub.ucasGuide && sub.ucasSearch) links.appendChild(el('span', { 'aria-hidden': 'true', class: 'sep', text: ' · ' }));
        if (sub.ucasSearch) links.appendChild(extLink(sub.ucasSearch, 'See all ' + sub.name.toLowerCase() + ' courses on UCAS'));

        var grid = el('div', { class: 'shortlist' });
        list.forEach(function (c) { grid.appendChild(courseCard(c)); });

        wrap.appendChild(el('section', { class: 'subject-block', 'aria-labelledby': headingId }, [
          el('h3', { id: headingId, tabindex: '-1', text: sub.name }),
          sub.blurb ? el('p', { class: 'subject-blurb', text: sub.blurb }) : null,
          links,
          grid
        ]));
      });
    });
  }

  function initJump() {
    var ul = document.getElementById('jump-list');
    if (!ul) return;
    subjects.filter(function (sub) {
      return courses.some(function (c) { return c.list === 'single' && c.subject === sub.id; });
    }).forEach(function (sub) {
      var b = el('button', { type: 'button', class: 'chip-btn', text: sub.name });
      b.addEventListener('click', function () {
        var h = document.getElementById(subjectAnchor(sub));
        if (!h) return;
        h.scrollIntoView({ behavior: 'smooth', block: 'start' });
        h.focus({ preventScroll: true });
      });
      ul.appendChild(el('li', null, [b]));
    });
  }

  /* ---------- shortlists ---------- */
  function renderShortlists() {
    renderSingle();
    ['science', 'business'].forEach(function (list) {
      var wrap = document.getElementById('sl-' + list);
      wrap.innerHTML = '';
      courses
        .filter(function (c) { return c.list === list; })
        .sort(function (a, b) { return TIER_ORDER[a.tier] - TIER_ORDER[b.tier]; })
        .forEach(function (c) { wrap.appendChild(courseCard(c)); });
    });
  }

  function courseCard(c) {
    var uni = unis[c.uni] || { name: c.uni, ucas: '#' };
    var picked = picks.indexOf(c.id) > -1;

    var titleChildren = [extLink(c.url, c.name)];
    if (c.linkLabel) titleChildren.push(el('span', { class: 'link-label', text: ' (' + c.linkLabel + ')' }));

    var btn = el('button', {
      type: 'button', class: 'btn' + (picked ? '' : ' btn-secondary'),
      'aria-pressed': picked ? 'true' : 'false',
      'data-id': c.id,
      text: picked ? '✓ In my 5' : '+ Add to my 5'
    });
    btn.setAttribute('aria-label', (picked ? 'Remove ' : 'Add ') + c.name + ' at ' + uni.name + (picked ? ' from my 5' : ' to my 5'));
    btn.addEventListener('click', function () { togglePick(c.id, btn); });

    return el('article', { class: 'course' + (picked ? ' is-picked' : ''), 'data-course': c.id }, [
      el('div', { class: 'course-top' }, [tierBadge(c.tier)]),
      el('h4', null, titleChildren),
      el('p', { class: 'uni' }, [extLink(uni.ucas, uni.name)]),
      el('p', { class: 'offer' }, ['Typical offer: ', el('strong', { text: c.offer })]),
      el('p', { class: 'why', text: c.why }),
      c.tip ? el('p', { class: 'tip' }, [el('strong', { text: 'Good to know: ' }), c.tip]) : null,
      c.note ? el('p', { class: 'note' }, [el('span', { 'aria-hidden': 'true', text: '⚠ ' }), c.note]) : null,
      el('div', { class: 'actions' }, [btn])
    ]);
  }

  function togglePick(id, btn) {
    var c = courseById[id];
    var i = picks.indexOf(id);
    var card = btn && btn.closest('.course');
    var old = card && card.querySelector('.inline-msg');
    if (old) old.remove();

    if (i > -1) {
      picks.splice(i, 1);
      toast('Removed ' + c.name + ' from your 5.');
    } else {
      if (picks.length >= MAX_PICKS) {
        var msg = 'You already have 5 choices, the UCAS maximum. Remove one in My 5 before adding another.';
        if (card) card.querySelector('.actions').appendChild(el('p', { class: 'inline-msg', role: 'alert', text: msg }));
        else toast(msg);
        return;
      }
      picks.push(id);
      toast('Added ' + c.name + ' (' + picks.length + '/5).');
    }
    commitPicks(id);
  }

  function commitPicks(focusId) {
    save(KEYS.picks, picks);
    renderShortlists();
    renderPicks();
    if (focusId) {
      var b = document.querySelector('.course [data-id="' + focusId + '"]');
      if (b && b.offsetParent !== null) b.focus();
    }
  }

  /* ---------- my 5 ---------- */
  function renderPicks() {
    $('#pick-count').textContent = picks.length + '/5';
    var list = $('#picks');
    list.innerHTML = '';
    $('#picks-empty').hidden = picks.length > 0;

    picks.forEach(function (id, idx) {
      var c = courseById[id];
      var uni = unis[c.uni];
      var up = el('button', { type: 'button', class: 'btn-icon', 'aria-label': 'Move ' + c.name + ' up', text: '↑' });
      var down = el('button', { type: 'button', class: 'btn-icon', 'aria-label': 'Move ' + c.name + ' down', text: '↓' });
      var rm = el('button', { type: 'button', class: 'btn btn-secondary remove', 'aria-label': 'Remove ' + c.name + ' at ' + uni.name, text: 'Remove' });
      up.disabled = idx === 0;
      down.disabled = idx === picks.length - 1;
      up.addEventListener('click', function () { move(idx, -1, 'up'); });
      down.addEventListener('click', function () { move(idx, 1, 'down'); });
      rm.addEventListener('click', function () {
        picks.splice(idx, 1);
        toast('Removed ' + c.name + '.');
        commitPicks();
        var next = list.querySelectorAll('.remove')[Math.min(idx, picks.length - 1)];
        (next || $('#picks-empty .btn')).focus();
      });

      list.appendChild(el('li', { class: 'pick' }, [
        el('span', { class: 'pick-num', 'aria-hidden': 'true', text: String(idx + 1) }),
        el('div', { class: 'pick-body' }, [
          el('h3', null, [el('span', { class: 'sr-only', text: 'Choice ' + (idx + 1) + ': ' }), extLink(c.url, c.name)]),
          el('p', null, [extLink(uni.ucas, uni.name)]),
          el('p', { class: 'meta' }, [tierBadge(c.tier), 'Offer: ' + c.offer])
        ]),
        el('div', { class: 'pick-controls' }, [up, down, rm])
      ]));
    });

    renderMix();
  }

  function move(idx, delta, dir) {
    var j = idx + delta;
    if (j < 0 || j >= picks.length) return;
    var tmp = picks[idx]; picks[idx] = picks[j]; picks[j] = tmp;
    commitPicks();
    var btns = $('#picks').children[j].querySelectorAll('.btn-icon');
    var target = dir === 'up' ? btns[0] : btns[1];
    (target.disabled ? (dir === 'up' ? btns[1] : btns[0]) : target).focus();
  }

  function renderMix() {
    var target = { aspirational: 1, match: 3, safer: 1 };
    var count = { aspirational: 0, match: 0, safer: 0 };
    picks.forEach(function (id) { count[mixGroup(courseById[id].tier)]++; });

    var wrap = $('#mix');
    wrap.innerHTML = '';
    if (!picks.length) return;

    Object.keys(target).forEach(function (k) {
      var cls = 'mix-item' + (count[k] > target[k] ? ' over' : count[k] === target[k] ? ' done' : '');
      wrap.appendChild(el('div', { class: cls }, [
        el('span', { class: 'num', text: count[k] + '/' + target[k] }),
        el('span', { class: 'lbl', text: TIER_LABEL[k] })
      ]));
    });

    var over = Object.keys(target).filter(function (k) { return count[k] > target[k]; });
    var msg, kind;
    if (picks.length === MAX_PICKS && !over.length) {
      kind = 'ok'; msg = '✓ Nice balance: 1 aspirational, 3 match, 1 safer.';
    } else if (over.length || picks.length === MAX_PICKS) {
      kind = 'warn';
      var parts = [];
      Object.keys(target).forEach(function (k) {
        if (count[k] !== target[k]) parts.push(count[k] + ' ' + TIER_LABEL[k].toLowerCase());
      });
      msg = '⚠ This mix isn’t 1 aspirational / 3 match / 1 safer (you have ' + parts.join(', ') + '). ';
      if (count.safer === 0) msg += 'Without a safer choice, you could end up with no offers.';
      else if (count.aspirational === 0) msg += 'Consider one aspirational course to aim high.';
      else msg += 'It can still work, but check you have a realistic backup.';
    } else {
      kind = 'info';
      var left = MAX_PICKS - picks.length;
      msg = left + ' more to go.';
    }
    wrap.appendChild(el('p', { class: 'mix-msg ' + kind, text: msg }));
  }

  /* ---------- checklist ---------- */
  function initChecklist() {
    var state = load(KEYS.checklist, {}) || {};
    var boxes = Array.prototype.slice.call(document.querySelectorAll('#checklist input[type="checkbox"]'));
    function update() {
      var done = 0;
      boxes.forEach(function (b) {
        b.closest('li').classList.toggle('checked', b.checked);
        if (b.checked) done++;
      });
      $('#checklist-progress').textContent = done + ' of ' + boxes.length + ' done' + (done === boxes.length ? ' 🎉' : '');
    }
    boxes.forEach(function (b) {
      b.checked = !!state[b.dataset.key];
      b.addEventListener('change', function () {
        state[b.dataset.key] = b.checked;
        save(KEYS.checklist, state);
        update();
      });
    });
    update();
  }

  /* ---------- small-screen table labels ---------- */
  function labelTables() {
    document.querySelectorAll('table.combos').forEach(function (t) {
      var heads = Array.prototype.map.call(t.querySelectorAll('thead th'), function (th) { return th.textContent; });
      t.querySelectorAll('tbody tr').forEach(function (tr) {
        Array.prototype.forEach.call(tr.children, function (cell, i) {
          if (cell.tagName === 'TD') cell.setAttribute('data-label', heads[i]);
        });
      });
    });
  }

  /* ---------- boot ---------- */
  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }

  initTabs();
  initChecklist();
  labelTables();
  updateCountdown();
  setInterval(updateCountdown, 30000);

  Promise.all([getJSON('data/universities.json'), getJSON('data/courses.json'), getJSON('data/disciplines.json'), getJSON('data/subjects.json')])
    .then(function (res) {
      unis = res[0];
      courses = res[1];
      disciplines = res[2];
      subjects = res[3];
      courses.forEach(function (c) { courseById[c.id] = c; });
      picks = (load(KEYS.picks, []) || []).filter(function (id) { return courseById[id]; }).slice(0, MAX_PICKS);
      initOverview();
      initJump();
      renderShortlists();
      renderPicks();
    })
    .catch(function () {
      $('#load-error').hidden = false;
    });
})();
