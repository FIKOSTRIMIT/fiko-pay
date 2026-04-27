import asyncio
import logging
import sqlite3
from aiogram import Bot, Dispatcher, types, F
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton
from aiogram.client.session.aiohttp import AiohttpSession

# --- КОНФИГУРАЦИЯ ---
BOT_TOKEN = "8608864134:AAHmTD6rjZrBkHWpmamgv50Bhd0Ip7-PMfM"
ADMINS = [6324502848]
CARD_NUMBER = "9860 1966 1802 8480"

# --- БАЗА ДАННЫХ ---
conn = sqlite3.connect("/home/fiko/fiko_shop.db", check_same_thread=False)
cursor = conn.cursor()
cursor.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, balance INTEGER DEFAULT 0, spent INTEGER DEFAULT 0)")
cursor.execute("CREATE TABLE IF NOT EXISTS orders (order_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, game TEXT, item TEXT, player_id TEXT, status TEXT DEFAULT 'pending')")
conn.commit()

class Form(StatesGroup):
    waiting_for_name = State()
    waiting_for_id_data = State()
    waiting_for_deposit_amount = State()
    waiting_for_deposit_screenshot = State()

# --- ЦЕНЫ ---
prices = {
    "pubg": [
        ("60 UC", 12000), ("120 UC", 24000), ("180 UC", 36000), ("240 UC", 42000), ("300 UC", 48000),
        ("325 UC", 55000), ("445 UC", 80000), ("660 UC", 110000), ("720 UC", 125000), ("985 UC", 160000),
        ("1320 UC", 220000), ("1800 UC", 270000), ("2125 UC", 340000), ("2469 UC", 390000), ("3850 UC", 550000),
        ("4175 UC", 610000), ("4510 UC", 665000)
    ],
    "ff_almaz": [
        ("25 Almaz", 5000), ("100 Almaz", 14000), ("310 Almaz", 35000), ("520 Almaz", 55000),
        ("1060 Almaz", 110000), ("2180 Almaz", 210000), ("5600 Almaz", 510000)
    ],
    "ff_vaucher": [
        ("BP Card", 52000), ("Haftalik Lite", 8000), ("Haftalik Vaucher", 20000), ("Oylik Vaucher", 130000),
        ("Evo Access 3D", 12000), ("Evo Access 7D", 18000), ("Evo Access 30D", 40000)
    ],
    "mlbb_almaz": [
        ("56 Dia", 12000), ("112 Dia", 24000), ("168 Dia", 32000), ("223 Dia", 45000), ("279 Dia", 50000),
        ("336 Dia", 64000), ("392 Dia", 70000), ("570 Dia", 105000), ("626 Dia", 112000), ("1163 Dia", 202000),
        ("2398 Dia", 400000), ("6042 Dia", 990000)
    ],
    "mlbb_pass": [("Twilight Pass", 100000), ("Haftalik vaucher", 22000)],
    "genshin": [
        ("60 Genesis", 14000), ("120 Genesis", 28000), ("330 Genesis", 52000), ("660 Genesis", 100000),
        ("1090 Genesis", 175000), ("2240 Genesis", 360000), ("3880 Genesis", 600000), ("8080 Genesis", 1210000),
        ("W-Moon", 52000)
    ],
    "arena_bonds": [
        ("66 Bonds", 13000), ("335 Bonds", 45000), ("675 Bonds", 95000), ("1690 Bonds", 230000),
        ("3400 Bonds", 460000), ("6820 Bonds", 995000)
    ],
    "arena_pass": [
        ("Beginner Select", 12000), ("Bulletproof Case", 20000), ("Composite Case", 80000),
        ("Advanced BP", 16000), ("Premium BP", 40000), ("Quarterly Premium", 135000)
    ],
    "prem": [("3 oylik", 170000), ("6 oylik", 230000), ("1 yillik", 290000)],
    "stars": [
        ("50 Stars", 14000), ("100 Stars", 28000), ("150 Stars", 40000), ("200 Stars", 55000),
        ("250 Stars", 65000), ("300 Stars", 80000), ("350 Stars", 90000), ("500 Stars", 130000),
        ("750 Stars", 190000), ("1000 Stars", 250000)
    ]
}

def get_main_kb():
    return ReplyKeyboardMarkup(keyboard=[
        [KeyboardButton(text="🛍 Magazin"), KeyboardButton(text="👤 Profil")],
        [KeyboardButton(text="💰 Balansni to'ldirish")]
    ], resize_keyboard=True)

# --- ИНИЦИАЛИЗАЦИЯ (Прокси для PythonAnywhere) ---
proxy_url = "http://proxy.server:3128"
session = AiohttpSession(proxy=proxy_url)
bot = Bot(token=BOT_TOKEN, session=session)
dp = Dispatcher(storage=MemoryStorage())

# --- ОБРАБОТЧИКИ ---

