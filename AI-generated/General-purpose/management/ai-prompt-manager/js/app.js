/**
 * Main Application Actions & Event Handlers
 */

function savePrompt(e) {
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
}

function deletePrompt(id) {
    if (confirm('本当にこのプロンプトを削除しますか？')) {
        prompts = prompts.filter(p => p.id !== id);
        saveToStorage();
        renderCategories();
        renderPrompts();
        showToast('削除しました');
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

// Initial Render on page load
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderPrompts();
});
