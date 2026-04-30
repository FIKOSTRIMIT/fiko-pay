let tg = window.Telegram.WebApp;
tg.expand();

// Список игр для сетки 3x3
const games = [
    { id: 'ff', name: "Free Fire", img: "img/ff.png" },
    { id: 'mlbb', name: "Mobile Legends", img: "img/mlbb.png" },
    { id: 'genshin', name: "Genshin Impact", img: "img/genshin.png" },
    { id: 'arena', name: "Arena Breakout", img: "img/arena.png" },
    { id: 'stars', name: "TG Stars", img: "img/stars.png" },
    { id: 'tg_prem', name: "TG Premium", img: "img/tg_prem.png" }
];

// База цен
const priceData = {
    'ff': {
        bg: "FREE FIRE",
        categories: [
            { id: 'almaz', name: '💎 Алмазы', items: [{amount:"25",price:"5 000"},{amount:"100",price:"14 000"},{amount:"310",price:"35 000"},{amount:"520",price:"55 000"},{amount:"1,060",price:"110 000"},{amount:"2,180",price:"210 000"},{amount:"5,600",price:"510 000"}]},
            { id: 'vau', name: '🎫 Vaucher & BP', items: [{amount:"BP Card",price:"52 000"},{amount:"Haftalik Lite",price:"8 000"},{amount:"Haftalik",price:"20 000"},{amount:"Oylik",price:"130 000"}]},
            { id: 'evo', name: '🔥 Evo Access', items: [{amount:"Evo 3D",price:"12 000"},{amount:"Evo 7D",price:"18 000"},{amount:"Evo 30D",price:"40 000"}]}
        ]
    },
    'mlbb': {
        bg: "MLBB",
        categories: [
            { id: 'al', name: '💎 Алмазы', items: [{amount:"56",price:"12 000"},{amount:"112",price:"24 000"},{amount:"168",price:"32 000"},{amount:"223",price:"45 000"},{amount:"279",price:"50 000"},{amount:"336",price:"64 000"},{amount:"392",price:"70 000"},{amount:"570",price:"105 000"},{amount:"626",price:"112 000"},{amount:"1163",price:"202 000"},{amount:"2398",price:"400 000"},{amount:"6042",price:"990 000"}]},
            { id: 'ps', name: '🎫 Pass', items: [{amount:"Twilight Pass",price:"100 000"},{amount:"Haftalik vaucher",price:"22 000"}]}
        ]
    },
    'genshin': {
        bg: "GENSHIN",
        categories: [
            { id: 'gn', name: '✨ Genesis', items: [{amount:"60 Genesis",price:"14 000"},{amount:"120 Genesis",price:"28 000"},{amount:"330 Genesis",price:"52 000"},{amount:"660 Genesis",price:"100 000"},{amount:"1090 Genesis",price:"175 000"},{amount:"2240 Genesis",price:"360 000"},{amount:"3880 Genesis",price:"600 000"},{amount:"8080 Genesis",price:"1 210 000"}]},
            { id: 'ps', name: '🌙 Pass', items: [{amount:"Благословение W-Moon",price:"52 000"}]}
        ]
    },
    'arena': {
        bg: "ARENA",
        categories: [
            { id: 'bd', name: '💰 Bonds', items: [{amount:"66 Bonds",price:"13 000"},{amount:"335 Bonds",price:"45 000"},{amount:"675 Bonds",price:"95 000"},{amount:"1690 Bonds",price:"230 000"},{amount:"3400 Bonds",price:"460 000"},{amount:"6820 Bonds",price:"995 000"}]},
            { id: 'ky', name: '🔑 Keys', items: [{amount:"Beginner Select",price:"12 000"},{amount:"Bulletproof Case",price:"20 000"},{amount:"Composite Case",price:"80 000"}]},
            { id: 'ps', name: '🎟 Pass', items: [{amount:"Monthly Adv BP",price:"16 000"},{amount:"Monthly Prem BP",price:"40 000"},{amount:"Quarterly Prem",price:"135 000"}]}
        ]
    },
    'stars': {
        bg: "STARS",
        categories: [{ id: 'st', name: '⭐️ Stars', items: [{amount:"50",price:"12 000"},{amount:"100",price:"24 000"},{amount:"150",price:"35 000"},{amount:"200",price:"45 000"},{amount:"250",price:"65 000"},{amount:"300",price:"70 000"},{amount:"350",price:"80 000"},{amount:"500",price:"120 000"},{amount:"750",price:"170 000"},{amount:"1000",price:"230 000"}]}]
    },
    'tg_prem': {
        bg: "PREMIUM",
        categories: [{ id: 'pr', name: '⭐ Premium', items: [{amount:"3 месяца",price:"170 000"},{amount:"6 месяцев",price:"230 000"},{amount:"1 год",price:"290 000"}]}]
    }
};

function renderGames() {
    const container = document.getElementById('games-container');
    container.innerHTML = games.map(game => `
        <div class="game-item" onclick="openGame('${game.id}')">
            <div class="game-img-container"><img src="${game.img}"></div>
            <span class="game-label">${game.name}</span>
        </div>`).join('');
}

function openGame(gameId) {
    const game = games.find(g => g.id === gameId);
    const data = priceData[gameId];
    
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('item-page').style.display = 'block';
    document.getElementById('product-title').innerText = game.name;
    document.getElementById('product-img').src = game.img;
    document.getElementById('bg-text').innerText = data.bg;

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
            <div class="input-inner"><input type="text" id="player-id" placeholder="@username или ID"></div>
            <button class="self-buy-btn" onclick="fillSelf()">O'zim uchun</button>`;
    } else {
        idSection.innerHTML = `<span class="input-label">PLAYER ID</span><div class="input-inner"><input type="number" id="player-id" placeholder="Введите ID"></div>`;
    }

    renderCats(data.categories);
    renderPrices(data.categories[0].items);
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

function fillSelf() {
    let user = tg.initDataUnsafe?.user;
    if(user?.username) document.getElementById('player-id').value = "@" + user.username;
    else if(user?.id) document.getElementById('player-id').value = user.id;
}

function selectItem(el) {
    document.querySelectorAll('.price-item').forEach(i => i.style.borderColor = 'rgba(255,255,255,0.05)');
    el.style.borderColor = 'var(--accent)';
}

function showMainPage() {
    document.getElementById('main-page').style.display = 'block';
    document.getElementById('item-page').style.display = 'none';
}

renderGames();
