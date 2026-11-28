/**
 * UI Rendering & Modal Controls
 */

const VIEW_MODE_KEY = 'ai_prompts_view_mode';
let currentViewMode = localStorage.getItem(VIEW_MODE_KEY) || 'grid';
let currentFilterCategory = 'all';
let filterFavoriteOnly = false;
let activeDetailPrompt = null;

function setViewMode(mode) {
    currentViewMode = mode === 'list' ? 'list' : 'grid';
    localStorage.setItem(VIEW_MODE_KEY, currentViewMode);
    updateViewModeButtons();
    renderPrompts();
}

function updateViewModeButtons() {
    const gridBtn = document.getElementById('viewGridBtn');
    const listBtn = document.getElementById('viewListBtn');
    if (!gridBtn || !listBtn) return;

    if (currentViewMode === 'list') {
        listBtn.className = 'px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 bg-white text-indigo-600 shadow-sm';
        gridBtn.className = 'px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 text-gray-600 hover:text-gray-800';
    } else {
        gridBtn.className = 'px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 bg-white text-indigo-600 shadow-sm';
        listBtn.className = 'px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 text-gray-600 hover:text-gray-800';
    }
}

function toggleFavoriteFilter() {
    filterFavoriteOnly = !filterFavoriteOnly;
    updateFavoriteFilterButton();
    renderPrompts();
}

function updateFavoriteFilterButton() {
    const btn = document.getElementById('favoriteFilterBtn');
    const icon = document.getElementById('favoriteFilterIcon');
    if (!btn || !icon) return;

    if (filterFavoriteOnly) {
        btn.className = 'px-3 py-1.5 rounded-lg text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 bg-amber-100 text-amber-800 border border-amber-300 shadow-sm';
        icon.className = 'fa-solid fa-star text-amber-500';
    } else {
        btn.className = 'px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent';
        icon.className = 'fa-regular fa-star text-amber-500';
    }
}

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

function renderGridCard(p) {
    const isPinned = Boolean(p.pinned);
    const isFav = Boolean(p.favorite);
    const cardBorder = isPinned
        ? 'border-indigo-300 ring-1 ring-indigo-100'
        : 'border-gray-200';

    return `
        <div class="bg-white rounded-xl shadow-sm border ${cardBorder} hover:shadow-md transition flex flex-col justify-between overflow-hidden">
            <div class="p-5">
                <div class="flex justify-between items-start gap-2 mb-2">
                    <div class="flex items-center gap-1.5 flex-wrap">
                        ${isPinned ? `<span class="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded font-medium flex items-center gap-1" title="ピン留め中"><i class="fa-solid fa-thumbtack text-[10px]"></i> ピン</span>` : ''}
                        <span class="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">${escapeHtml(p.category || '未分類')}</span>
                    </div>
                    <div class="flex items-center gap-0.5 shrink-0">
                        <button onclick="togglePin('${p.id}')" class="p-1.5 rounded hover:bg-gray-100 transition ${isPinned ? 'text-indigo-600' : 'text-gray-300 hover:text-indigo-500'}" title="${isPinned ? 'ピン留め解除' : 'ピン留め'}">
                            <i class="fa-solid fa-thumbtack"></i>
                        </button>
                        <button onclick="toggleFavorite('${p.id}')" class="p-1.5 rounded hover:bg-gray-100 transition ${isFav ? 'text-amber-400' : 'text-gray-300 hover:text-amber-400'}" title="${isFav ? 'お気に入り解除' : 'お気に入りに追加'}">
                            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star"></i>
                        </button>
                        <button onclick="openEditModal('${p.id}')" class="text-gray-400 hover:text-indigo-600 p-1.5 rounded hover:bg-gray-100 transition" title="編集">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="deletePrompt('${p.id}')" class="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-gray-100 transition" title="削除">
                            <i class="fa-solid fa-trash"></i>
                        </button>
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
    `;
}

