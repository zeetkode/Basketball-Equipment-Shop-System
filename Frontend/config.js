/**
 * config.js - Centralized Configuration & Shared Helper Functions
 * Basketball Equipment Shop System
 */

// Centralized API Base URL for backend server endpoints
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Universal error handler for UI feedback.
 * @param {string} elementId - The ID of the DOM element to show the status.
 * @param {string} message - Message text.
 * @param {boolean} isError - True if error style, false if success.
 */
function setStatusMessage(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = isError ? 'message error' : 'message success';
}

/**
 * Performance-optimized DOM Renderer.
 * Builds an HTML string in memory and performs a single innerHTML assignment to prevent layout thrashing.
 * @param {string} containerId - Target element ID (e.g., tbody or ul ID).
 * @param {Array} items - Data items array.
 * @param {Function} rowTemplateFn - Function taking (item, index) and returning an HTML string.
 * @param {string} emptyMessage - Text to display if array is empty.
 */
function renderListOptimized(containerId, items, rowTemplateFn, emptyMessage = 'No data available.') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `<tr><td colspan="10" style="text-align:center; color: var(--text-muted);">${emptyMessage}</td></tr>`;
    return;
  }

  let htmlBuffer = '';
  items.forEach((item, index) => {
    htmlBuffer += rowTemplateFn(item, index);
  });

  container.innerHTML = htmlBuffer;
}
