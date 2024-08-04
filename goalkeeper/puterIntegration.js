export async function handleLogin() {
    try {
        await puter.auth.signIn();
        return true;
    } catch (error) {
        console.error('Login failed:', error);
        return false;
    }
}

export function isLoggedIn() {
    return puter.auth.isSignedIn();
}

export function getKVStore() {
    return puter.kv;
}

export async function getAISuggestion(goal) {
    const prompt = `I have a goal titled "${goal.title}". Here are my notes about it: "${goal.notes}". Can you provide a helpful suggestion to move forward on this goal?`;

    try {
        return await puter.ai.chat(prompt);
    } catch (error) {
        console.error('Error getting AI suggestion:', error);
        throw error;
    }
}

export async function getUserInfo() {
    try {
        const user = await puter.auth.getUser();
        return user.username;
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
}