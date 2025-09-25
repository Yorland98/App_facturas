// Global variables
let currentUser = null;
let currentDate = new Date();
let selectedDate = null;
let reportDate = new Date();
let currentCommitment = null;
let isLogin = true;

// Data storage
let users = JSON.parse(localStorage.getItem('finanzapp_users') || '{}');
let userData = {};

// Default categories
const defaultCategories = {
    alimentacion: 'Alimentación',
    transporte: 'Transporte',
    servicios: 'Servicios',
    ocio: 'Ocio',
    salud: 'Salud',
    educacion: 'Educación',
    ropa: 'Ropa',
    hogar: 'Hogar',
    trabajo: 'Trabajo',
    compromiso: 'Compromisos',
    otro: 'Otro'
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    generateCalendar();
    updateReports();
    populateCategories();
});

// Category management functions
function getUserCategories() {
    if (!userData.customCategories) {
        userData.customCategories = {};
    }
    return { ...defaultCategories, ...userData.customCategories };
}

function populateCategories() {
    const categories = getUserCategories();
    const selects = ['transactionCategory', 'expenseCategory'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '';
            
            // Add regular categories
            for (const [key, value] of Object.entries(categories)) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = value;
                select.appendChild(option);
            }
            
            // Add "New category" option
            const newOption = document.createElement('option');
            newOption.value = 'nueva_categoria';
            newOption.textContent = '+ Agregar nueva categoría';
            newOption.style.fontStyle = 'italic';
            newOption.style.color = '#2563eb';
            select.appendChild(newOption);
        }
    });
}

function toggleNewCategoryInput(selectId, containerId) {
    const select = document.getElementById(selectId);
    const container = document.getElementById(containerId);
    
    if (select.value === 'nueva_categoria') {
        container.classList.add('show');
        const input = container.querySelector('input');
        if (input) input.focus();
    } else {
        container.classList.remove('show');
    }
}

function addNewCategory(selectId, inputId, containerId) {
    const input = document.getElementById(inputId);
    const newCategoryName = input.value.trim();
    
    if (!newCategoryName) {
        alert('Por favor ingresa el nombre de la categoría');
        return;
    }
    
    // Check if category already exists
    const categories = getUserCategories();
    const categoryKey = newCategoryName.toLowerCase().replace(/\s+/g, '_');
    
    if (categories[categoryKey]) {
        alert('Esta categoría ya existe');
        return;
    }
    
    // Add to user's custom categories
    if (!userData.customCategories) {
        userData.customCategories = {};
    }
    
    userData.customCategories[categoryKey] = newCategoryName;
    
    // Save to localStorage
    users[currentUser] = userData;
    localStorage.setItem('finanzapp_users', JSON.stringify(users));
    
    // Update all category selects
    populateCategories();
    
    // Set the new category as selected
    const select = document.getElementById(selectId);
    select.value = categoryKey;
    
    // Hide the input container
    const container = document.getElementById(containerId);
    container.classList.remove('show');
    
    // Clear the input
    input.value = '';
    
    alert(`Categoría "${newCategoryName}" agregada exitosamente`);
}

function cancelNewCategory(selectId, containerId) {
    const select = document.getElementById(selectId);
    const container = document.getElementById(containerId);
    
    // Reset select to first option
    select.selectedIndex = 0;
    
    // Hide the input container
    container.classList.remove('show');
    
    // Clear the input
    const input = container.querySelector('input');
    if (input) input.value = '';
}

