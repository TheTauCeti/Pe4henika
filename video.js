document.addEventListener('DOMContentLoaded', () => {
    const videoBtn = document.getElementById('video-btn');
    const videoContainer = document.getElementById('video-container');
    const videoFrame = document.getElementById('video-frame');
    
    // URL видео (замените на свой)
    const videoURL = "https://vt.tiktok.com/embed/ZSryrepkp/";

    videoBtn.addEventListener('click', () => {
        // Загружаем видео
        videoFrame.src = videoURL;
        videoContainer.style.display = 'block';
        document.body.classList.add('video-open');
        
        // Блокируем элементы управления
        videoFrame.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    });

    // Обработчик сообщений от плеера
    window.addEventListener('message', (e) => {
        if (e.data === 'ended') {
            closeVideo();
        }
    });

    // Закрытие видео
    function closeVideo() {
        videoFrame.src = '';
        videoContainer.style.display = 'none';
        document.body.classList.remove('video-open');
    }

    // Блокировка закрытия
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') e.preventDefault();
    });
    videoContainer.addEventListener('click', (e) => e.preventDefault());
});