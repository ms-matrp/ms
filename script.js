// Инициализация данных в localStorage или дефолтные значения
let state = JSON.parse(localStorage.getItem('motoTrackerState')) || {
  targetGoal: 500000,
  oldBikePrice: 150000,
  currentBalance: 107000,
  incomes: [] // Массив объектов: { id, date, amount, source }
};

// Элементы DOM
const goalBtns = document.querySelectorAll('.goal-btn');
const oldBikeInput = document.getElementById('oldBikePrice');
const balanceInput = document.getElementById('currentBalance');
const saveCapitalBtn = document.getElementById('saveCapitalBtn');
const incomeForm = document.getElementById('incomeForm');
const incomeDateInput = document.getElementById('incomeDate');
const historyList = document.getElementById('historyList');
const clearDataBtn = document.getElementById('clearDataBtn');

// Выходные поля аналитики
const totalCapitalEl = document.getElementById('totalCapital');
const remainingAmountEl = document.getElementById('remainingAmount');
const weekIncomeEl = document.getElementById('weekIncome');
const monthIncomeEl = document.getElementById('monthIncome');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');

// Установка сегодняшней даты в поле ввода по умолчанию
incomeDateInput.valueAsDate = new Date();

// Сохранение состояния в LocalStorage
function saveState() {
  localStorage.setItem('motoTrackerState', JSON.stringify(state));
  updateUI();
}

// Форматирование чисел в валютный вид (например, 500 000 ₽)
function formatMoney(amount) {
  return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
}

// Перерасчет недели и месяца
function calculateTimeStats() {
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let weekTotal = 0;
  let monthTotal = 0;

  state.incomes.forEach(item => {
    const itemDate = new Date(item.date);
    
    // Считаем за последние 7 дней
    if (itemDate >= oneWeekAgo && itemDate <= now) {
      weekTotal += item.amount;
    }
    
    // Считаем за текущий месяц
    if (itemDate >= startOfMonth && itemDate <= now) {
      monthTotal += item.amount;
    }
  });

  return { weekTotal, monthTotal };
}

// Обновление интерфейса
function updateUI() {
  // 1. Подсчет общей суммы полученных ежедневных доходов
  const totalEarnedIncomes = state.incomes.reduce((sum, item) => sum + item.amount, 0);

  // 2. Итоговый текущий капитал (старый мот + накопления + новые заработки)
  const totalAvailable = Number(state.oldBikePrice) + Number(state.currentBalance) + totalEarnedIncomes;

  // 3. Сколько осталось
  const remaining = state.targetGoal - totalAvailable;
  const remainingFinal = remaining > 0 ? remaining : 0;

  // 4. Процент выполнения
  const percent = Math.min(Math.round((totalAvailable / state.targetGoal) * 100), 100);

  // Отрисовка в DOM
  totalCapitalEl.textContent = formatMoney(totalAvailable);
  remainingAmountEl.textContent = formatMoney(remainingFinal);
  progressBar.style.width = percent + '%';
  progressPercent.textContent = percent + '%';

  // Статистика за неделю и месяц
  const { weekTotal, monthTotal } = calculateTimeStats();
  weekIncomeEl.textContent = formatMoney(weekTotal);
  monthIncomeEl.textContent = formatMoney(monthTotal);

  // Активная кнопка цели
  goalBtns.forEach(btn => {
    if (Number(btn.dataset.target) === state.targetGoal) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Заполнение инпутов капитала
  oldBikeInput.value = state.oldBikePrice;
  balanceInput.value = state.currentBalance;

  // Отрисовка истории
  renderHistory();
}

// Отрисовка списка истории
function renderHistory() {
  historyList.innerHTML = '';
  
  // Сортируем записи по дате (свежие сверху)
  const sortedIncomes = [...state.incomes].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (sortedIncomes.length === 0) {
    historyList.innerHTML = '<li class="history-item" style="color: var(--text-muted);">Записей пока нет</li>';
    return;
  }

  sortedIncomes.forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <div class="history-info">
        <span>${item.source}</span>
        <span class="history-date">${item.date}</span>
      </div>
      <div>
        <span class="history-amount">+${formatMoney(item.amount)}</span>
        <button class="delete-item-btn" onclick="deleteIncome(${item.id})">✕</button>
      </div>
    `;
    historyList.appendChild(li);
  });
}

// Переключение цели (500k / 550k / 600k)
goalBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    state.targetGoal = Number(btn.dataset.target);
    saveState();
  });
});

// Сохранение капитала
saveCapitalBtn.addEventListener('click', () => {
  state.oldBikePrice = Number(oldBikeInput.value) || 0;
  state.currentBalance = Number(balanceInput.value) || 0;
  saveState();
  alert('Капитал успешно обновлен!');
});

// Добавление нового дохода
incomeForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newIncome = {
    id: Date.now(),
    date: incomeDateInput.value,
    amount: Number(document.getElementById('incomeAmount').value),
    source: document.getElementById('incomeSource').value
  };

  state.incomes.push(newIncome);
  saveState();

  // Очистка полей ввода суммы и источника
  document.getElementById('incomeAmount').value = '';
  document.getElementById('incomeSource').value = '';
  incomeDateInput.valueAsDate = new Date();
});

// Удаление отдельной записи
window.deleteIncome = function(id) {
  state.incomes = state.incomes.filter(item => item.id !== id);
  saveState();
};

// Сброс всех данных
clearDataBtn.addEventListener('click', () => {
  if (confirm('Точно сбросить все сохраненные данные?')) {
    localStorage.removeItem('motoTrackerState');
    state = {
      targetGoal: 500000,
      oldBikePrice: 150000,
      currentBalance: 107000,
      incomes: []
    };
    saveState();
  }
});

// Первый запуск при загрузке страницы
updateUI();