// Authentication functions
function toggleAuthMode() {
    isLogin = !isLogin;
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (isLogin) {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    if (users[email] && users[email].password === password) {
        currentUser = email;
        userData = users[email];
        document.getElementById('userName').textContent = userData.name || 'Usuario';
        showApp();
        updateDashboard();
        populateCategories();
    } else {
        alert('Credenciales incorrectas');
    }
}

function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    if (users[email]) {
        alert('El usuario ya existe');
        return;
    }
    
    users[email] = {
        name: name,
        password: password,
        transactions: [],
        commitments: [],
        customCategories: {},
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('finanzapp_users', JSON.stringify(users));
    
    currentUser = email;
    userData = users[email];
    document.getElementById('userName').textContent = name;
    showApp();
    updateDashboard();
    populateCategories();
}

function loginWithGoogle() {
    // Simulate Google login
    const googleUser = {
        name: 'Usuario Google',
        email: 'usuario@google.com'
    };
    
    if (!users[googleUser.email]) {
        users[googleUser.email] = {
            name: googleUser.name,
            password: 'google_auth',
            transactions: [],
            commitments: [],
            customCategories: {},
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('finanzapp_users', JSON.stringify(users));
    }
    
    currentUser = googleUser.email;
    userData = users[googleUser.email];
    document.getElementById('userName').textContent = googleUser.name;
    showApp();
    updateDashboard();
    populateCategories();
}

function logout() {
    currentUser = null;
    userData = {};
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('appScreen').style.display = 'none';
}

function showApp() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
}

// Tab navigation
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Update header title
    const titles = {
        dashboard: 'Dashboard',
        transactions: 'Movimientos',
        calendar: 'Calendario',
        commitments: 'Compromisos',
        reports: 'Reportes'
    };
    document.getElementById('appTitle').textContent = titles[tabName];
    
    if (tabName === 'calendar') {
        generateCalendar();
    } else if (tabName === 'commitments') {
        updateCommitments();
    } else if (tabName === 'reports') {
        updateReports();
    }
}

// Transaction functions
function addTransaction() {
    const type = document.getElementById('transactionType').value;
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const description = document.getElementById('transactionDescription').value;
    const category = document.getElementById('transactionCategory').value;
    
    if (!amount || amount <= 0) {
        alert('Por favor ingresa un monto válido');
        return;
    }
    
    if (!description) {
        alert('Por favor ingresa una descripción');
        return;
    }
    
    if (category === 'nueva_categoria') {
        alert('Por favor selecciona una categoría válida o crea una nueva');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        type: type,
        amount: amount,
        description: description,
        category: category,
        date: new Date().toISOString(),
        commitment: null
    };
    
    userData.transactions.push(transaction);
    users[currentUser] = userData;
    localStorage.setItem('finanzapp_users', JSON.stringify(users));
    
    // Clear form
    document.getElementById('transactionAmount').value = '';
    document.getElementById('transactionDescription').value = '';
    
    updateDashboard();
    updateTransactionsList();
    generateCalendar();
    
    alert('Transacción agregada exitosamente');
}

// Modal functions
function showAddIncomeModal() {
    document.getElementById('incomeModal').style.display = 'block';
}

function showAddExpenseModal() {
    populateCategories(); // Ensure categories are up to date
    document.getElementById('expenseModal').style.display = 'block';
}

