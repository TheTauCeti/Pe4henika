// Конфигурация (замените на свои данные)
const config = {
    botToken: '7433469523:AAE94asxAzaO_4p-G9Z2dhzxJKaV_Q1n76s', // Токен вашего Telegram бота
    chatId: '5466961396'     // ID вашего чата с ботом
};

// Функция для сбора информации о посетителе
function collectVisitorInfo() {
    return {
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentTime: new Date().toLocaleString(),
        pageUrl: window.location.href,
        referrer: document.referrer || 'Прямой заход'
    };
}

// Функция для форматирования сообщения
function formatTelegramMessage(info, ip = 'Не удалось определить') {
    return `🔔 Новый посетитель на сайте Pe4henika!\n\n` +
           `🕒 Время: ${info.currentTime}\n` +
           `🌐 IP: ${ip}\n` +
           `📄 Страница: ${info.pageUrl}\n` +
           `🔗 Источник: ${info.referrer}\n` +
           `🖥 Устройство: ${info.userAgent}\n` +
           `📏 Разрешение: ${info.screenWidth}x${info.screenHeight}\n` +
           `🌍 Язык: ${info.language}\n` +
           `⏰ Часовой пояс: ${info.timezone}`;
}

// Функция для отправки уведомления в Telegram
async function sendTelegramNotification(message) {
    try {
        const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: config.chatId,
                text: message,
                disable_notification: false
            })
        });
        
        const data = await response.json();
        console.log('Уведомление отправлено в Telegram:', data);
    } catch (error) {
        console.error('Ошибка при отправке уведомления:', error);
    }
}

// Основная функция
async function trackVisitor() {
    const visitorInfo = collectVisitorInfo();
    
    try {
        // Пытаемся получить IP-адрес
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const message = formatTelegramMessage(visitorInfo, ipData.ip);
        await sendTelegramNotification(message);
    } catch (error) {
        console.error('Ошибка при получении IP:', error);
        const message = formatTelegramMessage(visitorInfo);
        await sendTelegramNotification(message);
    }
}

// Запускаем отслеживание при загрузке страницы
document.addEventListener('DOMContentLoaded', trackVisitor);