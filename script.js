let tg = window.Telegram.WebApp;
tg.expand();

// Список игр с путями к папке img
const games = [
    { id: 'ff', name: "Free Fire", img: "img/ff.png" },
    { id: 'mlbb', name: "MLBB", img: "img/mlbb.png" },
    { id: 'genshin', name: "Genshin", img: "img/genshin.png" },
    { id: 'arena', name: "Arena", img: "img/arena.png" },
    { id: 'stars', name: "Stars", img: "img/stars.png" },
    { id: 'tg_prem', name: "Premium", img: "img/tg_prem.png" }
];

function render() {
    const container = document.getElementById('games-container');
    if (!container) return;
    
    container.innerHTML = games.map(g => `
        <div class="game-item" onclick="tg.HapticFeedback.impactOccurred('light')">
            <div class="game-img-container">
                <img src="${g.img}" onerror="this.src='https://via.placeholder.com/150/111830/ffffff?text=Fiko'">
            </div>
            <span class="game-label">${g.name}</span>
        </div>
    `).join('');
    
    // Подставляем имя пользователя из Телеграм
    if(tg.initDataUnsafe?.user?.username) {
        document.getElementById('user-name').innerText = '@' + tg.initDataUnsafe.user.username;
    }
}

// Запуск при полной загрузке страницы
window.onload = render;
