export function closeAllDialogs() {
    const dialogs = document.querySelectorAll('dialog');
    dialogs.forEach(dialog => {
        dialog.setAttribute('open', 'false');
        dialog.style.display = 'none';
    });
}

export function showDialog(dialog) {
    closeAllDialogs();
    dialog.setAttribute('open', 'true');
    dialog.style.display = 'flex';
}

export function createConfetti() {
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }
}

export function updateLoginStatus(isLoggedIn, loginButton, username = null) {
    if (isLoggedIn) {
        loginButton.textContent = username ? `Logged in as ${username}` : 'Logged In';
        loginButton.disabled = true;
    } else {
        loginButton.textContent = 'Login to Puter';
        loginButton.disabled = false;
    }
}

export function updateDashboard(goals) {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.progress === 100).length;
    const inProgressGoals = totalGoals - completedGoals;

    document.getElementById('total-goals').textContent = totalGoals;
    document.getElementById('completed-goals').textContent = completedGoals;
    document.getElementById('in-progress-goals').textContent = inProgressGoals;
}