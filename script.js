<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/dist/css/all.min.css">
</head>
<body>

    <!-- Главная страница -->
    <div id="main-page">
        <div class="top-bar">
            <div class="user-info"><div class="avatar"></div> <span id="user-name">@username</span></div>
            <div class="coins"><i class="fas fa-circle" style="color:#facc15"></i> 11</div>
        </div>
        <div class="balance-card">
            <div style="color:var(--muted); font-size:11px;">БАЛАНС</div>
            <div class="bal-value">0 <small style="font-size:14px;">сум</small></div>
            <div class="bal-actions">
                <div class="bal-btn"><i class="fas fa-wallet"></i> Пополнить</div>
                <div class="bal-btn"><i class="fas fa-percent"></i> Промокод</div>
            </div>
        </div>
        <div class="games-grid" id="games-container"></div>
    </div>

    <!-- Страница товаров -->
    <div id="product-page" class="hidden">
        <div class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i> Назад</div>
        <h2 id="cat-title" style="margin-bottom: 20px;"></h2>
        <div id="products-list"></div>
    </div>

    <div class="bottom-nav">
        <div class="nav-item active"><i class="fas fa-home"></i><span>Главная</span></div>
        <div class="nav-item"><i class="fas fa-shopping-bag"></i><span>Заказы</span></div>
    </div>

    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script src="script.js"></script>
</body>
</html>
