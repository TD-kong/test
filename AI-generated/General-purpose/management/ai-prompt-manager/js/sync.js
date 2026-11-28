/**
 * Google Apps Script (GAS) Two-Way Cloud Sync Module
 */

const GAS_CONFIG_KEY = 'ai_prompts_gas_config';
const BASE_UPDATED_AT_KEY = 'ai_prompts_base_updated_at';

let pendingConflictData = null;

function getGasConfig() {
    try {
        return JSON.parse(localStorage.getItem(GAS_CONFIG_KEY)) || { url: '', token: 'my_prompt_token_2026' };
    } catch {
        return { url: '', token: 'my_prompt_token_2026' };
    }
}

function getBaseUpdatedAt() {
    return localStorage.getItem(BASE_UPDATED_AT_KEY) || '';
}

function setBaseUpdatedAt(ts) {
    if (ts) {
        localStorage.setItem(BASE_UPDATED_AT_KEY, ts);
    } else {
        localStorage.removeItem(BASE_UPDATED_AT_KEY);
    }
}

function updateSyncStatusUI(state, text) {
    const dot = document.getElementById('syncStatusDot');
    const label = document.getElementById('syncStatusText');
    const icon = document.getElementById('syncIcon');
    if (!dot || !label) return;

    label.innerText = text;
    dot.className = 'w-2 h-2 rounded-full';

    if (icon) {
        if (state === 'syncing') {
            icon.classList.add('fa-spin');
        } else {
            icon.classList.remove('fa-spin');
        }
    }

    switch (state) {
        case 'synced':
            dot.classList.add('bg-emerald-400');
            break;
        case 'syncing':
            dot.classList.add('bg-amber-300', 'animate-pulse');
            break;
        case 'error':
            dot.classList.add('bg-red-400');
            break;
        case 'conflict':
            dot.classList.add('bg-amber-400');
            break;
        default:
            dot.classList.add('bg-gray-400');
            break;
    }
}

/**
 * Pull latest prompts from GAS (doGet)
 */
async function pullFromCloud(silent = false) {
    const config = getGasConfig();
    if (!config.url) {
        updateSyncStatusUI('unconfigured', 'ローカルのみ');
        return false;
    }

    updateSyncStatusUI('syncing', '同期中...');
    try {
        const url = new URL(config.url);
        if (config.token) {
            url.searchParams.set('token', config.token);
        }

        const res = await fetch(url.toString(), {
            method: 'GET',
            redirect: 'follow'
        });
        const data = await res.json();

        if (!data.ok) {
            updateSyncStatusUI('error', '認証/取得エラー');
            if (!silent) showToast(`同期エラー: ${data.error || '取得に失敗しました'}`);
            return false;
        }

        // サーバーにまだデータが空で、ローカルにデータがある場合は初回アップロードを促す
        if ((!data.prompts || data.prompts.length === 0) && !data.updatedAt && prompts.length > 0) {
            await pushToCloud(true);
            return true;
        }

        prompts = Array.isArray(data.prompts) ? data.prompts : [];
        saveToStorage();
        setBaseUpdatedAt(data.updatedAt || '');

        renderCategories();
        renderPrompts();
        updateSyncStatusUI('synced', '同期済み');
        if (!silent) showToast('クラウドから最新データを取得しました');
        return true;
    } catch (err) {
        console.error('GAS Pull Error:', err);
        updateSyncStatusUI('error', '通信エラー');
        if (!silent) showToast('クラウドとの通信に失敗しました');
        return false;
    }
}

/**
 * Push local prompts to GAS (doPost)
 * Note: Uses text/plain to avoid CORS preflight (OPTIONS) issues with GAS Web Apps
 */
async function pushToCloud(force = false) {
    const config = getGasConfig();
    if (!config.url) {
        updateSyncStatusUI('unconfigured', 'ローカルのみ');
        return false;
    }

    updateSyncStatusUI('syncing', '保存同期中...');
    try {
        const payload = {
            token: config.token,
            baseUpdatedAt: getBaseUpdatedAt(),
            force: force,
            prompts: prompts
        };

        const res = await fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });

        const data = await res.json();

        if (data.conflict) {
            updateSyncStatusUI('conflict', '競合発生');
            pendingConflictData = data;
            openConflictModal(data);
            return false;
        }

        if (!data.ok) {
            updateSyncStatusUI('error', '同期エラー');
            showToast(`保存同期エラー: ${data.error || '不明なエラー'}`);
            return false;
        }

        setBaseUpdatedAt(data.updatedAt);
        updateSyncStatusUI('synced', '同期済み');
        return true;
    } catch (err) {
        console.error('GAS Push Error:', err);
        updateSyncStatusUI('error', '通信エラー');
        showToast('クラウドへの保存同期に失敗しました（ローカルには保存済み）');
        return false;
    }
}

async function manualSyncFromCloud() {
    const config = getGasConfig();
    if (!config.url) {
        openSyncSettingsModal();
        return;
    }
    await pullFromCloud(false);
}

// Conflict Modal Handlers
function openConflictModal(conflictData) {
    const serverTime = conflictData.serverUpdatedAt
        ? new Date(conflictData.serverUpdatedAt).toLocaleString()
        : '不明';
    document.getElementById('conflictServerTime').innerText = serverTime;
    document.getElementById('conflictServerCount').innerText = (conflictData.serverPrompts || []).length;
    document.getElementById('conflictLocalCount').innerText = prompts.length;
    document.getElementById('conflictModal').classList.remove('hidden');
}

function closeConflictModal() {
    document.getElementById('conflictModal').classList.add('hidden');
}

function resolveConflictUseServer() {
    if (!pendingConflictData) return;
    prompts = pendingConflictData.serverPrompts || [];
    saveToStorage();
    setBaseUpdatedAt(pendingConflictData.serverUpdatedAt || '');
    pendingConflictData = null;

    closeConflictModal();
    renderCategories();
    renderPrompts();
    updateSyncStatusUI('synced', '同期済み');
    showToast('クラウドの最新データを反映しました');
}

async function resolveConflictForcePush() {
    pendingConflictData = null;
    closeConflictModal();
    const ok = await pushToCloud(true);
    if (ok) {
        showToast('この端末の内容でクラウドを上書きしました');
    }
}

// Sync Settings Modal Handlers
function openSyncSettingsModal() {
    const config = getGasConfig();
    document.getElementById('gasUrlInput').value = config.url || '';
    document.getElementById('gasTokenInput').value = config.token || 'my_prompt_token_2026';
    const lastSync = getBaseUpdatedAt();
    document.getElementById('lastSyncTimeDisplay').innerText = lastSync
        ? new Date(lastSync).toLocaleString()
        : '未同期';
    document.getElementById('syncSettingsModal').classList.remove('hidden');
}

function closeSyncSettingsModal() {
    document.getElementById('syncSettingsModal').classList.add('hidden');
}

async function saveSyncSettings(e) {
    e.preventDefault();
    const url = document.getElementById('gasUrlInput').value.trim();
    const token = document.getElementById('gasTokenInput').value.trim();
    localStorage.setItem(GAS_CONFIG_KEY, JSON.stringify({ url, token }));
    closeSyncSettingsModal();
    await pullFromCloud(false);
}

function clearSyncSettings() {
    if (confirm('クラウド同期設定を解除しますか？（ローカルのデータは保持されます）')) {
        localStorage.removeItem(GAS_CONFIG_KEY);
        setBaseUpdatedAt('');
        closeSyncSettingsModal();
        updateSyncStatusUI('unconfigured', 'ローカルのみ');
        showToast('クラウド同期設定を解除しました');
    }
}
