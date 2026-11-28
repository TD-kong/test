/**
 * UI Rendering & Modal Controls
 */

let currentFilterCategory = 'all';
let activeDetailPrompt = null;

function renderCategories() {
    const container = document.getElementById('categoryFilters');
    const categories = ['all', ...new Set(prompts.map(p => p.category).filter(Boolean))];
    
    container.innerHTML = categories.map(cat => `
        <button onclick="filterCategory('${escapeHtml(cat)}')" class="category-btn px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${currentFilterCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">
            ${cat === 'all' ? 'すべて' : escapeHtml(cat)}
        </button>
    `).join('');
}

function filterCategory(cat) {
    currentFilterCategory = cat;
    renderCategories();
    renderPrompts();
}

function renderPrompts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const grid = document.getElementById('promptGrid');
    const emptyState = document.getElementById('emptyState');

    const filtered = prompts.filter(p => {
        const matchesCategory = currentFilterCategory === 'all' || p.category === currentFilterCategory;
        const matchesSearch = p.title.toLowerCase().includes(search) || 
                              (p.description && p.description.toLowerCase().includes(search)) ||
                              (p.tags && p.tags.some(t => t.toLowerCase().includes(search))) ||
                              p.content.toLowerCase().includes(search);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    grid.innerHTML = filtered.map(p => `
        <div class="bg-white rounded-xl shadow-sm border hover:shadow-md transition flex flex-col justify-between overflow-hidden">
            <div class="p-5">
                <div class="flex justify-between items-start gap-2 mb-2">
                    <span class="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">${escapeHtml(p.category || '未分類')}</span>
                    <div class="flex gap-1">
                        <button onclick="openEditModal('${p.id}')" class="text-gray-400 hover:text-indigo-600 p-1" title="編集"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button onclick="deletePrompt('${p.id}')" class="text-gray-400 hover:text-red-600 p-1" title="削除"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <h3 onclick="openDetailModal('${p.id}')" class="font-bold text-lg text-gray-800 cursor-pointer hover:text-indigo-600 transition mb-1">${escapeHtml(p.title)}</h3>
                <p class="text-gray-500 text-sm mb-3 line-clamp-2">${escapeHtml(p.description || '説明なし')}</p>
                <div class="flex flex-wrap gap-1 mb-4">
                    ${(p.tags || []).map(t => `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">#${escapeHtml(t.trim())}</span>`).join('')}
                </div>
            </div>
            <div class="bg-gray-50 px-5 py-3 border-t flex justify-between items-center">
                <div class="flex gap-1">
                    <button onclick="downloadSingleMd('${p.id}')" class="text-xs bg-white border hover:bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded font-medium transition" title=".mdダウンロード"><i class="fa-solid fa-file-arrow-down"></i></button>
                    <button onclick="openDetailModal('${p.id}')" class="text-xs bg-white border hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded font-medium transition">詳細</button>
                </div>
                <button onclick="copyContent('${escapeQuotes(p.content)}')" class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded font-medium transition flex items-center gap-1">
                    <i class="fa-regular fa-copy"></i> コピー
                </button>
            </div>
        </div>
    `).join('');
}

// Add/Edit Modal Controls
function openModal() {
    document.getElementById('promptId').value = '';
    document.getElementById('promptForm').reset();
    document.getElementById('modalTitle').innerText = '新規プロンプト作成';
    document.getElementById('promptModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('promptModal').classList.add('hidden');
}

function openEditModal(id) {
    const p = prompts.find(item => item.id === id);
    if (!p) return;
    document.getElementById('promptId').value = p.id;
    document.getElementById('formTitle').value = p.title;
    document.getElementById('formCategory').value = p.category || '';
    document.getElementById('formTags').value = (p.tags || []).join(', ');
    document.getElementById('formDescription').value = p.description || '';
    document.getElementById('formContent').value = p.content;
    document.getElementById('modalTitle').innerText = 'プロンプト編集';
    document.getElementById('promptModal').classList.remove('hidden');
}

// Detail Modal Controls
function openDetailModal(id) {
    const p = prompts.find(item => item.id === id);
    if (!p) return;
    activeDetailPrompt = p;
    document.getElementById('detailModalTitle').innerText = p.title;
    document.getElementById('detailCategory').innerText = p.category || '未分類';
    document.getElementById('detailDate').innerText = `更新日: ${new Date(p.updatedAt).toLocaleString()}`;
    document.getElementById('detailDescription').innerText = p.description || '';
    document.getElementById('detailTags').innerHTML = (p.tags || []).map(t => `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">#${escapeHtml(t.trim())}</span>`).join('');
    
    // Render Markdown using marked.js
    document.getElementById('detailPreview').innerHTML = marked.parse(p.content);
    document.getElementById('detailRaw').innerText = p.content;
    
    switchTab('preview');
    document.getElementById('detailModal').classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

function switchTab(mode) {
    const previewEl = document.getElementById('detailPreview');
    const rawEl = document.getElementById('detailRaw');
    const previewBtn = document.getElementById('tabPreviewBtn');
    const rawBtn = document.getElementById('tabRawBtn');

    if (mode === 'preview') {
        previewEl.classList.remove('hidden');
        rawEl.classList.add('hidden');
        previewBtn.className = "px-4 py-2 text-sm font-semibold border-b-2 border-indigo-600 text-indigo-600";
        rawBtn.className = "px-4 py-2 text-sm font-semibold text-gray-500 border-b-2 border-transparent";
    } else {
        previewEl.classList.add('hidden');
        rawEl.classList.remove('hidden');
        previewBtn.className = "px-4 py-2 text-sm font-semibold text-gray-500 border-b-2 border-transparent";
        rawBtn.className = "px-4 py-2 text-sm font-semibold border-b-2 border-indigo-600 text-indigo-600";
    }
}
