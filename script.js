let tg = window.Telegram.WebApp;
tg.expand();

// Функция инициализации данных пользователя
function initUserData() {
    const userData = tg.initDataUnsafe.user;

    if (userData) {
        // 1. Имя или Username
        const displayName = userData.username ? `@${userData.username}` : userData.first_name;
        document.getElementById('user-name').innerText = displayName;
        document.getElementById('settings-name').innerText = userData.first_name + (userData.last_name ? ' ' + userData.last_name : '');
        
        // 2. Уникальный ID пользователя
        document.getElementById('settings-id').innerText = `ID: ${userData.id}`;

        // 3. Аватарка (если есть)
        if (userData.photo_url) {
            const photoPath = `url('${userData.photo_url}')`;
            document.getElementById('user-photo').style.backgroundImage = photoPath;
            document.getElementById('settings-photo').style.backgroundImage = photoPath;
        }

        // 4. Цвет темы (авто-адаптация)
        document.documentElement.style.setProperty('--tg-theme-bg', tg.backgroundColor);
    }
}

// Вызываем при загрузке
initUserData();

// Обработка кнопок пополнения и прочего
function openDeposit() {
    tg.HapticFeedback.impactOccurred('heavy');
    // Логика открытия окна оплаты
    alert("To'lov tizimi yuklanmoqda...");
}
