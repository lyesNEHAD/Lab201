/* ════════════════════════════════════════════════════════
   dashboard.js — Tour dates CRUD logic
════════════════════════════════════════════════════════ */

import {
  signOut,
  onAuthStateChanged,
  onSnapshotTourDates,
  addTourDate,
  updateTourDate,
  deleteTourDate,
} from 'firebase.js';

/* ════════════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════════════ */
let allDates         = [];
let editingId        = null;
let deleteId         = null;
let unsubscribeDates = null;

/* ════════════════════════════════════════════════════════
   DOM REFS
════════════════════════════════════════════════════════ */
const logoutBtn      = document.getElementById('logout-btn');
const tbody          = document.getElementById('dates-tbody');
const btnAdd         = document.getElementById('btn-add-date');
const searchInput    = document.getElementById('search-input');
const modalOverlay   = document.getElementById('modal-overlay');
const confirmOverlay = document.getElementById('confirm-overlay');
const modalTitle     = document.getElementById('modal-title');
const modalClose     = document.getElementById('modal-close');
const modalCancel    = document.getElementById('modal-cancel');
const modalSave      = document.getElementById('modal-save');
const confirmCancel  = document.getElementById('confirm-cancel');
const confirmDel     = document.getElementById('confirm-delete');
const toastWrap      = document.getElementById('toast-wrap');

const fDate    = document.getElementById('f-date');
const fPays    = document.getElementById('f-pays');
const fVille   = document.getElementById('f-ville');
const fLieu    = document.getElementById('f-lieu');
const fEvent   = document.getElementById('f-event');
const fTickets = document.getElementById('f-tickets');
const fSoldout = document.getElementById('f-soldout');
const citiesList = document.getElementById('cities-list');

const citySuggestions = {
  France:    ['Paris','Lyon','Marseille','Nice','Lille','Bordeaux','Toulouse','Nantes','Strasbourg'],
  Belgique:  ['Bruxelles','Liège','Anvers','Gand'],
  Suisse:    ['Genève','Zurich','Lausanne','Berne'],
  Canada:    ['Montréal','Toronto','Vancouver','Québec','Ottawa'],
  Espagne:   ['Madrid','Barcelone','Valence','Séville','Malaga'],
  Italie:    ['Rome','Milan','Naples','Turin','Venise'],
  USA:       ['New York','Los Angeles','Miami','Chicago','Las Vegas'],
  Allemagne: ['Berlin','Munich','Hambourg','Cologne'],
};

fPays.addEventListener('click', () => fPays.select());
fVille.addEventListener('click', () => fVille.select());

fPays.addEventListener('input', () => {
  const country = fPays.value.trim();
  citiesList.innerHTML = '';
  fVille.placeholder = 'Ville';
  if (!citySuggestions[country]) return;
  if (citySuggestions[country].length > 0) {
    fVille.placeholder = citySuggestions[country][0];
  }
  citySuggestions[country].forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    citiesList.appendChild(option);
  });
});

/* ════════════════════════════════════════════════════════
   AUTH GUARD
════════════════════════════════════════════════════════ */
const unsubscribeAuth = onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'admin.html';
  } else if (!unsubscribeDates) {
    listenDates();
  }
});

/* ════════════════════════════════════════════════════════
   LOGOUT
════════════════════════════════════════════════════════ */
logoutBtn.addEventListener('click', async () => {
  if (unsubscribeDates) unsubscribeDates();
  unsubscribeAuth();
  await signOut();
  window.location.href = 'admin.html';
});

/* ════════════════════════════════════════════════════════
   FIREBASE — real-time listener
════════════════════════════════════════════════════════ */
function listenDates() {
  unsubscribeDates = onSnapshotTourDates(
    (data) => {
      allDates = data;
      updateStats();
      renderTable(searchInput.value);
    },
    (err) => {
      toast('Erreur de chargement Firebase', 'error');
      console.error(err);
    }
  );
}

/* ════════════════════════════════════════════════════════
   STATS
════════════════════════════════════════════════════════ */
function updateStats() {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('stat-total').textContent     = allDates.length;
  document.getElementById('stat-upcoming').textContent  = allDates.filter(d => d.date >= today).length;
  document.getElementById('stat-soldout').textContent   = allDates.filter(d => d.soldout).length;
  document.getElementById('stat-countries').textContent = new Set(allDates.map(d => d.pays)).size;
}

