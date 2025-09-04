// script.js  (повна заміна)
(() => {
  // Визначаємо, який JSON і який бейдж показувати
  function getSeasonInfo(today = new Date()){
    const m = today.getMonth();   // 0=січень ... 11=грудень
    const d = today.getDate();

    if (m === 11 && d >= 1 && d <= 31) {
      return {
        key: 'xmas',
        url: new URL('./data/fortunes_christmas.json', window.location.href).toString(),
        badge: '🎄 Різдвяні'
      };
    }
    if (m === 3 && d === 1) {
      return {
        key: 'april',
        url: new URL('./data/fortunes_april.json', window.location.href).toString(),
        badge: '😄 1 квітня'
      };
    }
    return {
      key: 'default',
      url: new URL('./data/fortunes.json', window.location.href).toString(),
      badge: '' // без бейджа
    };
  }

  // Проста сесійна «памʼять», без складних структур
  let cacheKey = null;
  let fortunesCache = null;
  let currentFortune = '';

  const fortuneEl  = document.getElementById('fortune-text');
  const categoryEl = document.getElementById('category');
  const getBtn     = document.getElementById('get-btn');
  const copyBtn    = document.getElementById('copy-btn');

  // Додаємо/оновлюємо сезонний бейдж у картці
  const cardEl = document.querySelector('.card');
  const badgeEl = document.createElement('div');
  badgeEl.className = 'season-badge';
  cardEl?.insertBefore(badgeEl, cardEl.firstChild);

  async function loadFortunes(){
    const { key, url, badge } = getSeasonInfo();

    // показуємо/ховаємо бейдж
    if (badge) {
      badgeEl.textContent = badge;
      badgeEl.style.display = 'inline-flex';
    } else {
      badgeEl.style.display = 'none';
    }

    // якщо вже завантажено для цієї пори — не фетчимо вдруге
    if (fortunesCache && cacheKey === key) return fortunesCache;

    const res = await fetch(url); // без no-store — на Pages все ок
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Невірний формат даних');

    cacheKey = key;
    fortunesCache = data;
    return fortunesCache;
  }

  function getRandomItem(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function pickFortune(fortunes, category){
    const pool = (!category || category === 'all')
      ? fortunes
      : fortunes.filter(f => f.category === category);
    if (!pool.length) return null;
    const item = getRandomItem(pool);
    return item?.text || null;
  }

  async function showFortune(){
    fortuneEl.textContent = '✨ ...';
    fortuneEl.classList.add('loading');
    getBtn.disabled = true;
    copyBtn.disabled = true;

    try{
      const fortunes = await loadFortunes();
      setTimeout(() => {
        const cat = categoryEl ? (categoryEl.value || 'all') : 'all';
        const text = pickFortune(fortunes, cat) || 'Немає передбачень для цієї категорії.';
        currentFortune = text;
        fortuneEl.textContent = text;
        fortuneEl.classList.remove('loading');
        getBtn.disabled = false;
        copyBtn.disabled = !text || text.startsWith('Немає передбачень');
      }, 300);
    }catch(err){
      console.error('Помилка завантаження передбачень:', err);
      fortuneEl.classList.remove('loading');
      fortuneEl.textContent = 'Не вдалося завантажити передбачення. Спробуйте пізніше.';
      getBtn.disabled = false;
      copyBtn.disabled = true;
    }
  }

  async function copyFortune(){
    if(!currentFortune) return;
    const original = copyBtn.textContent;
    try{
      if (navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(currentFortune);
      }else{
        const ta = document.createElement('textarea');
        ta.value = currentFortune; ta.setAttribute('readonly','');
        ta.style.position='absolute'; ta.style.left='-9999px';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      copyBtn.textContent = 'Скопійовано!';
      copyBtn.disabled = true;
      setTimeout(()=>{ copyBtn.textContent = original; copyBtn.disabled = false; }, 1200);
    }catch{
      copyBtn.textContent = 'Помилка копіювання';
      setTimeout(()=>{ copyBtn.textContent = original; }, 1200);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadFortunes().catch(()=>{});
    getBtn.addEventListener('click', showFortune);
    copyBtn.addEventListener('click', copyFortune);
    categoryEl?.addEventListener('change', () => { copyBtn.disabled = true; });
  });
})();
