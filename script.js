let tg = window.Telegram.WebApp;
tg.expand();

// База данных товаров
const products = {
    'ff': [
        { id: 'ff_100', name: "100 Алмазов", price: "12 000 сум" },
        { id: 'ff_530', name: "530 Алмазов", price: "55 000 сум" }
    ],
    'stars': [
        { id: 'st_10', name: "Кейс 1", price: "10 Stars" },
        { id: 'st_25', name: "Кейс 2", price: "25 Stars" },
        { id: 'st_50', name: "Кейс 3", price: "50 Stars" },
        { id: 'st_100', name: "Кейс 4", price: "100 Stars" },
        { id: 'st_250', name: "Кейс 5", price: "250 Stars" },
        { id: 'st_500', name: "Кейс 6", price: "500 Stars" }
    ],
    'tg_prem': [
        { id: 'prem_1m', name: "Telegram Premium 1 мес.", price: "45 000 сум" },
        { id: 'prem_1y', name: "Telegram Premium 1 год", price: "350 000 сум" }
    ]
};

const games = [
    { id: 'ff', name: "Free Fire", img: "img/ff.png" },
    { id: 'mlbb', name: "MLBB", img: "img/mlbb.png" },
    { id: 'stars', name: "Stars", img: "img/stars.png" },
    { id: 'tg_prem', name: "Premium", img: "img/tg_prem.png" }
];

window.renderGames = function() {
    const container = document.getElementById('games-container');
    if (!container) return;
    container.innerHTML = games.map(g => `
        <div class="game-item" onclick="openCategory('${g.id}', '${g.name}')">
            <div class="game-img-container">
                <img src="${g.img}" onerror="this.src='https://via.placeholder.com/150/111830/ffffff?text=Fiko'">
            </div>
            <span class="game-label">${g.name}</span>
        </div>
    `).join('');
};

window.openCategory = function(id, name) {
    tg.HapticFeedback.impactOccurred('medium');
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('product-page').classList.remove('hidden');
    document.getElementById('cat-title').innerText = name;

    const list = document.getElementById('products-list');
    const items = products[id] || [];
    list.innerHTML = items.length ? items.map(p => `
        <div class="product-card" onclick="selectProduct('${p.name}', '${p.price}')">
            <span>${p.name}</span>
            <span class="price-tag">${p.price}</span>
        </div>
    `).join('') : '<div style="color:gray; padding:20px;">Скоро в продаже...</div>';
};

window.goBack = function() {
    document.getElementById('main-page').classList.remove('hidden');
    document.getElementById('product-page').classList.add('hidden');
};

window.selectProduct = function(name, price) {
    tg.showConfirm(`Купить ${name} за ${price}?`, (ok) => {
        if(ok) {
            tg.sendData(JSON.stringify({item: name, price: price}));
            tg.close();
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    renderGames();
    if(tg.initDataUnsafe?.user?.username) {
        document.getElementById('user-name').innerText = '@' + tg.initDataUnsafe.user.username;
    }
    tg.ready();
});
