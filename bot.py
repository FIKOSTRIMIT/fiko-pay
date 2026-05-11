import asyncio
import json
import sqlite3
from aiogram import Bot, Dispatcher, F, types
from aiogram.types import WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton
from aiogram.filters import Command

# ══════════════════════════════════════════
#  КОНФИГУРАЦИЯ (ВСТАВЬ СВОИ ДАННЫЕ)
# ══════════════════════════════════════════
BOT_TOKEN = "8688930773:AAHSinGwNGnFIrUyuZswjxy9PB_AGpJ93XU" # Основной токен магазина
ADMIN_ID  = 6324502848 
WEB_APP_URL = "https://твоя-ссылка.github.io" # Твоя ссылка на GitHub Pages

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# ══════════════════════════════════════════
#  БАЗА ДАННЫХ (SQLite - без лишних серверов)
# ══════════════════════════════════════════
db = sqlite3.connect("database.db")
cur = db.cursor()
cur.execute("""CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY, 
    name TEXT, 
    balance INTEGER DEFAULT 0
)""")
db.commit()

# ══════════════════════════════════════════
#  КЛАВИАТУРЫ
# ══════════════════════════════════════════
def main_kb(user_id):
    buttons = [[KeyboardButton(text="🛍 Magazin")]]
    if user_id == ADMIN_ID:
        buttons.append([KeyboardButton(text="📊 Stats"), KeyboardButton(text="📢 Рассылка")])
    return ReplyKeyboardMarkup(keyboard=buttons, resize_keyboard=True)

# ══════════════════════════════════════════
#  ЛОГИКА МАГАЗИНА (ДЛЯ ЮЗЕРОВ)
# ══════════════════════════════════════════

@dp.message(Command("start"))
async def start(message: types.Message):
    # Регистрация юзера
    cur.execute("INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)", 
                (message.from_user.id, message.from_user.first_name))
    db.commit()
    
    await message.answer(
        f"Assalomu alaykum, {message.from_user.first_name}!\n"
        "GameStore botiga xush kelibsiz. Quyidagi tugmani bosing:",
        reply_markup=main_kb(message.from_user.id)
    )

@dp.message(F.text == "🛍 Magazin")
async def open_shop(message: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✨ Do'konni ochish", web_app=WebAppInfo(url=WEB_APP_URL))]
    ])
    await message.answer("🛒 Do'kon menyusi:", reply_markup=kb)

# Прием заказа из Web App
@dp.message(F.web_app_data)
async def web_app_receive(message: types.Message):
    data = json.loads(message.web_app_data.data)
    item = data.get("item")
    price = data.get("price")
    uid = data.get("id_check", "Не указан")

    # Уведомление АДМИНУ
    admin_text = (
        f"🎮 **Yangi buyurtma!**\n\n"
        f"👤 Mijoz: {message.from_user.full_name} (@{message.from_user.username})\n"
        f"🆔 ID: `{message.from_user.id}`\n"
        f"📦 Mahsulot: {item}\n"
        f"💰 Summa: {price} so'm\n"
        f"🔑 Game ID: `{uid}`"
    )
    
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ Bajarildi", callback_data=f"order_done_{message.from_user.id}"),
         InlineKeyboardButton(text="❌ Bekor qilish", callback_data=f"order_cancel_{message.from_user.id}")]
    ])
    
    await bot.send_message(ADMIN_ID, admin_text, parse_mode="Markdown", reply_markup=kb)
    await message.answer("✅ Buyurtmangiz qabul qilindi! Admin ko'rib chiqmoqda...")

# ══════════════════════════════════════════
#  ЛОГИКА АДМИНКИ (УПРАВЛЕНИЕ)
# ══════════════════════════════════════════

@dp.callback_query(F.data.startswith("order_"))
async def process_order(call: types.CallbackQuery):
    action = call.data.split("_")[1]
    user_id = call.data.split("_")[2]
    
    if action == "done":
        await bot.send_message(user_id, "✅ Sizning buyurtmangiz muvaffaqiyatli bajarildi!")
        await call.message.edit_text(call.message.text + "\n\n✅ **СТАТУС: ВЫПОЛНЕН**")
    else:
        await bot.send_message(user_id, "❌ Uzr, sizning buyurtmangiz bekor qilindi. Mablag' qaytarilmadi (balansni tekshiring).")
        await call.message.edit_text(call.message.text + "\n\n❌ **СТАТУС: ОТМЕНЕН**")
    await call.answer()

@dp.message(F.text == "📊 Stats")
async def stats(message: types.Message):
    if message.from_user.id != ADMIN_ID: return
    cur.execute("SELECT COUNT(*) FROM users")
    count = cur.fetchone()[0]
    await message.answer(f"📊 Всего пользователей в базе: {count}")

# Простая рассылка
@dp.message(F.text == "📢 Рассылка")
async def start_broadcast(message: types.Message):
    if message.from_user.id != ADMIN_ID: return
    await message.answer("Пришлите фото с текстом для рассылки.")

@dp.message(F.photo)
async def do_broadcast(message: types.Message):
    if message.from_user.id != ADMIN_ID: return
    cur.execute("SELECT id FROM users")
    users = cur.fetchall()
    count = 0
    for user in users:
        try:
            await bot.send_photo(user[0], message.photo[-1].file_id, caption=message.caption)
            count += 1
            await asyncio.sleep(0.05) # Защита от спам-фильтра
        except: pass
    await message.answer(f"🚀 Рассылка завершена! Получили {count} человек.")

# ══════════════════════════════════════════
#  ЗАПУСК
# ══════════════════════════════════════════
async def main():
    print("🚀 Bot ishga tushdi!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
