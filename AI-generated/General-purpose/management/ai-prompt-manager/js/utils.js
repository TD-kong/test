/**
 * Utility helper functions
 */

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeQuotes(str) {
    if (!str) return '';
    return str
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, '\\n');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').innerText = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 2500);
}