function showAddSavingsModal() {
    document.getElementById('savingsModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function addIncome() {
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const description = document.getElementById('incomeDescription').value;
    const frequency = document.getElementById('incomeFrequency').value;
    
    if (!amount || amount <= 0) {
        alert('Por favor ingresa un monto válido');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        type: 'income',
        amount: amount,
        description: description || 'Ingreso',
        category: 'ingreso',
        date: new Date().toISOString(),
        frequency: frequency,
        commitment: null
    };
    
    userData.transactions.push(transaction);
    users[currentUser] = userData;
    localStorage.setItem('finanzapp_users', JSON.stringify(users));
    
    // Clear form
    document.getElementById('incomeAmount').value = '';
    document.getElementById('incomeDescription').value = '';
    
    closeModal('incomeModal');
    updateDashboard();
    updateTransactionsList();
    generateCalendar();
    
    alert('Ingreso agregado exitosamente');
}

function addExpense() {
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDescription').value;
    const category = document.getElementById('expenseCategory').value;
    
    if (!amount || amount <= 0) {
        alert('Por favor ingresa un monto válido');
        return;
    }
    
    if (category === 'nueva_categoria') {
        alert('Por favor selecciona una categoría válida o crea una nueva');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        type: 'expense',
        amount: amount,
        description: description || 'Gasto',
        category: category,
        date: new Date().toISOString(),
        commitment: null
    };
    
    userData.transactions.push(transaction);
    users[currentUser] = userData;
    localStorage.setItem('finanzapp_users', JSON.stringify(users));
    
    // Clear form
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDescription').value = '';
    
    closeModal('expenseModal');
    updateDashboard();
    updateTransactionsList();
    generateCalendar();
    
    alert('Gasto registrado exitosamente');
}

function addSavings() {
    const amount = parseFloat(document.getElementById('savingsAmount').value);
    const goal = document.getElementById('savingsGoal').value;
    
    if (!amount || amount <= 0) {
        alert('Por favor ingresa un monto válido');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        type: 'savings',
        amount: amount,
        description: goal || 'Ahorro',
        category: 'ahorro',
        date: new Date().toISOString(),
        commitment: null
    };
    
    userData.transactions.push(transaction);
    users[currentUser] = userData;
    localStorage.setItem('finanzapp_users', JSON.stringify(users));
    
    // Clear form
    document.getElementById('savingsAmount').value = '';
    document.getElementById('savingsGoal').value = '';
    
    closeModal('savingsModal');
    updateDashboard();
    updateTransactionsList();
    generateCalendar();
    
    alert('Ahorro establecido exitosamente');
}

// Dashboard functions
function updateDashboard() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavings = 0;
    
    userData.transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
            switch (transaction.type) {
                case 'income':
                    totalIncome += transaction.amount;
                    break;
                case 'expense':
                    totalExpenses += transaction.amount;
                    break;
                case 'savings':
                    totalSavings += transaction.amount;
                    break;
            }
        }
    });
    
    const balance = totalIncome - totalExpenses - totalSavings;
    
    document.getElementById('totalIncome').textContent = `${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `${totalExpenses.toFixed(2)}`;
    document.getElementById('totalSavings').textContent = `${totalSavings.toFixed(2)}`;
    document.getElementById('currentBalance').textContent = `${balance.toFixed(2)}`;
    
    updateRecentTransactions();
}

function updateRecentTransactions() {
    const recentContainer = document.getElementById('recentTransactions');
    const recentTransactions = userData.transactions
        .slice(-5)
        .reverse();
    
    if (recentTransactions.length === 0) {
        recentContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: #6b7280;"><p>No hay transacciones recientes</p></div>';
        return;
    }
    
    let html = '';
    const categories = getUserCategories();
    
    recentTransactions.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString();
        const amountClass = transaction.type;
        const sign = transaction.type === 'income' ? '+' : '-';
        const categoryName = categories[transaction.category] || transaction.category;
        
        html += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${transaction.description}</h4>
                    <div class="transaction-date">${date} • ${categoryName}</div>
                </div>
                <div class="transaction-amount ${amountClass}">${sign}${transaction.amount.toFixed(2)}</div>
            </div>
        `;
    });
    
    recentContainer.innerHTML = html;
}

function updateTransactionsList() {
    const container = document.getElementById('allTransactions');
    const transactions = userData.transactions.slice().reverse();
    
    if (transactions.length === 0) {
        container.innerHTML = '<div style="padding: 1rem; text-align: center; color: #6b7280;"><p>No hay transacciones registradas</p></div>';
        return;
    }
    
    let html = '';
    const categories = getUserCategories();
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString();
        const amountClass = transaction.type;
        const sign = transaction.type === 'income' ? '+' : '-';
        const categoryName = categories[transaction.category] || transaction.category;
        
        html += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${transaction.description}</h4>
                    <div class="transaction-date">${date} • ${categoryName}</div>
                </div>
                <div class="transaction-amount ${amountClass}">${sign}${transaction.amount.toFixed(2)}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Calendar functions
function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Clear calendar
    calendarGrid.innerHTML = '';
    
    // Add day headers
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = firstDay.getDay();
    const numDays = lastDay.getDate();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDate; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= numDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const today = new Date();
        
        // Check if it's today
        if (dayDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Check if there are expenses on this day
        const hasExpenses = userData.transactions.some(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.toDateString() === dayDate.toDateString() &&
                   transaction.type === 'expense';
        });
        
        if (hasExpenses) {
            dayElement.classList.add('has-expense');
        }
        
        // Add click event
        dayElement.addEventListener('click', () => showDayDetails(dayDate));
        
        calendarGrid.appendChild(dayElement);
    }
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendar();
}

