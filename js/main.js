// === HÄLSOKÄLLAN — Huvud-JS ===

document.addEventListener('DOMContentLoaded', () => {
  initHamburgerMenu();
  initAccordions();
  initMakroKalkylator();
  setActivNavLink();
  initVideoLänkar();
  initProgramväljare();
});

// --- Hamburger-meny ---
function initHamburgerMenu() {
  const btn = document.querySelector('.navbar__hamburger');
  const menu = document.querySelector('.navbar__mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const öppen = menu.classList.toggle('öppen');
    btn.setAttribute('aria-expanded', öppen);
  });
}

// --- Accordion ---
function initAccordions() {
  document.querySelectorAll('.accordion__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const öppen = btn.classList.toggle('öppen');
      content.classList.toggle('synlig', öppen);
    });
  });
}

// --- Aktiv nav-länk ---
function setActivNavLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.navbar__nav-link, .dropdown__item').forEach(a => {
    const href = a.getAttribute('href');
    if (href && path.includes(href) && href !== '../index.html' && href !== 'index.html' && href !== '/') {
      a.classList.add('aktiv');
    }
  });
}

// --- Makro-kalkylator ---
function initMakroKalkylator() {
  const form = document.getElementById('makro-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const vikt  = parseFloat(document.getElementById('mkr-vikt').value);
    const längd = parseFloat(document.getElementById('mkr-längd').value);
    const ålder = parseFloat(document.getElementById('mkr-ålder').value);
    const kön   = document.getElementById('mkr-kön').value;
    const aktiv = parseFloat(document.getElementById('mkr-aktivitet').value);
    const mål   = document.getElementById('mkr-mål').value;

    if (!vikt || !längd || !ålder) return;

    // Harris-Benedict BMR
    let bmr;
    if (kön === 'man') {
      bmr = 88.362 + (13.397 * vikt) + (4.799 * längd) - (5.677 * ålder);
    } else {
      bmr = 447.593 + (9.247 * vikt) + (3.098 * längd) - (4.330 * ålder);
    }
    let tdee = bmr * aktiv;

    let kalMål = tdee;
    if (mål === 'minska') kalMål = tdee - 500;
    if (mål === 'öka')    kalMål = tdee + 300;

    const protein = vikt * 1.8;
    const fett    = kalMål * 0.25 / 9;
    const kolhydr = (kalMål - protein * 4 - fett * 9) / 4;

    const res = document.getElementById('makro-resultat');
    res.classList.add('synlig');
    document.getElementById('mkr-res-kal').textContent = Math.round(kalMål) + ' kcal';
    document.getElementById('mkr-res-prot').textContent = Math.round(protein) + ' g';
    document.getElementById('mkr-res-fett').textContent = Math.round(fett) + ' g';
    document.getElementById('mkr-res-kol').textContent = Math.round(kolhydr) + ' g';
  });
}

// --- Sök-logik (används på sok.html) ---
function initSök() {
  const input = document.getElementById('sök-input');
  const resultatDiv = document.getElementById('sök-resultat');
  const countDiv = document.getElementById('sök-count');
  if (!input || !resultatDiv) return;

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  if (q) { input.value = q; utförSök(q); }

  input.closest('form')?.addEventListener('submit', e => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) {
      history.replaceState(null, '', `?q=${encodeURIComponent(query)}`);
      utförSök(query);
    }
  });

  function utförSök(query) {
    const lower = query.toLowerCase();
    const träffar = (window.sökData || []).filter(item => {
      return (
        item.titel.toLowerCase().includes(lower) ||
        item.beskr.toLowerCase().includes(lower) ||
        (item.taggar || []).some(t => t.toLowerCase().includes(lower))
      );
    });

    if (countDiv) countDiv.textContent = `${träffar.length} resultat för "${query}"`;

    if (träffar.length === 0) {
      resultatDiv.innerHTML = `
        <div class="sök-tom">
          <div style="font-size:3rem">🔍</div>
          <p>Inga resultat hittades för "<strong>${escHtml(query)}</strong>".</p>
          <p>Prova ett annat sökord, t.ex. "knäböj", "LCHF" eller "löpning".</p>
        </div>`;
      return;
    }

    resultatDiv.innerHTML = träffar.map(item => `
      <a href="${item.url}" class="sök-resultat-item" style="display:block;text-decoration:none;">
        <div class="sök-resultat-item__kat">${escHtml(item.kategori)}</div>
        <div class="sök-resultat-item__titel">${markeraMatcher(escHtml(item.titel), lower)}</div>
        <div class="sök-resultat-item__beskr">${markeraMatcher(escHtml(item.beskr), lower)}</div>
      </a>
    `).join('');
  }

  function markeraMatcher(text, q) {
    if (!q) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function escHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
}