/* ════════════════════════════════════════════════════════
   RENDER TABLE
════════════════════════════════════════════════════════ */
function renderTable(filter = '') {
  const f = filter.toLowerCase();
  const filtered = allDates.filter(d =>
    !f ||
    (d.date  || '').includes(f) ||
    (d.ville || '').toLowerCase().includes(f) ||
    (d.pays  || '').toLowerCase().includes(f) ||
    (d.lieu  || '').toLowerCase().includes(f) ||
    (d.event || '').toLowerCase().includes(f)
  );

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <p>${filter
            ? `Aucun résultat pour « ${filter} »`
            : 'Aucune date enregistrée. Ajoutez votre première date !'
          }</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(d => `
    <tr>
      <td class="td-date">${formatDate(d.date)}</td>
      <td class="td-name">${esc(d.event || '—')}</td>
      <td class="td-location">${esc(d.ville || '—')}, ${esc(d.pays || '—')}</td>
      <td class="td-venue" title="${esc(d.lieu || '')}">${esc(d.lieu || '—')}</td>
      <td>
        <span class="badge-soldout ${d.soldout ? 'yes' : 'no'}">
          <span class="badge-dot"></span>
          ${d.soldout ? 'Complet' : 'Disponible'}
        </span>
      </td>
      <td>
        <div class="td-actions" style="justify-content:flex-end;">
          <button class="action-btn" data-edit="${d.id}" title="Modifier">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-btn danger" data-delete="${d.id}" title="Supprimer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-edit]').forEach(btn =>
    btn.addEventListener('click', () => editDate(btn.dataset.edit))
  );
  tbody.querySelectorAll('[data-delete]').forEach(btn =>
    btn.addEventListener('click', () => askDelete(btn.dataset.delete))
  );
}

searchInput.addEventListener('input', e => renderTable(e.target.value));

/* ════════════════════════════════════════════════════════
   MODAL — open / close
════════════════════════════════════════════════════════ */
function openModal(mode = 'add', data = null) {
  editingId = mode === 'edit' ? data.id : null;
  modalTitle.textContent = mode === 'edit' ? 'Modifier la date' : 'Ajouter une date';
  fDate.value      = data?.date    || '';
  fPays.value      = data?.pays    || '';
  fVille.value     = data?.ville   || '';
  fLieu.value      = data?.lieu    || '';
  fEvent.value     = data?.event   || '';
  fTickets.value   = data?.tickets || '';
  fSoldout.checked = data?.soldout || false;
  modalOverlay.classList.add('open');
  setTimeout(() => fDate.focus(), 100);
}

function closeModal() {
  modalOverlay.classList.remove('open');
  editingId = null;
}

btnAdd.addEventListener('click', () => openModal('add'));
modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

/* ════════════════════════════════════════════════════════
   SAVE
════════════════════════════════════════════════════════ */
modalSave.addEventListener('click', async () => {
  const data = {
    date:    fDate.value,
    pays:    fPays.value.trim(),
    ville:   fVille.value.trim(),
    lieu:    fLieu.value.trim(),
    event:   fEvent.value.trim(),
    tickets: fTickets.value.trim(),
    soldout: fSoldout.checked,
  };

  if (!data.date || !data.ville || !data.pays) {
    toast('Veuillez remplir la date, la ville et le pays.', 'error');
    return;
  }

  modalSave.textContent = 'Enregistrement…';
  modalSave.disabled    = true;

  try {
    if (editingId) {
      await updateTourDate(editingId, data);
      toast('Date modifiée avec succès', 'success');
    } else {
      await addTourDate(data);
      toast('Nouvelle date ajoutée', 'success');
    }
    closeModal();
  } catch (e) {
    toast("Erreur lors de l'enregistrement", 'error');
    console.error(e);
  } finally {
    modalSave.textContent = 'Enregistrer';
    modalSave.disabled    = false;
  }
});

/* ════════════════════════════════════════════════════════
   EDIT / DELETE
════════════════════════════════════════════════════════ */
function editDate(id) {
  const d = allDates.find(x => String(x.id) === String(id));
  if (d) openModal('edit', d);
}

function askDelete(id) {
  deleteId = String(id);
  confirmOverlay.classList.add('open');
}

confirmCancel.addEventListener('click', () => {
  confirmOverlay.classList.remove('open');
  deleteId = null;
});

confirmOverlay.addEventListener('click', e => {
  if (e.target === confirmOverlay) {
    confirmOverlay.classList.remove('open');
    deleteId = null;
  }
});

confirmDel.addEventListener('click', async () => {
  if (!deleteId) return;
  confirmDel.textContent = 'Suppression…';
  confirmDel.disabled    = true;
  try {
    await deleteTourDate(deleteId);
    toast('Date supprimée', 'success');
    confirmOverlay.classList.remove('open');
    deleteId = null;
  } catch (e) {
    toast('Erreur lors de la suppression', 'error');
    console.error(e);
  } finally {
    confirmDel.textContent = 'Supprimer';
    confirmDel.disabled    = false;
  }
});

/* ════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════ */
function formatDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-dot"></span>${msg}`;
  toastWrap.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}