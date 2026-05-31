// 1. Логика слайдера отзывов
const track = document.querySelector('.reviews-section__track');
const cards = document.querySelectorAll('.reviews-section__card');
const prevBtn = document.querySelector('.reviews-section__nav-btn--prev');
const nextBtn = document.querySelector('.reviews-section__nav-btn--next');
const viewport = document.querySelector('.reviews-section__viewport');

let currentIndex = 0;
let autoplayTimer = null;
let resumeTimer = null;

// НАСТРОЙКИ АВТОПРОКРУТКИ
const AUTOPLAY_INTERVAL = 4000; // Время показа одного слайда (4 секунды)
const RESUME_DELAY = 10000;     // Время паузы после клика по кнопке (10 секунд)

// Рассчитываем ширину шага (ширина карточки + gap)
function getStepWidth() {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const trackStyle = window.getComputedStyle(track);
    const gap = parseFloat(trackStyle.gap) || 0;
    return cardWidth + gap;
}

// Количество видимых карточек на экране
function getVisibleCardsCount() {
    const width = window.innerWidth;
    if (width > 1024) return 3;
    if (width > 768) return 2;
    return 1;
}

function updateSlider() {
    const stepWidth = getStepWidth();
    const visibleCards = getVisibleCardsCount();
    const maxIndex = cards.length - visibleCards;

    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > maxIndex) currentIndex = maxIndex;

    track.style.transform = `translateX(-${currentIndex * stepWidth}px)`;
}

// Функция для шага вперед
function slideNext() {
    const visibleCards = getVisibleCardsCount();
    const maxIndex = cards.length - visibleCards;

    if (currentIndex < maxIndex) {
        currentIndex++;
    } else {
        currentIndex = 0; // Возврат в начало
    }
    updateSlider();
}

// Функция для шага назад
function slidePrev() {
    const visibleCards = getVisibleCardsCount();
    const maxIndex = cards.length - visibleCards;

    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = maxIndex; // Переход в конец
    }
    updateSlider();
}

// Запуск автоматического листания
function startAutoplay() {
    stopAutoplay(); // Очищаем старые таймеры, чтобы избежать ускорения
    autoplayTimer = setInterval(slideNext, AUTOPLAY_INTERVAL);
}

// Полная остановка таймеров
function stopAutoplay() {
    clearInterval(autoplayTimer);
    clearTimeout(resumeTimer);
    resumeTimer = null;
}

// Обработка ручного клика (пауза автопрокрутки)
function handleManualNavigation(action) {
    stopAutoplay(); // Останавливаем автопрокрутку
    action();       // Листаем слайд

    // Запускаем таймер ожидания: автопрокрутка возобновится через RESUME_DELAY мс
    resumeTimer = setTimeout(() => {
        startAutoplay();
    }, RESUME_DELAY);
}

// Слушатели событий для кнопок с паузой
nextBtn.addEventListener('click', () => {
    handleManualNavigation(slideNext);
});

prevBtn.addEventListener('click', () => {
    handleManualNavigation(slidePrev);
});

// Пауза при наведении мыши (чтобы пользователь мог спокойно прочитать отзыв)
viewport.addEventListener('mouseenter', () => {
    // Останавливаем только если не активна пауза от клика по кнопке
    if (!resumeTimer) {
        clearInterval(autoplayTimer);
    }
});

viewport.addEventListener('mouseleave', () => {
    // Возобновляем, только если не ждем возобновления после клика
    if (!resumeTimer) {
        startAutoplay();
    }
});

// --- Добавление поддержки свайпов (Touch Events) ---
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

viewport.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    endX = e.touches[0].clientX;
    endY = e.touches[0].clientY;
    stopAutoplay();
}, { passive: true });

viewport.addEventListener('touchmove', (e) => {
    endX = e.touches[0].clientX;
    endY = e.touches[0].clientY;
}, { passive: true });

viewport.addEventListener('touchend', () => {
    const thresholdX = 50; // Минимальное расстояние для свайпа по горизонтали
    const swipeDistanceX = startX - endX;
    const swipeDistanceY = Math.abs(startY - endY);

    // Слайдим только в том случае, если горизонтальный жест явно преобладает над вертикальным скроллом
    if (Math.abs(swipeDistanceX) > thresholdX && swipeDistanceY < Math.abs(swipeDistanceX)) {
        if (swipeDistanceX > 0) {
            handleManualNavigation(slideNext);
        } else {
            handleManualNavigation(slidePrev);
        }
    }
    // Сброс координат
    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
});

// Пересчет при изменении размера экрана
window.addEventListener('resize', updateSlider);

// Запуск автопрокрутки при загрузке страницы
startAutoplay();


/* 2. Копирование контактов */
const copyButtons = document.querySelectorAll('.contact-section__copy-btn');

copyButtons.forEach(button => {
    button.addEventListener('click', () => {
        const textToCopy = button.getAttribute('data-copy');
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            button.classList.add('contact-section__copy-btn--copied');
            const tooltip = button.querySelector('.contact-section__tooltip');
            tooltip.innerText = 'Скопировано!';
            
            setTimeout(() => {
                button.classList.remove('contact-section__copy-btn--copied');
                setTimeout(() => {
                    tooltip.innerText = 'Копировать';
                }, 200);
            }, 2000);
        }).catch(err => {
            console.error('Ошибка копирования: ', err);
        });
    });
});