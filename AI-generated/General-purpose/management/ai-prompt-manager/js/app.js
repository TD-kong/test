/**
 * Main Application Actions & Event Handlers
 */

async function savePrompt(e) {
    e.preventDefault();
    const id = document.getElementById('promptId').value;
    const title = document.getElementById('formTitle').value;
    const category = document.getElementById('formCategory').value.trim();
    const tags = document.getElementById('formTags').value.split(',').map(t => t.trim()).filter(Boolean);
    const pinned = document.getElementById('formPinned').checked;
    const favorite = document.getElementById('formFavorite').checked;
    const description = document.getElementById('formDescription').value;
    const content = document.getElementById('formContent').value;

    if (id) {
        const index = prompts.findIndex(p => p.id === id);
        if (index !== -1) {
            prompts[index] = {
                ...prompts[index],
                title,
                category,
                tags,
                pinned,
                favorite,
                description,
                content,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        const newPrompt = {
            id: Date.now().toString(),
            title,
            category,
            tags,
            pinned,
            favorite,
            description,
            content,
            updatedAt: new Date().toISOString()
        };
        prompts.unshift(newPrompt);
    }

    saveToStorage();
    closeModal();
    renderCategories();
    renderPrompts();
    showToast('保存しました');

    await pushToCloud(false);
}

async function togglePin(id) {
    const index = prompts.findIndex(p => p.id === id);
    if (index === -1) return;

    const nextState = !prompts[index].pinned;
    prompts[index] = {
        ...prompts[index],
        pinned: nextState,
        updatedAt: new Date().toISOString()
    };

    saveToStorage();
    renderPrompts();
    refreshDetailModalState();
    showToast(nextState ? '上部にピン留めしました' : 'ピン留めを解除しました');

    await pushToCloud(false);
}

async function toggleFavorite(id) {
    const index = prompts.findIndex(p => p.id === id);
    if (index === -1) return;

    const nextState = !prompts[index].favorite;
    prompts[index] = {
        ...prompts[index],
        favorite: nextState,
        updatedAt: new Date().toISOString()
    };

    saveToStorage();
    renderPrompts();
    refreshDetailModalState();
    showToast(nextState ? 'お気に入りに追加しました' : 'お気に入りを解除しました');

    await pushToCloud(false);
}

async function toggleDetailPin() {
    if (!activeDetailPrompt) return;
    await togglePin(activeDetailPrompt.id);
}

async function toggleDetailFavorite() {
    if (!activeDetailPrompt) return;
    await toggleFavorite(activeDetailPrompt.id);
}

async function deletePrompt(id) {
    if (confirm('本当にこのプロンプトを削除しますか？')) {
        prompts = prompts.filter(p => p.id !== id);
        saveToStorage();
        renderCategories();
        renderPrompts();
        showToast('削除しました');

        await pushToCloud(false);
    }
}

function copyContent(text) {
    const decoded = text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\\n/g, '\n');
    navigator.clipboard.writeText(decoded);
    showToast('プロンプトをクリップボードにコピーしました');
}

function copyDetailContent() {
    if (!activeDetailPrompt) return;
    navigator.clipboard.writeText(activeDetailPrompt.content);
    showToast('プロンプトをコピーしました');
}

function downloadActiveMd() {
    if (activeDetailPrompt) {
        downloadSingleMd(activeDetailPrompt.id);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    renderCategories();
    renderPrompts();

    const config = getGasConfig();
    if (config.url) {
        await pullFromCloud(true);
    } else {
        updateSyncStatusUI('unconfigured', 'ローカルのみ');
    }
});

document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
        const config = getGasConfig();
        if (config.url) {
            await pullFromCloud(true);
        }
    }
});
