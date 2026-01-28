const pageOrder = [
  'dashboard',
  'new-project',
  'insights',
  'campaign-detail',
  'waste-detail',
  'competitors',
  'campaign-blueprint',
  'ai-chat',
  'action',
  'task-guide',
  'task-apply',
  'how-dina-works'
];

async function loadPages(){
  const container = document.getElementById('pages');
  if(!container) return;

  for(const id of pageOrder){
    try {
      const res = await fetch(`pages/${id}.html`);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      container.insertAdjacentHTML('beforeend', html);
    } catch (err) {
      // Minimal fallback to avoid breaking navigation if a partial is missing
      container.insertAdjacentHTML('beforeend', `<section class="page" id="${id}"><div class="note">Failed to load ${id} (${err.message})</div></section>`);
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadPages();
  if(typeof window.bootstrapWireframe === 'function'){
    window.bootstrapWireframe();
  }
});
