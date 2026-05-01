let tg = window.Telegram.WebApp;
tg.expand();

// Загрузка данных пользователя
const user = tg.initDataUnsafe.user;
if (user) {
    document.getElementById('user-name').innerText = user.first_name;
    if (user.photo_url) document.getElementById('user-photo').style.backgroundImage = `url('${user.photo_url}')`;
}

// Навигация
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    tg.HapticFeedback.selectionChanged();
}

// Внутреннее меню игры
function openGameDetail(id, title) {
    document.getElementById('home-page').classList.add('hidden');
    document.getElementById('game-detail-page').classList.remove('hidden');
    document.getElementById('current-game-title').innerText = title;
    document.querySelector('.nav-container').style.display = 'none';
    tg.HapticFeedback.impactOccurred('medium');
}

function closeGameDetail() {
    document.getElementById('game-detail-page').classList.add('hidden');
    document.getElementById('home-page').classList.remove('hidden');
    document.querySelector('.nav-container').style.display = 'flex';
}