@dp.message(F.text == "/start")
async def start(message: types.Message, state: FSMContext):
    cursor.execute("SELECT name FROM users WHERE id = ?", (message.from_user.id,))
    if cursor.fetchone():
        await message.answer("Fiko Pay xizmatidan foydalanishingiz mumkin.", reply_markup=get_main_kb())
    else:
        await message.answer("Fiko Pay-ga xush kelibsiz! Ismingizni kiriting:")
        await state.set_state(Form.waiting_for_name)

@dp.message(Form.waiting_for_name)
async def set_name(message: types.Message, state: FSMContext):
    cursor.execute("INSERT OR IGNORE INTO users (id, name, balance, spent) VALUES (?, ?, 0, 0)", (message.from_user.id, message.text))
    conn.commit()
    await state.clear()
    await message.answer(f"Tayyor, {message.text}! Menyudan foydalaning.", reply_markup=get_main_kb())

@dp.message(F.text == "/admin")
async def admin_panel(message: types.Message):
    if message.from_user.id not in ADMINS: return
    cursor.execute("SELECT COUNT(*) FROM orders WHERE status = 'pending'")
    p_count = cursor.fetchone()[0]
    indicator = "🔴" if p_count > 0 else "⚪"
    kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=f"{indicator} Kutilayotgan ({p_count})", callback_data="adm_pending")]])
    await message.answer("🛠 Admin Panel - Fiko Pay", reply_markup=kb)

@dp.callback_query(F.data == "adm_pending")
async def view_pending(call: types.CallbackQuery):
    await call.answer()
    cursor.execute("SELECT order_id, game, item, player_id FROM orders WHERE status = 'pending'")
    orders = cursor.fetchall()
    if not orders: return await call.message.answer("Hozircha buyurtmalar yo'q.")
    res = "⏳ Kutilayotgan buyurtmalar:\n\n"
    for o in orders: res += f"ID: #{o[0]} | {o[1].upper()} | {o[2]} | ID: {o[3]}\n"
    await call.message.answer(res)

@dp.message(F.text == "🛍 Magazin")
async def shop(message: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="PUBG Mobile", callback_data="cat_pubg")],
        [InlineKeyboardButton(text="Free Fire", callback_data="sub_ff")],
        [InlineKeyboardButton(text="Mobile Legends", callback_data="sub_mlbb")],
        [InlineKeyboardButton(text="Genshin Impact", callback_data="cat_genshin")],
        [InlineKeyboardButton(text="Arena Breakout", callback_data="sub_arena")],
        [InlineKeyboardButton(text="Telegram Stars", callback_data="cat_stars")],
        [InlineKeyboardButton(text="Telegram Premium", callback_data="cat_prem")]
    ])
    await message.answer("🛒 O'yin yoki xizmatni tanlang:", reply_markup=kb)

@dp.callback_query(F.data.startswith("sub_"))
async def sub_cat(call: types.CallbackQuery):
    await call.answer()
    game = call.data.split("_")[1]
    kb = []
    if game == "ff":
        kb = [[InlineKeyboardButton(text="ALMAZ", callback_data="cat_ff_almaz")], [InlineKeyboardButton(text="VAUCHER & BP", callback_data="cat_ff_vaucher")]]
    elif game == "mlbb":
        kb = [[InlineKeyboardButton(text="ALMAZ", callback_data="cat_mlbb_almaz")], [InlineKeyboardButton(text="Pass", callback_data="cat_mlbb_pass")]]
    elif game == "arena":
        kb = [[InlineKeyboardButton(text="Bonds", callback_data="cat_arena_bonds")], [InlineKeyboardButton(text="Keys & Pass", callback_data="cat_arena_pass")]]
    kb.append([InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_main")])
    await call.message.edit_text("Bo'limni tanlang:", reply_markup=InlineKeyboardMarkup(inline_keyboard=kb))

@dp.callback_query(F.data.startswith("cat_"))
async def show_items(call: types.CallbackQuery):
    await call.answer()
    cat = call.data.replace("cat_", "")
    items = prices[cat]
    rows = [[InlineKeyboardButton(text=f"{i[0]} - {i[1]} so'm", callback_data=f"buy_{cat}_{idx}")] for idx, i in enumerate(items)]
    rows.append([InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_main")])
    await call.message.edit_text("💎 Paketni tanlang:", reply_markup=InlineKeyboardMarkup(inline_keyboard=rows))

@dp.callback_query(F.data.startswith("buy_"))
async def start_buy(call: types.CallbackQuery, state: FSMContext):
    await call.answer()
    _, cat, idx = call.data.split("_")
    item = prices[cat][int(idx)]
    
    cursor.execute("SELECT balance FROM users WHERE id = ?", (call.from_user.id,))
    balance = cursor.fetchone()[0]
    if balance < item[1]: return await call.answer("❌ Mablag' yetarli emas!", show_alert=True)
        
    await state.update_data(item_name=item[0], item_price=item[1], cat=cat)
    if "mlbb" in cat:
        txt = f"🎯 {item[0]}\n\nID va Server ID yuboring (Masalan: 12345678 1234):"
    elif cat in ["stars", "prem"]:
        txt = f"🎯 {item[0]}\n\nTelegram Username yuboring (@username):"
    else:
        txt = f"🎯 {item[0]}\n\nID yuboring:"
    await call.message.answer(txt)
    await state.set_state(Form.waiting_for_id_data)

@dp.message(Form.waiting_for_id_data)
async def process_purchase(message: types.Message, state: FSMContext):
    data = await state.get_data()
    cursor.execute("UPDATE users SET balance = balance - ?, spent = spent + ? WHERE id = ?", (data['item_price'], data['item_price'], message.from_user.id))
    cursor.execute("INSERT INTO orders (user_id, game, item, player_id) VALUES (?, ?, ?, ?)", (message.from_user.id, data['cat'], data['item_name'], message.text))
    conn.commit()
    order_id = cursor.lastrowid
    await state.clear()
    await message.answer("⏳ Buyurtma qabul qilindi! Adminlar tez orada bajarishadi.")
    
    admin_kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="✅ Bajarildi", callback_data=f"done_{order_id}")]])
    for admin in ADMINS:
        try: await bot.send_message(admin, f"📦 YANGI #{order_id}\n🕹 {data['cat'].upper()}\n💎 {data['item_name']}\n🆔 ID: {message.text}", reply_markup=admin_kb)
        except: pass

