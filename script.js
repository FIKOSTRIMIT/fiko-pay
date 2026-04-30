let currentData = null; // Глобальная переменная для хранения данных текущей игры

function openGame(gameId) {
    const game = games.find(g => g.id === gameId);
    currentData = priceData[gameId]; // Запоминаем данные выбранной игры
    
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('item-page').style.display = 'block';
    
    document.getElementById('product-title').innerText = game.name;
    document.getElementById('product-img').src = game.img;
    document.getElementById('bg-text').innerText = currentData.bg;

    // Отрисовка полей ввода ID
    const idSection = document.getElementById('id-section');
    if(gameId === 'mlbb') {
        idSection.innerHTML = `
            <div style="display: grid; grid-template-columns: 2.5fr 1fr; gap: 10px;">
                <div><span class="input-label">GAME ID</span><div class="input-inner"><input type="number" id="player-id" placeholder="ID"></div></div>
                <div><span class="input-label">ZONE</span><div class="input-inner"><input type="number" id="zone-id" placeholder="Zone"></div></div>
            </div>`;
    } else if(gameId === 'tg_prem' || gameId === 'stars') {
        idSection.innerHTML = `
            <span class="input-label">TG USERNAME / ID</span>
            <div class="input-inner" style="margin-bottom:10px;"><input type="text" id="player-id" placeholder="@username"></div>
            <button class="self-buy-btn" onclick="fillSelf()">O'zim uchun</button>`;
    } else {
        idSection.innerHTML = `<span class="input-label">PLAYER ID</span><div class="input-inner"><input type="number" id="player-id" placeholder="Введите ID"></div>`;
    }

    renderCats(currentData.categories);
    renderPrices(currentData.categories[0].items); // По умолчанию открываем первый раздел
}

// ФУНКЦИЯ СМЕНЫ РАЗДЕЛА (Теперь работает!)
function changeCat(el, catId) {
    // Убираем активный класс у всех и даем текущему
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');

    // Ищем нужный раздел в текущих данных игры
    const category = currentData.categories.find(c => c.id === catId);
    if (category) {
        renderPrices(category.items);
    }
}

function renderCats(cats) {
    document.getElementById('category-tabs').innerHTML = cats.map((c, i) => 
        `<div class="cat-tab ${i===0?'active':''}" onclick="changeCat(this, '${c.id}')">${c.name}</div>`).join('');
}

function renderPrices(items) {
    document.getElementById('prices-container').innerHTML = items.map(item => `
        <div class="price-item" onclick="selectItem(this)">
            <span>${item.amount}</span><small>${item.price} сум</small>
        </div>`).join('');
}
