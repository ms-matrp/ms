import telebot
import requests
from bs4 import BeautifulSoup

TOKEN = "8314373495:AAGhoKY1m6AcMC23BmvYLkKv6XHKMnFjHks"

bot = telebot.TeleBot(TOKEN)


def get_status():
    url = "https://usescarlet.com"

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.get(url, headers=headers)

    soup = BeautifulSoup(response.text, "html.parser")

    status = soup.find("h1", class_="status")

    if status:
        return status.text.strip()

    return "Status not found"


@bot.message_handler(commands=['start'])
def start(message):
    status = get_status()

    bot.send_message(
        message.chat.id,
        f"Привет! Это бот в котором ты можешь посмотреть статус Scarlet!\n\Статус взят с сайта - usescarlet.com\n\Актуальный статус: {status}"
    )


print("Bot started")
bot.infinity_polling()