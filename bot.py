from aiogram.types import WebAppInfo
import json

# Вставь сюда ссылку, которую ты получил на GitHub
WEB_APP_URL = "https://твоя-ссылка.github.io" 

# 1. ОБНОВЛЕННОЕ МЕНЮ МАГАЗИНА
@dp.message(F.text == "🛍 Magazin")
async def shop_choice(message: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✨ Web App Store (Имбовый дизайн)", web_app=WebAppInfo(url=WEB_APP_URL))],
        [InlineKeyboardButton(text="🤖 Telegram Menu (Обычный)", callback_data="open_classic_menu")]
    ])
    await message.answer("🛒 Qanday usulda sotib olmoqchisiz?", reply_markup=kb)

# 2. ОБРАБОТКА ДАННЫХ ИЗ WEB APP
@dp.message(F.web_app_data)
async def web_app_receive(message: types.Message, state: FSMContext):
    # Получаем данные из JS функции buy()
    data = json.loads(message.web_app_data.data)
    item_name = data.get("item")
    price = data.get("price")
    cat = data.get("game")

    # Проверяем баланс
    cursor.execute("SELECT balance FROM users WHERE id = ?", (message.from_user.id,))
    balance = cursor.fetchone()[0]

    if balance < price:
        return await message.answer(f"❌ Balans yetarli emas!\nKerak: {price} so'm\nSizda: {balance} so'm")

    # Сохраняем данные и просим ID
    await state.update_data(item_name=item_name, item_price=price, cat=cat)
    await message.answer(f"🎯 Tanlandi: {item_name}\n💰 Narxi: {price} so'm\n\nEndi ID yuboring:")
    await state.set_state(Form.waiting_for_id_data)
