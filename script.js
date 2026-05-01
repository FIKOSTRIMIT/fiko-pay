const tg = window.Telegram.WebApp;
tg.expand();

// 1. Функция для копирования номера карты
function copyCard() {
    const cardNum = "9860600405069466";
    navigator.clipboard.writeText(cardNum);
    tg.HapticFeedback.notificationOccurred('success'); // Вибрация при успехе
    alert("Karta raqami nusxalandi!");
}

// 2. Функция отправки уведомления об оплате в БОТ
function sendPaymentNotification() {
    const amountInput = document.getElementById('sum_input'); // Убедись, что ID совпадает с твоим инпутом
    const amount = amountInput ? amountInput.value : "0";

    // Отправляем данные в Katabump (bot.py поймает этот JSON)
    tg.sendData(JSON.stringify({
        action: "check_payment",
        amount: amount
    }));
    
    tg.close(); // Закрываем Web App после нажатия
}

// 3. Функция для кнопки поддержки (@FikoYT)
function openSupport() {
    tg.openTelegramLink('https://t.me/FikoYT');
}

// 4. Логика активации бонус-кода
function activateBonus() {
    const bonusInput = document.getElementById('bonus_input');
    const code = bonusInput ? bonusInput.value : "";

    if (code.trim() !== "") {
        tg.sendData(JSON.stringify({
            action: "activate_bonus",
            code: code
        }));
        tg.close();
    }
}