function showDayDetails(date) {
    selectedDate = date;
    const dayTransactions = userData.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.toDateString() === date.toDateString();
    });
    
    const dayDetailsContainer = document.getElementById('dayDetails');
    const selectedDateElement = document.getElementById('selectedDate');
    const dayTransactionsElement = document.getElementById('dayTransactions');
    
    selectedDateElement.textContent = `Transacciones del ${date.toLocaleDateString()}`;
    
    // Remove previous selection
    document.querySelectorAll('.calendar-day.selected').forEach(el => 
        el.classList.remove('selected'));
    
    // Add selection to clicked day
    event.target.classList.add('selected');
    
    if (dayTransactions.length === 0) {
        dayTransactionsElement.innerHTML = '<div style="padding: 1rem; text-align: center; color: #6b7280;"><p>No hay transacciones este día</p></div>';
    } else {
        let html = '';
        let totalDay = 0;
        const categories = getUserCategories();
        
        dayTransactions.forEach(transaction => {
            const amountClass = transaction.type;
            const sign = transaction.type === 'income' ? '+' : '-';
            const categoryName = categories[transaction.category] || transaction.category;
            if (transaction.type === 'expense') totalDay += transaction.amount;
            
            html += `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <h4>${transaction.description}</h4>
                        <div class="transaction-date">${categoryName}</div>
                    </div>
                    <div class="transaction-amount ${amountClass}">${sign}${transaction.amount.toFixed(2)}</div>
                </div>
            `;
        });
        
        if (totalDay > 0) {
            html += `
                <div class="transaction-item" style="background: #fee2e2; font-weight: bold;">
                    <div class="transaction-info">
                        <h4>Total gastado en el día</h4>
                    </div>
                    <div class="transaction-amount expense">-${totalDay.toFixed(2)}</div>
                </div>
            `;
        }
        
        dayTransactionsElement.innerHTML = html;
    }
    
    dayDetailsContainer.style.display = 'block';
}

// Commitments functions
function addCommitment() {
    const name = document.getElementById('commitmentName').value;
    
    if (!name) {
        alert('Por favor ingresa el nombre del compromiso');
        return;
    }
    
    if (!userData.commitments) {
        userData.commitments = [];
    }
    
    const commitment = {
        id: Date.now(),
        name: name,
        expenses: []
    };
    
    userData.commitments.push(commitment);
    users[currentUser] = userData;
    localStorage.setItem('finanzapp_users', JSON.stringify(users));
    
    document.getElementById('commitmentName').value = '';
    updateCommitments();
    
    alert('Compromiso creado exitosamente');
}

