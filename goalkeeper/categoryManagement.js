let categories = ['Personal', 'Work', 'Health', 'Finance'];

export function loadCategories() {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
    }
    return categories;
}

export function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

export function addCategory(newCategory) {
    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        saveCategories();
        return true;
    }
    return false;
}

export function deleteCategory(category) {
    categories = categories.filter(c => c !== category);
    saveCategories();
}

export function getCategories() {
    return categories;
}