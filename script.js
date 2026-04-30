let tg = window.Telegram.WebApp;
tg.expand();

function switchTab(tab) {
    tg.HapticFeedback.impactOccurred('light');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('nav-' + tab).classList.add('active');
    
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(tab + '-page').classList.remove('hidden');
}

function toggleDark() {
    const isDark = document.getElementById('dark-toggle').checked;
    document.body.classList.toggle('light-mode', !isDark);
    tg.HapticFeedback.impactOccurred('medium');
}

function toggleAnims() {
    const animsOn = document.getElementById('anim-toggle').checked;
    document.body.classList.toggle('no-animations', !animsOn);
    tg.HapticFeedback.impactOccurred('light');
}

function openSupport() {
    tg.openTelegramLink("https://t.me/FikoYT");
}

function switchHistoryTab(type) {
    document.querySelectorAll('.history-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + type).classList.add('active');
    document.getElementById('finance-list').classList.toggle('hidden', type !== 'finance');
}
