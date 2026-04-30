let tg = window.Telegram.WebApp;
tg.expand();

// Данные для игр (можно легко добавлять новые)
const games = [
    { name: "PUBG MOBILE", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_h0YdM86o99Y0D9q62YfK4z3Vz9n1v5X7Qw&s", badge: "Global", type: "global" },
    { name: "FREE FIRE", img: "https://play-lh.googleusercontent.com/97y4m-mO_H_52yV9Y66C4lU-x1X_1S6v-6-l6vO8tO-L6vO8tO-L6vO8tO-L6vO8tO", badge: "SNG", type: "global" },
    { name: "MOBILE LEGENDS", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-7Qo9xNqNnLhHh5jHkXo6M7Vn5S6b3Ua_w&s", badge: "Global", type: "global" },
    { name: "STARS", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjS5p2i-j1U6n_8v5Zk3bXz-2k_yJ-W_XzVw&s", badge: "AVTO", type: "avto" },
    { name: "PREMIUM", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8Z-2bX_zV9Z5X7VbXvXz-X-X_XzV_XzVw&s", badge: "AVTO", type: "avto" }
];

// Функция для отображения игр
function renderGames() {
    const container = document.getElementById('games-container');
    container.innerHTML = games.map(game => `
        <div class="game-item">
            <div class="game-img-container">
                <span class="badge ${game.type}">${game.badge}</span>
                <img src="${game.img}" alt="${game.name}">
            </div>
            <span class="game-label">${game.name}</span>
        </div>
    `).join('');
}

// Установка имени пользователя
if (tg.initDataUnsafe.user) {
    document.getElementById('user-name').innerText = '@' + tg.initDataUnsafe.user.username;
}

// Отправка действий боту
function sendAction(action) {
    tg.sendData(JSON.stringify({ action: action }));
}

// Запускаем отрисовку
renderGames();
