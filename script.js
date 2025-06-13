document.addEventListener('DOMContentLoaded', function() {
    const playBtn = document.getElementById('play-btn');
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.getElementById('game-container');

    // Функция для создания навигации и игровых экранов
    function showMainGameScreen() {
        // Удаляем стартовый экран
        startScreen.classList.remove('active');
        // Если уже есть игровой экран — не добавляем повторно
        if (document.getElementById('main-game')) return;
        // Создаём основной игровой экран
        const mainGame = document.createElement('div');
        mainGame.id = 'main-game';
        mainGame.className = 'screen active';
        mainGame.innerHTML = `
            <div class="main-image">
                <img src="assets/main-image.png" alt="FIT KIT" class="main-img" onerror="this.onerror=null; this.src='assets/logo.png';">
            </div>
            <nav class="main-nav">
                <button id="open-case-btn">Открывать кейсы</button>
                <button id="collection-btn">Коллекция</button>
                <button id="back-btn">Назад</button>
            </nav>
            <div id="game-content"></div>
        `;
        gameContainer.appendChild(mainGame);
        // Навигация
        document.getElementById('back-btn').onclick = function() {
            mainGame.remove();
            startScreen.classList.add('active');
        };
        document.getElementById('open-case-btn').onclick = showCaseModal;
        document.getElementById('collection-btn').onclick = showCollection;
    }

    // Модальное окно для ввода кода
    function showCaseModal() {
        if (document.getElementById('case-modal')) return;
        
        // Скрываем main-image и кнопки
        const mainImage = document.querySelector('.main-image');
        const mainNav = document.querySelector('.main-nav');
        if (mainImage) mainImage.style.display = 'none';
        if (mainNav) mainNav.style.display = 'none';

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'case-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Введите код</h2>
                <input id="code-input" type="text" placeholder="Ваш код">
                <button id="submit-code-btn">Открыть кейс</button>
                <div id="code-error"></div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('submit-code-btn').onclick = validateCode;
        document.getElementById('code-input').onkeydown = function(e) {
            if (e.key === 'Enter') validateCode();
        };
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.remove();
                // Показываем main-image и кнопки обратно при закрытии модального окна
                if (mainImage) mainImage.style.display = 'block';
                if (mainNav) mainNav.style.display = 'flex';
            }
        };
    }

    // Проверка кода и анимация открытия кейса
    async function validateCode() {
        const input = document.getElementById('code-input');
        const error = document.getElementById('code-error');
        const code = input.value.trim();
        
        // Accept any non-empty code
        if (!code) {
            error.textContent = 'Введите код!';
            input.classList.add('error');
            return;
        }
        
        // Успех — показываем анимацию открытия кейса
        document.getElementById('case-modal').remove();
        showCaseAnimation();
    }

    // Анимация открытия кейса и выпадение товара
    async function showCaseAnimation() {
        const gameContent = document.getElementById('game-content');
        gameContent.innerHTML = `<div class="case-animation"><img src="assets/products/product-case.png" alt="Кейс" style="width:120px;"></div><div style="text-align:center;color:#ff4fa3;font-weight:bold;">Открываем кейс...</div>`;
        setTimeout(async () => {
            let cards = [];
            try {
                const res = await fetch('data/cards.json');
                cards = await res.json();
            } catch {
                cards = [];
            }

            // Определяем вероятности для каждой карточки
            const probabilities = {
                'cat': 0.05,    // 5% - самая редкая
                'wolf': 0.10,   // 10%
                'fox': 0.15,    // 15%
                'duck': 0.20,   // 20%
                'rabbit': 0.25, // 25%
                'squirrel': 0.25 // 25%
            };

            // Генерируем случайное число от 0 до 1
            const random = Math.random();
            let cumulativeProbability = 0;
            let selectedCard = null;

            // Выбираем карточку на основе вероятностей
            for (const card of cards) {
                cumulativeProbability += probabilities[card.id];
                if (random <= cumulativeProbability) {
                    selectedCard = card;
                    break;
                }
            }

            // Если по какой-то причине карточка не выбрана, берем последнюю
            if (!selectedCard) {
                selectedCard = cards[cards.length - 1];
            }

            gameContent.innerHTML = `<div style="text-align:center;">
                <img src="${selectedCard.productImg}" alt="Приз" class="prize-img" style="width:180px;box-shadow:0 4px 24px #ffb3de55;border-radius:24px;cursor:pointer;transition:transform 0.2s;">
                <div style='margin-top:18px;color:#ff4fa3;font-weight:bold;'>Поздравляем! Ваш приз</div>
                <div style='color:#333;font-size:1.1rem;'>Нажмите на приз, чтобы продолжить</div>
            </div>`;
            document.querySelector('.prize-img').onclick = function() {
                showAnimalCardByProduct(selectedCard.productImg);
            };
        }, 3000);
    }

    // Новый способ: ищем карточку зверушки по productImg
    async function showAnimalCardByProduct(productImg) {
        let cards = [];
        try {
            const res = await fetch('data/cards.json');
            cards = await res.json();
        } catch {
            cards = [];
        }
        const card = cards.find(c => c.productImg === productImg);
        if (!card) {
            document.getElementById('game-content').innerHTML = `<h2>Ошибка: карточка не найдена</h2>`;
            return;
        }
        document.getElementById('game-content').innerHTML = `
            <div class="animal-card">
                <img src="${card.animalImg}" alt="${card.name}">
                <div class="animal-name">${card.name}</div>
                <div class="animal-desc">${card.desc}</div>
                <button id="save-to-collection-btn">Сохранить в коллекцию</button>
                <div id="save-success"></div>
            </div>
        `;
        document.getElementById('save-to-collection-btn').onclick = function() {
            saveToCollection(card);
        };

        // Показываем только кнопки обратно
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) mainNav.style.display = 'flex';
    }

    // Сохранение карточки в коллекцию (LocalStorage)
    function saveToCollection(card) {
        let collection = [];
        try {
            collection = JSON.parse(localStorage.getItem('fitkit_collection')) || [];
        } catch { collection = []; }
        // Не добавлять дубликаты
        if (!collection.find(c => c.id === card.id)) {
            collection.push(card);
            localStorage.setItem('fitkit_collection', JSON.stringify(collection));
            document.getElementById('save-success').textContent = 'Сохранено в коллекцию!';
        } else {
            document.getElementById('save-success').textContent = 'Уже в коллекции!';
        }
    }

    // Просмотр коллекции
    function showCollection() {
        let collection = [];
        try {
            collection = JSON.parse(localStorage.getItem('fitkit_collection')) || [];
        } catch { collection = []; }
        const gameContent = document.getElementById('game-content');
        if (!collection.length) {
            gameContent.innerHTML = '<div style="color:#ff4fa3;text-align:center;font-weight:bold;">Ваша коллекция пуста</div>';
            return;
        }
        gameContent.innerHTML = '<h2 style="color:#ff4fa3;text-align:center;">Ваша коллекция</h2>' +
            '<div class="collection-list">' +
            collection.map(card => `
                <div class="animal-card" style="max-width:220px;display:inline-block;margin:12px;vertical-align:top;">
                    <img src="${card.animalImg}" alt="${card.name}">
                    <div class="animal-name">${card.name}</div>
                    <div class="animal-desc">${card.desc}</div>
                </div>
            `).join('') + '</div>';
    }

    playBtn.addEventListener('click', showMainGameScreen);
}); 