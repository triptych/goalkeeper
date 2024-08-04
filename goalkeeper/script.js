// GoalKeeper main script
import * as GoalManagement from './goalManagement.js';
import * as CategoryManagement from './categoryManagement.js';
import * as UIManagement from './uiManagement.js';
import * as PuterIntegration from './puterIntegration.js';

// DOM Elements
const newGoalForm = document.getElementById('new-goal-form');
const goalTitleInput = document.getElementById('goal-title');
const goalNotesInput = document.getElementById('goal-notes');
const goalCategoryInput = document.getElementById('goal-category');
const goalsContainer = document.getElementById('goals-container');
const exportGoalsBtn = document.getElementById('export-goals');
const importGoalsInput = document.getElementById('import-goals');
const goalDetailsDialog = document.getElementById('goal-details-dialog');
const congratulationsDialog = document.getElementById('congratulations-dialog');
const addGoalDialog = document.getElementById('add-goal-dialog');
const openAddGoalDialogBtn = document.getElementById('open-add-goal-dialog');
const closeAddGoalDialogBtn = document.getElementById('close-add-goal-dialog');
const searchDialog = document.getElementById('search-dialog');
const openSearchBtn = document.getElementById('open-search');
const closeSearchBtn = document.getElementById('close-search');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const categoriesDialog = document.getElementById('categories-dialog');
const openCategoriesDialogBtn = document.getElementById('open-categories-dialog');
const closeCategoriesDialogBtn = document.getElementById('close-categories-dialog');
const addCategoryForm = document.getElementById('add-category-form');
const newCategoryInput = document.getElementById('new-category-input');
const categoriesList = document.getElementById('categories-list');
const loginButton = document.getElementById('login-button');
const aiSuggestionDialog = document.getElementById('ai-suggestion-dialog');
const aiSuggestionContent = document.getElementById('ai-suggestion-content');
const closeAiSuggestionBtn = document.getElementById('close-ai-suggestion');

// Attach event listeners
document.querySelectorAll('dialog button').forEach(button => {
    if (button.textContent.toLowerCase().includes('close') || button.textContent.toLowerCase().includes('cancel')) {
        button.addEventListener('click', (event) => {
            const dialog = event.target.closest('dialog');
            if (dialog) {
                dialog.setAttribute('open', 'false');
                dialog.style.display = 'none';
            }
        });
    }
});

loginButton.addEventListener('click', async () => {
    const isLoggedIn = await PuterIntegration.handleLogin();
    if (isLoggedIn) {
        const username = await PuterIntegration.getUserInfo();
        UIManagement.updateLoginStatus(isLoggedIn, loginButton, username);
        await loadGoals();
    } else {
        UIManagement.updateLoginStatus(isLoggedIn, loginButton);
    }
});

newGoalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    GoalManagement.addGoal(goalTitleInput.value, goalNotesInput.value, goalCategoryInput.value);
    renderGoals();
    newGoalForm.reset();
    UIManagement.closeAllDialogs();
});

exportGoalsBtn.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(GoalManagement.getGoals()));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "goals.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

importGoalsInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedGoals = JSON.parse(event.target.result);
            GoalManagement.loadGoals(importedGoals);
            renderGoals();
        } catch (error) {
            console.error('Error importing goals:', error);
            alert('Error importing goals. Please make sure the file is a valid JSON.');
        }
    };
    reader.readAsText(file);
});

openAddGoalDialogBtn.addEventListener('click', () => UIManagement.showDialog(addGoalDialog));
openSearchBtn.addEventListener('click', () => {
    UIManagement.showDialog(searchDialog);
    searchInput.focus();
});
openCategoriesDialogBtn.addEventListener('click', () => {
    renderCategories();
    UIManagement.showDialog(categoriesDialog);
});

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredGoals = GoalManagement.getGoals().filter(goal => 
        goal.title.toLowerCase().includes(searchTerm) || 
        (goal.category && goal.category.toLowerCase().includes(searchTerm))
    );
    renderSearchResults(filteredGoals);
});

addCategoryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newCategory = newCategoryInput.value.trim();
    if (CategoryManagement.addCategory(newCategory)) {
        updateCategoryOptions();
        renderCategories();
        newCategoryInput.value = '';
    }
});

function renderGoals() {
    goalsContainer.innerHTML = '';
    GoalManagement.getGoals().forEach((goal, index) => {
        const goalElement = document.createElement('div');
        goalElement.classList.add('goal-item');
        goalElement.innerHTML = `
            <div class="goal-title">${goal.title}</div>
            <div class="goal-category">${goal.category || 'Uncategorized'}</div>
            <div class="goal-progress">
                <svg class="progress-circle" width="80" height="80">
                    <circle class="progress-circle-bg" cx="40" cy="40" r="36"></circle>
                    <circle class="progress-circle-path" cx="40" cy="40" r="36"></circle>
                </svg>
                <span class="progress-text">${goal.progress}%</span>
            </div>
        `;
        goalElement.addEventListener('click', () => openGoalDialog(index));
        goalsContainer.appendChild(goalElement);
        
        const progressPath = goalElement.querySelector('.progress-circle-path');
        const circumference = 2 * Math.PI * 36;
        progressPath.style.strokeDasharray = `${circumference} ${circumference}`;
        progressPath.style.strokeDashoffset = circumference - (goal.progress / 100) * circumference;
    });
    UIManagement.updateDashboard(GoalManagement.getGoals());
}

