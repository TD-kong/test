/**
 * Data state & LocalStorage / Import / Export operations
 */

const STORAGE_KEY = 'ai_prompts';

const DEFAULT_PROMPTS = [
    {
        id: '1',
        title: 'Clean Code 提案アシスタント',
        category: '開発',
        tags: ['refactor', 'clean-code'],
        description: '提出されたコードを保守性の高いコードにリファクタリングするためのシステムプロンプト。',
        content: `# 役割\nあなたはシニアソフトウェアエンジニアです。\n\n# 指示\n以下の原則に従ってコードをリファクタリングしてください：\n1. 読みやすさの向上\n2. 適切な命名規則\n3. 冗長な処理の削除`,
        updatedAt: new Date().toISOString()
    }
];

let prompts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_PROMPTS;

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

function exportAllAsMarkdown() {
    let md = `# AI Prompt / Instruction Context List\n\nGenerated at: ${new Date().toLocaleString()}\n\n`;
    prompts.forEach((p) => {
        md += `## [${p.category || 'General'}] ${p.title}\n`;
        if (p.description) md += `> ${p.description}\n\n`;
        md += `\`\`\`markdown\n${p.content}\n\`\`\`\n\n---\n\n`;
    });
    navigator.clipboard.writeText(md);
    showToast('全プロンプトをAIコンテキスト用Markdownとしてコピーしました！');
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prompts, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `ai_prompts_backup_${new Date().toISOString().slice(0,10)}.json`);
    dlAnchorElem.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                prompts = imported;
                saveToStorage();
                renderCategories();
                renderPrompts();
                showToast('データをインポートしました');
            } else {
                alert('無効なJSONフォーマットです。');
            }
        } catch (err) {
            alert('ファイルの読み込みに失敗しました。');
        }
    };
    reader.readAsText(file);
}

function downloadSingleMd(id) {
    const p = prompts.find(item => item.id === id);
    if (!p) return;
    const blob = new Blob([p.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = p.title.replace(/[\/\\?%*:|"<>]/g, '_');
    a.download = `${safeTitle}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('.mdファイルをダウンロードしました');
}
