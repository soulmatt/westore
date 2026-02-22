/**
 * 처리 상태 표시 관리
 */
class StatusDisplay {
  constructor() {
    this._orderStatus = null;
    this._invoiceStatus = null;
  }

  init() {
    this._orderStatus = document.getElementById('orderStatus');
    this._invoiceStatus = document.getElementById('invoiceStatus');
  }

  showOrderStatus(marketplaceName) {
    this._appendBadge(this._orderStatus, marketplaceName, 'bg-success');
  }

  showOrderError(message) {
    this._appendBadge(this._orderStatus, message, 'bg-danger');
  }

  clearOrderStatus() {
    if (this._orderStatus) this._orderStatus.innerHTML = '';
  }

  showInvoiceStatus(message) {
    this._appendBadge(this._invoiceStatus, message, 'bg-primary');
  }

  clearInvoiceStatus() {
    if (this._invoiceStatus) this._invoiceStatus.innerHTML = '';
  }

  _appendBadge(container, text, badgeClass) {
    if (!container) return;
    const badge = document.createElement('span');
    badge.className = `badge ${badgeClass} me-1 mb-1`;
    badge.textContent = text;
    container.appendChild(badge);
  }
}

export const statusDisplay = new StatusDisplay();
