// Конфигурация
const config = {
    botToken: '7433469523:AAE94asxAzaO_4p-G9Z2dhzxJKaV_Q1n76s',
    chatId: '5466961396'
};

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

async function collectVisitorInfo() {
    const parser = new UAParser();
    const uaResult = parser.getResult();
    
    const ipAddress = await getIPAddress();
    
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
        cpuArch: uaResult.cpu.architecture || 'Не определено',
        ip: ipAddress || 'Не удалось определить'
    };

    if (ipAddress) {
        try {
            const geoResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`);
            if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                baseInfo.geo = {
                    country: geoData.country_name,
                    countryCode: geoData.country_code,
                    region: geoData.region,
                    city: geoData.city,
                    coordinates: geoData.latitude && geoData.longitude 
                        ? `${geoData.latitude}, ${geoData.longitude}`
                        : 'Не определены',
                    isp: geoData.org || 'Не определен'
                };
            }
        } catch (error) {
            console.error('Ошибка при получении геоданных:', error);
        }
    }

    return baseInfo;
}

function formatTelegramMessage(info) {
    let geoInfo = `🌐 IP: ${info.ip}`;
    
    if (info.geo) {
        geoInfo += `\n📍 ${info.geo.city || 'Неизвестный город'}, ${info.geo.country || 'Неизвестная страна'}`;
        if (info.geo.isp) geoInfo += `\n🛰 Провайдер: ${info.geo.isp}`;
        if (info.geo.coordinates !== 'Не определены') {
            geoInfo += `\n🗺 Координаты: ${info.geo.coordinates}`;
        }
    }

    const deviceInfo = `📱 Устройство: ${info.deviceType === 'mobile' ? 'Мобильное' : 
                      info.deviceType === 'tablet' ? 'Планшет' : 'Компьютер'}\n` +
                     `💻 ОС: ${info.os}\n` +
                     `🔍 Браузер: ${info.browser}\n` +
                     `🖥 Разрешение: ${info.screenWidth}x${info.screenHeight}`;

    return `🔔 Новый посетитель на сайте!\n\n` +
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
        console.log('Уведомление отправлено:', data);
    } catch (error) {
        console.error('Ошибка отправки:', error);
    }
}

async function trackVisitor() {
    const visitorInfo = await collectVisitorInfo();
    const message = formatTelegramMessage(visitorInfo);
    await sendTelegramNotification(message);
}

document.addEventListener('DOMContentLoaded', trackVisitor);