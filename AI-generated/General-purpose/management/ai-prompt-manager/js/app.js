/**
 * Main Application Actions & Event Handlers
 */

async function savePrompt(e) {
    e.preventDefault();
    const id = document.getElementById('promptId').value;
    const title = document.getElementById('formTitle').value;
    const category = document.getElementById('formCategory').value.trim();
    const tags = document.getElementById('formTags').value.split(',').map(t => t.trim()).filter(Boolean);
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

    // Push changes to GAS cloud
    await pushToCloud(false);
}

async function deletePrompt(id) {
    if (confirm('本当にこのプロンプトを削除しますか？')) {
        prompts = prompts.filter(p => p.id !== id);
        saveToStorage();
        renderCategories();
        renderPrompts();
        showToast('削除しました');

        // Push deletion to GAS cloud
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

// Initial Render & Cloud Sync on page load
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

// Auto-pull when returning to the tab/app on PC or smartphone
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
        const config = getGasConfig();
        if (config.url) {
            await pullFromCloud(true);
        }
    }
});
