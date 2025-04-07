// Конфигурация
const config = {
    botToken: '7433469523:AAE94asxAzaO_4p-G9Z2dhzxJKaV_Q1n76s',
    chatId: '5466961396'
};

// Функция для получения IP
async function getIPAddress() {
    const services = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://ipinfo.io/json',
        'https://api.myip.com'
    ];

    for (const service of services) {
        try {
            const response = await fetch(service);
            if (!response.ok) continue;
            
            const data = await response.json();
            return data.ip || data.query || null;
        } catch (error) {
            console.error(`Ошибка при запросе к ${service}:`, error);
            continue;
        }
    }
    return null;
}

// Функция для сбора информации о посетителе
async function collectVisitorInfo() {
    const parser = new UAParser();
    const uaResult = parser.getResult();
    
    const ipAddress = await getIPAddress();
    
    return {
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentTime: new Date().toLocaleString(),
        pageUrl: window.location.href,
        referrer: document.referrer || 'Прямой заход',
        browser: `${uaResult.browser.name} ${uaResult.browser.version}`,
        os: `${uaResult.os.name} ${uaResult.os.version}`,
        deviceType: uaResult.device.type || 'desktop',
        ip: ipAddress || 'Не удалось определить'
    };
}

// Функция для форматирования сообщения
function formatTelegramMessage(info) {
    return `🔔 Новый посетитель на сайте!\n\n` +
           `🕒 Время: ${info.currentTime}\n` +
           `🌐 IP: ${info.ip}\n` +
           `💻 Устройство: ${info.deviceType === 'mobile' ? 'Мобильное' : 
                          info.deviceType === 'tablet' ? 'Планшет' : 'Компьютер'}\n` +
           `🔍 Браузер: ${info.browser}\n` +
           `🖥 ОС: ${info.os}\n` +
           `📏 Разрешение: ${info.screenWidth}x${info.screenHeight}\n` +
           `📄 Страница: ${info.pageUrl}\n` +
           `🔗 Источник: ${info.referrer}\n` +
           `🌍 Язык: ${info.language}`;
}

// Функция для отправки уведомления
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
                parse_mode: 'HTML',
                disable_notification: false
            })
        });
        
        const data = await response.json();
        console.log('Уведомление отправлено:', data);
    } catch (error) {
        console.error('Ошибка отправки:', error);
    }
}

// Главная функция
async function trackVisitor() {
    const visitorInfo = await collectVisitorInfo();
    const message = formatTelegramMessage(visitorInfo);
    await sendTelegramNotification(message);
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', trackVisitor);