function renderListRow(p) {
    const isPinned = Boolean(p.pinned);
    const isFav = Boolean(p.favorite);
    const updatedText = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '';
    const rowBorder = isPinned
        ? 'border-indigo-300 ring-1 ring-indigo-100 bg-indigo-50/20'
        : 'border-gray-200 bg-white';

    return `
        <div class="${rowBorder} rounded-xl shadow-sm border hover:shadow-md transition p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="min-w-0 flex-grow space-y-1.5">
                <div class="flex flex-wrap items-center gap-2">
                    ${isPinned ? `<span class="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded font-medium flex items-center gap-1 shrink-0" title="ピン留め中"><i class="fa-solid fa-thumbtack text-[10px]"></i> ピン</span>` : ''}
                    <span class="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-medium shrink-0">${escapeHtml(p.category || '未分類')}</span>
                    <h3 onclick="openDetailModal('${p.id}')" class="font-bold text-base text-gray-800 cursor-pointer hover:text-indigo-600 transition truncate">${escapeHtml(p.title)}</h3>
                    ${updatedText ? `<span class="text-xs text-gray-400 shrink-0">${escapeHtml(updatedText)}</span>` : ''}
                </div>
                <p class="text-gray-500 text-sm line-clamp-1">${escapeHtml(p.description || '説明なし')}</p>
                ${(p.tags && p.tags.length > 0) ? `
                    <div class="flex flex-wrap gap-1 pt-0.5">
                        ${p.tags.map(t => `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">#${escapeHtml(t.trim())}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="flex items-center justify-end gap-1.5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                <button onclick="togglePin('${p.id}')" class="p-2 rounded-lg hover:bg-gray-100 transition ${isPinned ? 'text-indigo-600' : 'text-gray-300 hover:text-indigo-500'}" title="${isPinned ? 'ピン留め解除' : 'ピン留め'}">
                    <i class="fa-solid fa-thumbtack"></i>
                </button>
                <button onclick="toggleFavorite('${p.id}')" class="p-2 rounded-lg hover:bg-gray-100 transition ${isFav ? 'text-amber-400' : 'text-gray-300 hover:text-amber-400'}" title="${isFav ? 'お気に入り解除' : 'お気に入りに追加'}">
                    <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star"></i>
                </button>
                <button onclick="openEditModal('${p.id}')" class="text-gray-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-100 transition" title="編集">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="deletePrompt('${p.id}')" class="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100 transition" title="削除">
                    <i class="fa-solid fa-trash"></i>
                </button>
                <button onclick="downloadSingleMd('${p.id}')" class="text-xs bg-white border hover:bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-lg font-medium transition" title=".mdダウンロード">
                    <i class="fa-solid fa-file-arrow-down"></i>
                </button>
                <button onclick="openDetailModal('${p.id}')" class="text-xs bg-white border hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition">
                    詳細
                </button>
                <button onclick="copyContent('${escapeQuotes(p.content)}')" class="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1">
                    <i class="fa-regular fa-copy"></i> コピー
                </button>
            </div>
        </div>
    `;
}

function renderPrompts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const grid = document.getElementById('promptGrid');
    const emptyState = document.getElementById('emptyState');
    const countLabel = document.getElementById('promptCountLabel');

    updateViewModeButtons();
    updateFavoriteFilterButton();

    if (currentViewMode === 'list') {
        grid.className = 'flex flex-col gap-3';
    } else {
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }

    const filtered = prompts
        .filter(p => {
            const matchesCategory = currentFilterCategory === 'all' || p.category === currentFilterCategory;
            const matchesFavorite = !filterFavoriteOnly || Boolean(p.favorite);
            const matchesSearch = p.title.toLowerCase().includes(search) || 
                                  (p.description && p.description.toLowerCase().includes(search)) ||
                                  (p.tags && p.tags.some(t => t.toLowerCase().includes(search))) ||
                                  p.content.toLowerCase().includes(search);
            return matchesCategory && matchesFavorite && matchesSearch;
        })
        .sort((a, b) => {
            const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
            if (pinDiff !== 0) return pinDiff;
            return 0;
        });

    if (countLabel) {
        countLabel.innerText = `${filtered.length} 件のプロンプト`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    grid.innerHTML = filtered.map(p => currentViewMode === 'list' ? renderListRow(p) : renderGridCard(p)).join('');
}

// Add/Edit Modal Controls
function openModal() {
    document.getElementById('promptId').value = '';
    document.getElementById('promptForm').reset();
    document.getElementById('formPinned').checked = false;
    document.getElementById('formFavorite').checked = false;
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
    document.getElementById('formPinned').checked = Boolean(p.pinned);
    document.getElementById('formFavorite').checked = Boolean(p.favorite);
    document.getElementById('formDescription').value = p.description || '';
    document.getElementById('formContent').value = p.content;
    document.getElementById('modalTitle').innerText = 'プロンプト編集';
    document.getElementById('promptModal').classList.remove('hidden');
}

// Detail Modal Controls
function refreshDetailModalState() {
    if (!activeDetailPrompt) return;
    const latest = prompts.find(item => item.id === activeDetailPrompt.id);
    if (!latest) return;
    activeDetailPrompt = latest;

    const pinBtn = document.getElementById('detailPinBtn');
    const favBtn = document.getElementById('detailFavBtn');
    if (pinBtn) {
        pinBtn.className = latest.pinned
            ? 'px-2.5 py-1.5 rounded-lg text-sm border border-indigo-300 bg-indigo-50 text-indigo-600 transition'
            : 'px-2.5 py-1.5 rounded-lg text-sm border text-gray-400 hover:bg-gray-100 transition';
    }
    if (favBtn) {
        favBtn.className = latest.favorite
            ? 'px-2.5 py-1.5 rounded-lg text-sm border border-amber-300 bg-amber-50 text-amber-500 transition'
            : 'px-2.5 py-1.5 rounded-lg text-sm border text-gray-400 hover:bg-gray-100 transition';
        favBtn.innerHTML = `<i class="${latest.favorite ? 'fa-solid' : 'fa-regular'} fa-star"></i>`;
    }
}

function openDetailModal(id) {
    const p = prompts.find(item => item.id === id);
    if (!p) return;
    activeDetailPrompt = p;
    document.getElementById('detailModalTitle').innerText = p.title;
    document.getElementById('detailCategory').innerText = p.category || '未分類';
    document.getElementById('detailDate').innerText = `更新日: ${new Date(p.updatedAt).toLocaleString()}`;
    document.getElementById('detailDescription').innerText = p.description || '';
    document.getElementById('detailTags').innerHTML = (p.tags || []).map(t => `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">#${escapeHtml(t.trim())}</span>`).join('');
    
    document.getElementById('detailPreview').innerHTML = marked.parse(p.content);
    document.getElementById('detailRaw').innerText = p.content;
    
    refreshDetailModalState();
    switchTab('preview');
    document.getElementById('detailModal').classList.remove('hidden');
}

function closeDetailModal() {
    activeDetailPrompt = null;
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
