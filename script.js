// script.js
// Мінімальна клієнтська логіка без бібліотек.
// Завантаження JSON, фільтрація, випадковий вибір, копіювання в буфер.

(() => {
  const DATA_URL = 'data/fortunes.json';

  let fortunesCache = null;   // [{ category, text }, ...]
  let currentFortune = '';    // поточний текст для копіювання

  const fortuneEl = document.getElementById('fortune-text');
  const categoryEl = document.getElementById('category');
  const getBtn = document.getElementById('get-btn');
  const copyBtn = document.getElementById('copy-btn');

  async function loadFortunes(){
    if (fortunesCache) return fortunesCache;
    try{
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if(!Array.isArray(data)) throw new Error('Невірний формат даних');
      fortunesCache = data;
      return fortunesCache;
    }catch(err){
      console.error('Помилка завантаження передбачень:', err);
      throw err;
    }
  }

  function getRandomItem(arr){
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx];
  }

  function getFortune(category){
    if (!fortunesCache || !Array.isArray(fortunesCache)) return null;

    const pool = category === 'all'
      ? fortunesCache
      : fortunesCache.filter(f => f.category === category);

    if (!pool.length) return null;

    const item = getRandomItem(pool);
    return item?.text || null;
  }

  async function showFortune(){
    // Стан завантаження
    fortuneEl.textContent = '✨ ...';
    fortuneEl.classList.add('loading');
    getBtn.disabled = true;
    copyBtn.disabled = true;

    try{
      await loadFortunes();
      // Невелика затримка для відчуття "завантажується"
      setTimeout(() => {
        const cat = categoryEl.value || 'all';
        const text = getFortune(cat) || 'Немає передбачень для цієї категорії.';
        currentFortune = text;
        fortuneEl.textContent = text;
        fortuneEl.classList.remove('loading');
        getBtn.disabled = false;
        copyBtn.disabled = !text || text === 'Немає передбачень для цієї категорії.';
      }, 350);
    }catch(_){
      fortuneEl.classList.remove('loading');
      fortuneEl.textContent = 'Не вдалося завантажити передбачення. Спробуйте пізніше.';
      getBtn.disabled = false;
      copyBtn.disabled = true;
    }
  }

  async function copyFortune(){
    if(!currentFortune){
      return;
    }
    const originalLabel = copyBtn.textContent;
    try{
      if (navigator.clipboard && navigator.clipboard.writeText){
        await navigator.clipboard.writeText(currentFortune);
      }else{
        // Фолбек
        const ta = document.createElement('textarea');
        ta.value = currentFortune;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      copyBtn.textContent = 'Скопійовано!';
      copyBtn.disabled = true;
      setTimeout(() => {
        copyBtn.textContent = originalLabel;
        copyBtn.disabled = false;
      }, 1200);
    }catch(err){
      console.error('Не вдалося скопіювати:', err);
      copyBtn.textContent = 'Помилка копіювання';
      setTimeout(() => { copyBtn.textContent = originalLabel; }, 1200);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Попереднє завантаження даних (тихо)
    loadFortunes().catch(() => { /* тихо */ });

    getBtn.addEventListener('click', showFortune);
    copyBtn.addEventListener('click', copyFortune);

    // Зміна категорії не тригерить показ — лише впливає на вибір
    categoryEl.addEventListener('change', () => {
      // Після зміни категорії ще немає нового тексту — блок копіювання вимкнено
      copyBtn.disabled = true;
    });
  });
})();
