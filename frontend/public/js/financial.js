// Event listener for Expense Tracker link
document.querySelector('.feature-link[data-feature="expense-tracker"]').addEventListener('click', function(event) {
  event.preventDefault();
  
  // Load the expense tracker implementation into the content area
  document.getElementById('featureContent').innerHTML = `
    <h2>Expense Tracker</h2>
    <form id="expenseTrackerForm">
      <label for="expenseDescription">Expense Description:</label>
      <input type="text" id="expenseDescription" required>
      <label for="expenseAmount">Expense Amount:</label>
      <input type="number" id="expenseAmount" required>
      <button type="submit">Add Expense</button>
    </form>
    <div id="expenseList">
      <h3>Expense List</h3>
      <ul id="expenses"></ul>
    </div>
  `;
  
  // Attach event listener for expense tracker form
  document.getElementById('expenseTrackerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const expenseDescription = document.getElementById('expenseDescription').value;
    const expenseAmount = parseFloat(document.getElementById('expenseAmount').value);
    
    if (!expenseDescription || isNaN(expenseAmount)) {
      return;
    }
    
    // Add expense to the list
    addExpenseToList(expenseDescription, expenseAmount);
  });
});

// Event listener for Budget Tool link
document.querySelector('.feature-link[data-feature="budget-tool"]').addEventListener('click', function(event) {
  event.preventDefault();
  
  // Load the existing budget tool implementation into the content area
  document.getElementById('featureContent').innerHTML = `
    <h2>Budget Tool</h2>
    <form id="budgetForm">
      <label for="monthlyBudget">Monthly Budget:</label>
      <input type="number" id="monthlyBudget" required>
      <button type="submit">Set Monthly Budget</button>
    </form>
    <form id="expenseForm">
      <label for="expenseCategory">Expense Category:</label>
      <input type="text" id="expenseCategory" required>
      <label for="expenseAmount">Expense Amount:</label>
      <input type="number" id="expenseAmount" required>
      <button type="submit">Add Expense</button>
    </form>
    <div id="notifications"></div>
  `;
  
  // Attach event listeners for budget tool forms
  document.getElementById('budgetForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const monthlyBudget = parseFloat(document.getElementById('monthlyBudget').value);
    
    if (isNaN(monthlyBudget)) {
      return;
    }
    
    localStorage.setItem('monthlyBudget', monthlyBudget);
    
    showNotification('Monthly budget set successfully', 'success');
  });
  
  document.getElementById('expenseForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const expenseCategory = document.getElementById('expenseCategory').value;
    const expenseAmount = parseFloat(document.getElementById('expenseAmount').value);
    
    if (!expenseCategory || isNaN(expenseAmount)) {
      return;
    }
    
    let totalExpenses = parseFloat(localStorage.getItem('totalExpenses')) || 0;
    totalExpenses += expenseAmount;
    localStorage.setItem('totalExpenses', totalExpenses);
    
    const monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;
    if (totalExpenses > monthlyBudget) {
      showNotification('Budget exceeded', 'warning');
    } else {
      showNotification('Expense added successfully', 'success');
    }
  });
});

// Event listener for Savings Planning link
document.querySelector('.feature-link[data-feature="savings-planning"]').addEventListener('click', function(event) {
  event.preventDefault();
  
  // Load the savings planning implementation into the content area
  document.getElementById('featureContent').innerHTML = `
    <h2>Savings Planning</h2>
    <p>Start planning and tracking your savings goals today!</p>
    <form id="savingsForm">
      <label for="savingsGoal">Savings Goal:</label>
      <input type="number" id="savingsGoal" required>
      <button type="submit">Set Savings Goal</button>
    </form>
    <div id="savingsSuggestions">
      <h3>Savings Suggestions</h3>
      <ul id="suggestions"></ul>
    </div>
  `;
  
  // Attach event listener for savings form
  document.getElementById('savingsForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const savingsGoal = parseFloat(document.getElementById('savingsGoal').value);
    
    if (isNaN(savingsGoal)) {
      return;
    }
    
    // Provide suggestions based on savings goal
    provideSuggestions(savingsGoal);
  });
});

// Function to add expense to the list
function addExpenseToList(description, amount) {
  const expenseList = document.getElementById('expenses');
  const listItem = document.createElement('li');
  listItem.textContent = `${description}: $${amount.toFixed(2)}`;
  expenseList.appendChild(listItem);
}

// Function to provide savings suggestions
function provideSuggestions(goal) {
  const suggestionsList = document.getElementById('suggestions');
  suggestionsList.innerHTML = ''; // Clear previous suggestions
  
  const suggestions = [
    'Set aside a fixed amount from your monthly income towards your savings goal.',
    'Cut down on unnecessary expenses to increase your savings potential.',
    'Consider investing in low-risk options like a savings account or a fixed deposit.',
    'Create a budget and track your expenses regularly to ensure you\'re on track to meet your savings goal.'
    // Add more suggestions as needed
  ];
  
  suggestions.forEach(function(suggestion) {
    const listItem = document.createElement('li');
    listItem.textContent = suggestion;
    suggestionsList.appendChild(listItem);
  });
}

// Function to display notifications
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.getElementById('notifications').appendChild(notification);
  
  setTimeout(function() {
    notification.remove();
  }, 3000);
}