function updateCommitments() {
    const container = document.getElementById('commitmentsGrid');
    
    if (!userData.commitments) {
        userData.commitments = [];
    }
    
    let html = `
        <div class="commitment-card add-commitment" onclick="document.getElementById('commitmentName').focus()">
            <div class="icon">➕</div>
            <div>Agregar Compromiso</div>
        </div>
    `;
    
    userData.commitments.forEach(commitment => {
        const total = commitment.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        html += `
            <div class="commitment-card" onclick="openCommitmentModal('${commitment.id}', '${commitment.name}')">
                <div class="icon">📋</div>
                <h4>${commitment.name}</h4>
                <div class="commitment-total">${total.toFixed(2)}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function openCommitmentModal(commitmentId, commitmentName) {
    currentCommitment = commitmentId;
    document.getElementById('commitmentModalTitle').textContent = `Agregar Gasto - ${commitmentName}`;
    document.getElementById('commitmentModal').style.display = 'block';
}

function addCommitmentExpense() {
    const amount = parseFloat(document.getElementById('commitmentAmount').value);
    const description = document.getElementById('commitmentDescription').value;
    
    if (!amount || amount <= 0) {
        alert('Por favor ingresa un monto válido');
        return;
    }
    
    const commitment = userData.commitments.find(c => c.id == currentCommitment);
    if (!commitment) return;
    
    const expense = {
        id: Date.now(),
        amount: amount,
        description: description || 'Gasto del compromiso',
        date: new Date().toISOString()
    };
    
    commitment.expenses.push(expense);
    
    // Also add to general transactions
    const transaction = {
        id: Date.now(),
        type: 'expense',
        amount: amount,
        description: `${commitment.name}: ${description}`,
        category: 'compromiso',
        date: new Date().toISOString(),
        commitment: currentCommitment
    };
    
    userData.transactions.push(transaction);
    users[currentUser] = userData;
    localStorage.setItem('finanzapp_users', JSON.stringify(users));
    
    // Clear form
    document.getElementById('commitmentAmount').value = '';
    document.getElementById('commitmentDescription').value = '';
    
    closeModal('commitmentModal');
    updateCommitments();
    updateDashboard();
    generateCalendar();
    
    alert('Gasto agregado al compromiso exitosamente');
}

// Reports functions
function changeReportMonth(direction) {
    reportDate.setMonth(reportDate.getMonth() + direction);
    updateReports();
}

function updateReports() {
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    document.getElementById('reportMonth').textContent = 
        `${monthNames[reportDate.getMonth()]} ${reportDate.getFullYear()}`;
    
    const month = reportDate.getMonth();
    const year = reportDate.getFullYear();
    
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavings = 0;
    let categoryTotals = {};
    
    userData.transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        if (transactionDate.getMonth() === month && transactionDate.getFullYear() === year) {
            switch (transaction.type) {
                case 'income':
                    totalIncome += transaction.amount;
                    break;
                case 'expense':
                    totalExpenses += transaction.amount;
                    if (!categoryTotals[transaction.category]) {
                        categoryTotals[transaction.category] = 0;
                    }
                    categoryTotals[transaction.category] += transaction.amount;
                    break;
                case 'savings':
                    totalSavings += transaction.amount;
                    break;
            }
        }
    });
    
    document.getElementById('reportIncome').textContent = `${totalIncome.toFixed(2)}`;
    document.getElementById('reportExpenses').textContent = `${totalExpenses.toFixed(2)}`;
    document.getElementById('reportSavings').textContent = `${totalSavings.toFixed(2)}`;
    
    // Update category breakdown
    const categoryContainer = document.getElementById('categoryBreakdown');
    let categoryHtml = '';
    
    const categories = getUserCategories();
    
    for (const [category, amount] of Object.entries(categoryTotals)) {
        const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : 0;
        const categoryName = categories[category] || category;
        categoryHtml += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${categoryName}</h4>
                    <div class="transaction-date">${percentage}% del total</div>
                </div>
                <div class="transaction-amount expense">${amount.toFixed(2)}</div>
            </div>
        `;
    }
    
    if (categoryHtml === '') {
        categoryHtml = '<div style="padding: 1rem; text-align: center; color: #6b7280;"><p>No hay gastos este mes</p></div>';
    }
    
    categoryContainer.innerHTML = categoryHtml;
}

function exportToPDF() {
    alert('Funcionalidad de exportar PDF estará disponible próximamente');
}

function exportToExcel() {
    alert('Funcionalidad de exportar Excel estará disponible próximamente');
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Initialize transactions list when switching to transactions tab
document.addEventListener('DOMContentLoaded', function() {
    updateTransactionsList();
});