function openGoalDialog(index) {
    const goal = GoalManagement.getGoal(index);
    document.getElementById('dialog-title').textContent = goal.title;
    document.getElementById('dialog-category').textContent = goal.category || 'Uncategorized';
    document.getElementById('dialog-progress').textContent = `${goal.progress}% complete`;
    document.getElementById('dialog-notes').value = goal.notes;
    document.getElementById('dialog-last-updated').textContent = `Last updated: ${new Date(goal.lastUpdated).toLocaleString()}`;

    document.getElementById('dialog-progress-1').onclick = () => updateProgress(index, 1);
    document.getElementById('dialog-progress-10').onclick = () => updateProgress(index, 10);
    document.getElementById('dialog-save').onclick = () => saveGoalChanges(index);
    document.getElementById('dialog-delete').onclick = () => deleteGoal(index);
    document.getElementById('dialog-ai-suggestion').onclick = () => getAISuggestion(index);

    UIManagement.showDialog(goalDetailsDialog);
}

function updateProgress(index, amount) {
    GoalManagement.updateGoalProgress(index, amount);
    renderGoals();
    openGoalDialog(index);

    if (GoalManagement.getGoal(index).progress === 100) {
        UIManagement.showDialog(congratulationsDialog);
        UIManagement.createConfetti();
    }
}

function saveGoalChanges(index) {
    GoalManagement.saveGoalChanges(index, document.getElementById('dialog-notes').value);
    renderGoals();
    UIManagement.closeAllDialogs();
}

function deleteGoal(index) {
    if (confirm('Are you sure you want to delete this goal?')) {
        GoalManagement.deleteGoal(index);
        renderGoals();
        UIManagement.closeAllDialogs();
    }
}

async function getAISuggestion(index) {
    try {
        const suggestion = await PuterIntegration.getAISuggestion(GoalManagement.getGoal(index));
        aiSuggestionContent.textContent = suggestion;
        UIManagement.showDialog(aiSuggestionDialog);
    } catch (error) {
        alert('Failed to get AI suggestion. Please try again.');
    }
}

function renderSearchResults(filteredGoals) {
    searchResults.innerHTML = '';
    filteredGoals.forEach((goal, index) => {
        const resultElement = document.createElement('div');
        resultElement.classList.add('search-result');
        resultElement.innerHTML = `
            <div class="goal-title">${goal.title}</div>
            <div class="goal-category">${goal.category || 'Uncategorized'}</div>
            <div class="goal-progress">${goal.progress}% complete</div>
        `;
        resultElement.addEventListener('click', () => {
            const originalIndex = GoalManagement.getGoals().findIndex(g => g.title === goal.title && g.lastUpdated === goal.lastUpdated);
            openGoalDialog(originalIndex);
            UIManagement.closeAllDialogs();
        });
        searchResults.appendChild(resultElement);
    });
}

function updateCategoryOptions() {
    goalCategoryInput.innerHTML = '<option value="">Select Category</option>';
    CategoryManagement.getCategories().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        goalCategoryInput.appendChild(option);
    });
}

function renderCategories() {
    categoriesList.innerHTML = '';
    CategoryManagement.getCategories().forEach(category => {
        const li = document.createElement('li');
        li.classList.add('category-item');
        li.innerHTML = `
            <span>${category}</span>
            <button class="delete-category" data-category="${category}">Delete</button>
        `;
        categoriesList.appendChild(li);
    });

    document.querySelectorAll('.delete-category').forEach(button => {
        button.addEventListener('click', (event) => {
            const categoryToDelete = event.target.getAttribute('data-category');
            deleteCategory(categoryToDelete);
        });
    });
}

function deleteCategory(category) {
    if (confirm(`Are you sure you want to delete the category "${category}"?`)) {
        CategoryManagement.deleteCategory(category);
        updateCategoryOptions();
        renderCategories();

        GoalManagement.getGoals().forEach((goal, index) => {
            if (goal.category === category) {
                GoalManagement.saveGoalChanges(index, goal.notes, '');
            }
        });
        renderGoals();
    }
}

async function loadGoals() {
    const kvStore = PuterIntegration.isLoggedIn() ? PuterIntegration.getKVStore() : null;
    await GoalManagement.loadGoals(kvStore);
    renderGoals();
}

// Initialize app
async function initApp() {
    UIManagement.closeAllDialogs();
    
    const isLoggedIn = PuterIntegration.isLoggedIn();
    if (isLoggedIn) {
        const username = await PuterIntegration.getUserInfo();
        UIManagement.updateLoginStatus(isLoggedIn, loginButton, username);
        await loadGoals();
    } else {
        UIManagement.updateLoginStatus(isLoggedIn, loginButton);
    }
    
    CategoryManagement.loadCategories();
    updateCategoryOptions();

    // Register service worker
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service worker registered successfully');
        } catch (error) {
            console.error('Service worker registration failed:', error);
        }
    }
}

// Call initApp when the script loads
initApp();