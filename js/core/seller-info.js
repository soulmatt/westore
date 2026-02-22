/**
 * 발송처 정보 관리
 * 우선순위: URL 파라미터 > localStorage > 빈 값
 */
import { getVendorById } from './vendor-config.js';

const STORAGE_KEY = 'westore_seller_info';

class SellerInfo {
  constructor() {
    this.senderName = '';
    this.phone = '';
    this.addr = '';
    this.defaultMessage = '';
    this.vendorId = 1;
    this.vendor = getVendorById(1);
    this._load();
  }

  _load() {
    const params = new URLSearchParams(window.location.search);
    const paramName = params.get('name');
    const paramPhone = params.get('phone');
    const paramAddr = params.get('addr');

    if (paramName || paramPhone || paramAddr) {
      this.senderName = paramName || '';
      this.phone = paramPhone || '';
      this.addr = paramAddr || '';
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.senderName = data.senderName || '';
        this.phone = data.phone || '';
        this.addr = data.addr || '';
        this.defaultMessage = data.defaultMessage || '';
        this.vendorId = 1;
        this.vendor = getVendorById(1);
      } catch {
        // ignore
      }
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      senderName: this.senderName,
      phone: this.phone,
      addr: this.addr,
      defaultMessage: this.defaultMessage,
      vendorId: this.vendorId,
    }));
  }

  clear() {
    localStorage.removeItem(STORAGE_KEY);
    this.senderName = '';
    this.phone = '';
    this.addr = '';
    this.defaultMessage = '';
    this.vendorId = 1;
    this.vendor = getVendorById(1);
  }

  setVendorId(id) {
    this.vendorId = id;
    this.vendor = getVendorById(id);
  }

  isValid() {
    return !!(this.senderName && this.phone && this.addr);
  }
}

export const sellerInfo = new SellerInfo();
