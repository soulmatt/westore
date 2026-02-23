/**
 * 마켓플레이스 레지스트리 싱글턴
 * - 각 마켓플레이스 모듈이 import 시 자동 등록
 * - detect(sheet)로 자동 판별
 */
class MarketplaceRegistry {
  constructor() {
    this._marketplaces = new Map();
  }

  register(marketplace) {
    this._marketplaces.set(marketplace.id, marketplace);
  }

  get(id) {
    return this._marketplaces.get(id);
  }

  getAll() {
    return Array.from(this._marketplaces.values());
  }

  detect(sheet) {
    const headers = this._getFirstRowHeaders(sheet);
    for (const mp of this._marketplaces.values()) {
      if (mp.detect(headers)) {
        return mp;
      }
    }
    return null;
  }

  clearAllOrders() {
    for (const mp of this._marketplaces.values()) {
      mp.clearOrders();
    }
  }

  convertAllToInvoiceFormat(sellerInfo) {
    const result = [];
    for (const mp of this._marketplaces.values()) {
      result.push(...mp.convertToInvoiceFormat(sellerInfo));
    }
    return result;
  }

  matchAllInvoices(allInvoiceJson, sellerInfo) {
    for (const mp of this._marketplaces.values()) {
      mp.matchInvoices(allInvoiceJson, sellerInfo);
    }
  }

  getJob2Files(sellerInfo) {
    const files = [];
    for (const mp of this._marketplaces.values()) {
      if (mp.invoices.length > 0) {
        files.push({
          marketplace: mp,
          data: mp.invoices,
          fileName: mp.invoiceFileName + this._getNowDate() + '.' + mp.job2FileType,
          sheetName: mp.job2SheetName,
          fileType: mp.job2FileType,
          origin: mp.job2Origin,
        });
      }
    }
    return files;
  }

  _getFirstRowHeaders(sheet) {
    const headers = [];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = sheet[XLSX.utils.encode_cell({ c: C, r: 0 })];
      headers.push(cell && cell.t ? XLSX.utils.format_cell(cell) : '');
    }
    return headers;
  }

  _getNowDate() {
    const d = new Date();
    const pad = n => n < 10 ? '0' + n : '' + n;
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
      + '_' + pad(d.getHours()) + '.' + pad(d.getMinutes()) + '.' + pad(d.getSeconds());
  }
}

export const registry = new MarketplaceRegistry();