@dp.callback_query(F.data.startswith("done_"))
async def order_confirm(call: types.CallbackQuery):
    await call.answer()
    oid = call.data.split("_")[1]
    cursor.execute("SELECT user_id, game, item, player_id FROM orders WHERE order_id = ?", (oid,))
    o = cursor.fetchone()
    if o:
        cursor.execute("UPDATE orders SET status = 'completed' WHERE order_id = ?", (oid,))
        conn.commit()
        try: await bot.send_message(o[0], f"✅ Buyurtmangiz bajarildi!\n🕹 {o[1].upper()} | {o[2]}")
        except: pass
        await call.message.edit_text(call.message.text + "\n\n✅ BAJARILDI")

@dp.message(F.text == "👤 Profil")
async def profile(message: types.Message):
    cursor.execute("SELECT name, balance, spent FROM users WHERE id = ?", (message.from_user.id,))
    u = cursor.fetchone()
    if u: await message.answer(f"👤 Foydalanuvchi: {u[0]}\n💰 Balans: {u[1]} so'm\n📊 Harajat: {u[2]} so'm")

@dp.message(F.text == "💰 Balansni to'ldirish")
async def deposit_start(message: types.Message, state: FSMContext):
    await message.answer("To'ldirish summasini kiriting (masalan: 20000):")
    await state.set_state(Form.waiting_for_deposit_amount)

@dp.message(Form.waiting_for_deposit_amount)
async def dep_amt(message: types.Message, state: FSMContext):
    if not message.text.isdigit(): return
    await state.update_data(amount=int(message.text))
    await message.answer(f"💳 Karta: `{CARD_NUMBER}`\n💵 Summa: {message.text} so'm\n\nTo'lov chekini (rasm) yuboring!")
    await state.set_state(Form.waiting_for_deposit_screenshot)

@dp.message(Form.waiting_for_deposit_screenshot, F.photo)
async def dep_shot(message: types.Message, state: FSMContext):
    data = await state.get_data()
    await state.clear()
    await message.answer("✅ Qabul qilindi. Tasdiqlashni kuting.")
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="✅ Tasdiqlash", callback_data=f"add_bal_{message.from_user.id}_{data['amount']}"),
        InlineKeyboardButton(text="❌ Rad etish", callback_data=f"reject_bal_{message.from_user.id}")
    ]])
    for a in ADMINS: 
        try: await bot.send_photo(a, message.photo[-1].file_id, caption=f"💰 Summa: {data['amount']} so'm\n👤 User: {message.from_user.full_name}", reply_markup=kb)
        except: pass

@dp.callback_query(F.data.startswith("add_bal_"))
async def approve_dep(call: types.CallbackQuery):
    await call.answer()
    _, _, uid, amt = call.data.split("_")
    cursor.execute("UPDATE users SET balance = balance + ? WHERE id = ?", (amt, uid))
    conn.commit()
    try: await bot.send_message(uid, f"✅ Balansingiz {amt} so'mga to'ldirildi!")
    except: pass
    await call.message.edit_caption(caption="✅ Tasdiqlandi")

@dp.callback_query(F.data.startswith("reject_bal_"))
async def reject_dep(call: types.CallbackQuery):
    await call.answer()
    uid = call.data.split("_")[2]
    try: await bot.send_message(uid, "❌ To'lovingiz rad etildi. Ma'lumotlarni tekshiring.")
    except: pass
    await call.message.edit_caption(caption="❌ Rad etildi")

@dp.callback_query(F.data == "back_main")
async def back_main(call: types.CallbackQuery):
    await call.answer()
    await shop(call.message)

async def main():
    logging.basicConfig(level=logging.INFO)
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