window.addEventListener('load', initSök);

// --- Programväljare (quiz-widget på startsidan) ---
function initProgramväljare() {
  const widget = document.getElementById('pv-steg-1');
  if (!widget) return;

  const val = { typ: null, frekvens: null, mål: null, erfarenhet: null };

  // Välj-knappar (toggle inom sin grupp)
  document.querySelectorAll('.pv-välj').forEach(btn => {
    btn.addEventListener('click', () => {
      const grupp = btn.dataset.grupp;
      document.querySelectorAll(`.pv-välj[data-grupp="${grupp}"]`).forEach(b => b.classList.remove('vald'));
      btn.classList.add('vald');
      val[grupp] = btn.dataset.val;
    });
  });

  // Nästa-knappar
  document.querySelectorAll('.pv-nästa').forEach(btn => {
    btn.addEventListener('click', () => {
      const till = btn.dataset.nästa;
      if (!valideraSteg(till === '2' ? '1' : '2')) return;
      gåTillSteg(parseInt(till));
    });
  });

  // Tillbaka-knappar
  document.querySelectorAll('.pv-tillbaka').forEach(btn => {
    btn.addEventListener('click', () => gåTillSteg(parseInt(btn.dataset.tillbaka)));
  });

  // Beräkna-knapp
  document.getElementById('pv-beräkna')?.addEventListener('click', () => {
    if (!valideraSteg('3')) return;
    visaResultat();
  });

  function valideraSteg(steg) {
    const felEl = document.getElementById(`pv-fel-${steg}`);
    if (steg === '1') {
      const å = document.getElementById('pv-ålder').value;
      const k = document.getElementById('pv-kön').value;
      const v = document.getElementById('pv-vikt').value;
      const l = document.getElementById('pv-längd').value;
      if (!å || !k || !v || !l) {
        if (felEl) felEl.textContent = 'Fyll i alla fält för att gå vidare.';
        return false;
      }
      if (felEl) felEl.textContent = '';
      return true;
    }
    if (steg === '2') {
      if (!val.typ || !val.frekvens || !val.mål) {
        if (felEl) felEl.textContent = 'Välj ett alternativ i varje fråga.';
        return false;
      }
      if (felEl) felEl.textContent = '';
      return true;
    }
    if (steg === '3') {
      if (!val.erfarenhet) {
        if (felEl) felEl.textContent = 'Välj din erfarenhetsnivå.';
        return false;
      }
      if (felEl) felEl.textContent = '';
      return true;
    }
    return true;
  }

  function gåTillSteg(n) {
    [1, 2, 3].forEach(i => {
      const el = document.getElementById(`pv-steg-${i}`);
      if (el) el.classList.toggle('pv-steg--dold', i !== n);
      const punkt = document.querySelector(`.pv-steg-ind__punkt[data-steg="${i}"]`);
      if (punkt) {
        punkt.classList.toggle('aktiv', i === n);
        punkt.classList.toggle('klar', i < n);
      }
    });
    // Linjer
    document.querySelectorAll('.pv-steg-ind__linje').forEach((l, i) => {
      l.classList.toggle('klar', i + 1 < n);
    });
    document.getElementById('pv-resultat')?.classList.add('pv-steg--dold');
  }

  function visaResultat() {
    const ålder    = parseInt(document.getElementById('pv-ålder').value);
    const kön      = document.getElementById('pv-kön').value;
    const vikt     = parseFloat(document.getElementById('pv-vikt').value);
    const längd    = parseFloat(document.getElementById('pv-längd').value);
    const { typ, frekvens, mål, erfarenhet } = val;

    // Åldersgrupp
    let åldersUrl, ålderNamn;
    if (ålder <= 17)      { åldersUrl = 'aldersgrupper/barn.html';       ålderNamn = '🧒 Barn & Ungdomar (6–17)'; }
    else if (ålder <= 30) { åldersUrl = 'aldersgrupper/unga-vuxna.html'; ålderNamn = '🏋️ Unga Vuxna (18–30)'; }
    else if (ålder <= 50) { åldersUrl = 'aldersgrupper/vuxna.html';      ålderNamn = '👨‍👩‍👧 Vuxna (31–50)'; }
    else if (ålder <= 65) { åldersUrl = 'aldersgrupper/medelalder.html'; ålderNamn = '🧓 Medelålders (51–65)'; }
    else                  { åldersUrl = 'aldersgrupper/seniorer.html';   ålderNamn = '👴 Seniorer (65+)'; }

    // Program-rekommendation
    let progNamn, progUrl, progBeskr;
    if (typ === 'styrka') {
      progUrl = 'traning/styrketraning.html';
      if (erfarenhet === 'nybörjare') {
        progNamn = '3-dagars Nybörjarprogram – Helkropp';
        progBeskr = 'Perfekt start med de viktigaste grundövningarna. Full vila mellan passen för optimal återhämtning.';
      } else if (erfarenhet === 'mellannivå') {
        progNamn = parseInt(frekvens) >= 4 ? 'Upper/Lower Split – 4 dagar' : '5×5 StrongLifts';
        progBeskr = parseInt(frekvens) >= 4
          ? 'Träna överkropp och underkropp på separata dagar för maximal volym och styrka.'
          : 'Beprövat 3-dagarsprogram med fokus på de 5 stora lyften och progressiv överbelastning.';
      } else {
        progNamn = 'PPL – Push/Pull/Legs (6 dagar)';
        progBeskr = 'Maximalt fokus per muskelgrupp med hög volym. Kräver konsistens och god återhämtning.';
      }
    } else if (typ === 'kondition') {
      progUrl = 'traning/konditionstraning.html';
      if (erfarenhet === 'nybörjare') {
        progNamn = 'Couch to 5K – 9 veckor';
        progBeskr = 'Börja från noll och spring 5 km på 9 veckor. Världens mest beprövade löparprogram.';
      } else if (erfarenhet === 'mellannivå') {
        progNamn = '10K Löpprogram – 8 veckor';
        progBeskr = 'Ta steget från 5K till 10K med strukturerade intervall- och distanspass.';
      } else {
        progNamn = 'Halvmaratonprogram – 12 veckor';
        progBeskr = 'Seriös löpträning mot halvmaraton med periodisering och tempopass.';
      }
    } else if (typ === 'hemma') {
      progUrl = 'traning/hemmatraning.html';
      progNamn = 'Hemmaträning – Kroppsviktsprogram';
      progBeskr = 'Effektiv träning utan utrustning. Progressiva övningar anpassade för din nivå – bänk, soffa och golv räcker.';
    } else if (typ === 'rörlighet') {
      progUrl = 'traning/rorlighet.html';
      progNamn = 'Rörlighet & Stretching';
      progBeskr = 'Förbättra rörelseförmågan, minska stelhet och öka välmående med regelbunden rörlighetsträning.';
    } else {
      progUrl = åldersUrl;
      progNamn = erfarenhet === 'nybörjare' ? 'Nybörjarprogram – anpassat för din ålder' : 'Allround-program – styrka & kondition';
      progBeskr = 'Balanserat program med mix av styrka och kondition, anpassat för din livssituation och ålder.';
    }

    // Kaloriberäkning (Harris-Benedict)
    let bmr = kön === 'man'
      ? 88.362 + 13.397 * vikt + 4.799 * längd - 5.677 * ålder
      : 447.593 + 9.247 * vikt + 3.098 * längd - 4.330 * ålder;

    const aktivMult = { '2': 1.375, '3': 1.55, '4': 1.65, '5': 1.725 }[frekvens] || 1.55;
    let tdee = bmr * aktivMult;
    const kalJust = mål === 'viktnedgång' ? -450 : mål === 'muskler' ? +300 : 0;
    const dagligKal = Math.round(tdee + kalJust);

    const protFaktor = (mål === 'muskler' || typ === 'styrka') ? 2.0 : mål === 'viktnedgång' ? 1.8 : typ === 'kondition' ? 1.5 : 1.4;
    const protein  = Math.round(vikt * protFaktor);
    const fett     = Math.round(dagligKal * 0.25 / 9);
    const kolhydr  = Math.max(0, Math.round((dagligKal - protein * 4 - fett * 9) / 4));

    const kostNamn = { viktnedgång: 'Kaloriunderskott + högt protein', muskler: 'Lean Bulk – kaloriöverskott', kondition: 'Prestationskost', hälsa: 'Balanserad kost 80/20' }[mål];
    const kostBeskr = {
      viktnedgång: 'Fokus på mättande mat med högt proteininnehåll. Grönsaker, magert protein och medveten portionering.',
      muskler:     'Lite mer mat än underhållsbehovet med protein i varje måltid. Välj hela livsmedel.',
      kondition:   'Tillräckligt med kolhydrater för energi. Pre-workout-måltid är viktig – havre, banan eller fullkorn.',
      hälsa:       '80/20-regeln: äta bra 80 % av tiden. Protein, grönsaker, fullkorn och bra fetter varje dag.'
    }[mål];

    // Rendera resultaten
    const resEl = document.getElementById('pv-resultat');
    resEl.innerHTML = `
      <div class="pv-resultat-rubrik">🎉 Ditt personliga program</div>
      <a href="${åldersUrl}" class="pv-ålder-chip">${ålderNamn} →</a>
      <div class="pv-resultat-grid">
        <div class="pv-res-kort">
          <div class="pv-res-kort__etikett">💪 Rekommenderat träningsprogram</div>
          <div class="pv-res-kort__namn">${progNamn}</div>
          <div class="pv-res-kort__beskr">${progBeskr}</div>
          <a href="${progUrl}" class="pv-resultat-länk">Gå till programmet →</a>
        </div>
        <div class="pv-res-kort pv-res-kort--kost">
          <div class="pv-res-kort__etikett">🥦 Kostplan</div>
          <div class="pv-res-kort__namn">${kostNamn}</div>
          <div class="pv-res-kort__beskr">${kostBeskr}</div>
          <div class="pv-makro-rad">
            <span class="pv-makro-chip">⚡ ${dagligKal} kcal/dag</span>
            <span class="pv-makro-chip">🥩 ${protein} g protein</span>
            <span class="pv-makro-chip">🍞 ${kolhydr} g kolh.</span>
            <span class="pv-makro-chip">🥑 ${fett} g fett</span>
          </div>
          <a href="kost/makrorakning.html" class="pv-resultat-länk">Fördjupa med makrokalkylator →</a>
        </div>
      </div>
      <button class="pv-om-igen" id="pv-om-igen">↩ Börja om</button>
    `;

    // Dölj steg 3, visa resultat
    document.getElementById('pv-steg-3').classList.add('pv-steg--dold');
    resEl.classList.remove('pv-steg--dold');

    document.getElementById('pv-om-igen').addEventListener('click', () => {
      // Återställ allt
      val.typ = val.frekvens = val.mål = val.erfarenhet = null;
      document.querySelectorAll('.pv-välj').forEach(b => b.classList.remove('vald'));
      ['pv-ålder','pv-vikt','pv-längd'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      document.getElementById('pv-kön').value = '';
      resEl.classList.add('pv-steg--dold');
      gåTillSteg(1);
    });
  }
}

// --- Video-länkar på övningskort ---
function initVideoLänkar() {
  document.querySelectorAll('.övning-card').forEach(card => {
    const namnEl  = card.querySelector('.övning-card__namn');
    const beskrEl = card.querySelector('.övning-card__beskr');
    if (!namnEl || !beskrEl) return;

    const namn    = namnEl.textContent.trim();
    const sökterm = encodeURIComponent(namn + ' teknik träning');
    const url     = 'https://www.youtube.com/results?search_query=' + sökterm;

    const länk = document.createElement('a');
    länk.href   = url;
    länk.target = '_blank';
    länk.rel    = 'noopener noreferrer';
    länk.className = 'video-länk';
    länk.textContent = '▶ Se video på YouTube';

    beskrEl.after(länk);
  });
}
