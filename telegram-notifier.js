// Конфигурация
const config = {
    botToken: '7433469523:AAE94asxAzaO_4p-G9Z2dhzxJKaV_Q1n76s',
    chatId: '5466961396'
};

// Функция для сбора информации о посетителе
async function collectVisitorInfo() {
    const parser = new UAParser();
    const uaResult = parser.getResult();
    
    const baseInfo = {
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
        deviceModel: uaResult.device.model || 'Не определено',
        cpuArch: uaResult.cpu.architecture || 'Не определено'
    };

    try {
        const geoResponse = await fetch('http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query');
        const geoData = await geoResponse.json();
        
        if (geoData.status === 'success') {
            baseInfo.geo = {
                ip: geoData.query,
                country: geoData.country,
                countryCode: geoData.countryCode,
                region: geoData.regionName,
                city: geoData.city,
                zip: geoData.zip,
                coordinates: `${geoData.lat}, ${geoData.lon}`,
                isp: geoData.isp,
                org: geoData.org,
                as: geoData.as
            };
        }
    } catch (error) {
        baseInfo.geo = {
            ip: 'Не удалось определить',
            error: 'Не удалось получить геоданные'
        };
    }

    return baseInfo;
}

function formatTelegramMessage(info) {
    let geoInfo = 'Не удалось определить';
    if (info.geo && info.geo.ip !== 'Не удалось определить') {
        geoInfo = `📍 ${info.geo.city}, ${info.geo.country} (${info.geo.countryCode})\n` +
                 `🌐 IP: ${info.geo.ip}\n` +
                 `🛰 Провайдер: ${info.geo.isp}\n` +
                 `🏢 Организация: ${info.geo.org || 'Не указана'}\n` +
                 `🗺 Координаты: ${info.geo.coordinates || 'Не определены'}`;
    } else {
        geoInfo = `🌐 IP: ${info.geo?.ip || 'Не удалось определить'}`;
    }

    const deviceInfo = `📱 Устройство: ${info.deviceType === 'mobile' ? 'Мобильное' : 
                      info.deviceType === 'tablet' ? 'Планшет' : 'Компьютер'}\n` +
                     (info.deviceModel !== 'Не определено' ? `📱 Модель: ${info.deviceModel}\n` : '') +
                     `💻 ОС: ${info.os}\n` +
                     `🖥 Архитектура: ${info.cpuArch}\n` +
                     `🔍 Браузер: ${info.browser}\n` +
                     `🖥 Разрешение: ${info.screenWidth}x${info.screenHeight}`;

    return `🔔 Новый посетитель на сайте Pe4henika!\n\n` +
           `🕒 Время: ${info.currentTime}\n\n` +
           `${geoInfo}\n\n` +
           `${deviceInfo}\n\n` +
           `📄 Страница: ${info.pageUrl}\n` +
           `🔗 Источник: ${info.referrer}\n` +
           `🌍 Язык: ${info.language}\n` +
           `⏰ Часовой пояс: ${info.timezone}`;
}

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
        console.log('Уведомление отправлено в Telegram:', data);
    } catch (error) {
        console.error('Ошибка при отправке уведомления:', error);
    }
}

async function trackVisitor() {
    const visitorInfo = await collectVisitorInfo();
    const message = formatTelegramMessage(visitorInfo);
    await sendTelegramNotification(message);
}

document.addEventListener('DOMContentLoaded', trackVisitor);