let goals = [];

export function loadGoals(kvStore) {
    const localGoals = localStorage.getItem('goals');
    if (localGoals) {
        goals = JSON.parse(localGoals);
    }

    if (kvStore) {
        return kvStore.get('goals')
            .then(kvGoals => {
                if (kvGoals) {
                    goals = JSON.parse(kvGoals);
                }
                return goals;
            })
            .catch(error => {
                console.error('Error loading goals from KV store:', error);
                return goals;
            });
    }

    return Promise.resolve(goals);
}

export function saveGoals(kvStore) {
    localStorage.setItem('goals', JSON.stringify(goals));

    if (kvStore) {
        return kvStore.set('goals', JSON.stringify(goals))
            .catch(error => {
                console.error('Error saving goals to KV store:', error);
            });
    }

    return Promise.resolve();
}

export function addGoal(title, notes, category) {
    const newGoal = {
        title,
        notes,
        category,
        progress: 0,
        lastUpdated: new Date().toISOString()
    };
    goals.push(newGoal);
    return saveGoals();
}

export function updateGoalProgress(index, amount) {
    goals[index].progress = Math.min(100, goals[index].progress + amount);
    goals[index].lastUpdated = new Date().toISOString();
    return saveGoals();
}

export function saveGoalChanges(index, notes) {
    goals[index].notes = notes;
    goals[index].lastUpdated = new Date().toISOString();
    return saveGoals();
}

export function deleteGoal(index) {
    goals.splice(index, 1);
    return saveGoals();
}

export function sortGoalsByProgress() {
    goals.sort((a, b) => b.progress - a.progress);
    return saveGoals();
}

export function getGoals() {
    return goals;
}

export function getGoal(index) {
    return goals[index];
}