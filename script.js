let tg = window.Telegram.WebApp;
tg.expand();

let currentData = null;

// Названия файлов строго как на image_feb474.png
const games = [
    { id: 'ff', name: "Free Fire", img: "ff.png" },
    { id: 'mlbb', name: "MLBB", img: "mlbb.png" },
    { id: 'genshin', name: "Genshin", img: "genshin.png" },
    { id: 'arena', name: "Arena", img: "arena.png" },
    { id: 'stars', name: "Stars", img: "stars.png" },
    { id: 'tg_prem', name: "Premium", img: "tg_prem.png" }
];

// Данные для товаров (цены и категории)
const priceData = {
    'ff': {
        categories: [
            { id: 'al', name: '💎 Алмазы', items: [{amount:"100",price:"14 000"},{amount:"310",price:"35 000"},{amount:"520",price:"55 000"}]},
            { id: 'va', name: '🎫 Ваучеры', items: [{amount:"Haftalik",price:"22 000"},{amount:"Oylik",price:"130 000"}]}
        ]
    },
    'mlbb': {
        categories: [
            { id: 'al', name: '💎 Алмазы', items: [{amount:"56",price:"12 000"},{amount:"279",price:"50 000"}]},
            { id: 'ps', name: '🎟 Pass', items: [{amount:"Twilight",price:"100 000"}]}
        ]
    },
    'stars': {
        categories: [{ id: 'st', name: '⭐ Stars', items: [{amount:"50",price:"12 000"},{amount:"100",price:"24 000"}]}]
    }
};

// Отрисовка сетки игр 3х3
function renderGames() {
    const container = document.getElementById('games-container');
    if (!container) return;
    
    container.innerHTML = games.map(game => `
        <div class="game-item" onclick="openGame('${game.id}')">
            <div class="game-img-container">
                <img src="${game.img}" onerror="this.src='https://via.placeholder.com/150/111830/ffffff?text=Fiko'">
            </div>
            <span class="game-label">${game.name}</span>
        </div>`).join('');

    // Отображение имени пользователя из Telegram
    if (tg.initDataUnsafe?.user?.username) {
        document.getElementById('user-name').innerText = '@' + tg.initDataUnsafe.user.username;
    }
}

// Открытие страницы конкретной игры
function openGame(gameId) {
    const game = games.find(g => g.id === gameId);
    currentData = priceData[gameId] || { categories: [{id:'none', name:'Товары', items: [{amount:"Нет в наличии", price:"0"}]}] };
    
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('item-page').style.display = 'block';
    document.getElementById('item-title-display').innerText = game.name;
    document.getElementById('item-img-display').src = game.img;

    // Настройка полей ввода (ID или Username)
    const idSection = document.getElementById('id-section');
    if(gameId === 'mlbb') {
        idSection.innerHTML = `<div style="display:grid;grid-template-columns:2fr 1fr;gap:10px;">
            <div><span class="input-inner"><input type="number" placeholder="PLAYER ID"></span></div>
            <div><span class="input-inner"><input type="number" placeholder="ZONE"></span></div>
        </div>`;
    } else if(gameId === 'stars' || gameId === 'tg_prem') {
        idSection.innerHTML = `<div class="input-inner"><input type="text" placeholder="@username"></div>`;
    } else {
        idSection.innerHTML = `<div class="input-inner"><input type="number" placeholder="PLAYER ID"></div>`;
    }

    renderCats(currentData.categories);
    renderPrices(currentData.categories[0].items);
}

// Рендер вкладок (категорий)
function renderCats(cats) {
    const catContainer = document.getElementById('category-tabs');
    catContainer.innerHTML = cats.map((c, i) => 
        `<div class="cat-tab ${i===0?'active':''}" onclick="changeCat(this, '${c.id}')">${c.name}</div>`).join('');
}

// Переключение категории
function changeCat(el, catId) {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const category = currentData.categories.find(c => c.id === catId);
    if(category) renderPrices(category.items);
}

// Рендер списка цен
function renderPrices(items) {
    const priceContainer = document.getElementById('prices-container');
    priceContainer.innerHTML = items.map(item => `
        <div class="price-item" onclick="selectItem(this)">
            <div style="font-weight:bold; font-size:14px;">${item.amount}</div>
            <div style="color:var(--muted); font-size:11px; margin-top:4px;">${item.price} сум</div>
        </div>`).join('');
}

// Выбор конкретного товара
function selectItem(el) {
    document.querySelectorAll('.price-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    tg.HapticFeedback.impactOccurred('light');
}

// Возврат на главную
function showMainPage() {
    document.getElementById('main-page').style.display = 'block';
    document.getElementById('item-page').style.display = 'none';
}

// Запуск при загрузке
renderGames();
