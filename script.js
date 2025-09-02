
(() => {
  // Формуємо коректний шлях незалежно від підшляху репозиторію
  const DATA_URL = new URL('./data/fortunes.json', window.location.href).toString();

  let fortunesCache = null;
  let currentFortune = '';

  const fortuneEl = document.getElementById('fortune-text');
  const getBtn = document.getElementById('get-btn');
  const copyBtn = document.getElementById('copy-btn');

  async function loadFortunes(){
    if (fortunesCache) return fortunesCache;
    // Без { cache: 'no-store' } — Pages іноді вередує з цим заголовком
    const res = await fetch(DATA_URL);
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if(!Array.isArray(data)) throw new Error('Невірний формат даних');
    fortunesCache = data;
    return fortunesCache;
  }

  function getRandomItem(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function getFortune(){
  if (!fortunesCache.length) return null;
  const item = getRandomItem(fortunesCache);
  return item?.text || null;
}

  async function showFortune(){
    fortuneEl.textContent = '✨ ...';
    fortuneEl.classList.add('loading');
    getBtn.disabled = true;
    copyBtn.disabled = true;

    try{
      await loadFortunes();
      setTimeout(() => {
        const text = getFortune() || 'Немає передбачень.';
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
      if(navigator.clipboard?.writeText){
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

  });
})();
