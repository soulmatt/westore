/**
 * Dropzone 핸들러
 * - 발주서 드롭존 (노란색)
 * - 송장 드롭존 (파란색)
 */
import { registry } from '../core/marketplace-registry.js';
import { sellerInfo } from '../core/seller-info.js';
import { readSheetFromFile } from '../core/excel-utils.js';
import { statusDisplay } from './status-display.js';

// 모듈 최상위에서 설정해야 DOMContentLoaded 전에 auto-discover를 차단
Dropzone.autoDiscover = false;

class DropzoneHandler {
  constructor() {
    this.orderDropzone = null;
    this.invoiceDropzone = null;
  }

  init() {
    this._initOrderDropzone();
    this._initInvoiceDropzone();
  }

  getOrderFileCount() {
    return this.orderDropzone ? this.orderDropzone.files.length : 0;
  }

  _initOrderDropzone() {
    const el = document.getElementById('orderDropZone');
    this.orderDropzone = new Dropzone(el, {
      url: './',
      autoProcessQueue: false,
      maxFiles: 20,
      uploadMultiple: true,
      acceptedFiles: '.xlsx,.xls',
      addRemoveLinks: true,
      init: function () {
        this.on('addedfile', (file) => {
          readSheetFromFile(file).then(sheet => {
            handleOrderExcel(sheet);
          });
        });

        this.on('removedfile', function () {
          registry.clearAllOrders();
          statusDisplay.clearOrderStatus();
          const files = this.files;
          files.forEach(f => {
            readSheetFromFile(f).then(sheet => {
              handleOrderExcel(sheet);
            });
          });
        });

        this.on('dragover', () => el.style.opacity = '0.7');
        this.on('drop', () => el.style.opacity = '');
        this.on('dragleave', () => el.style.opacity = '');
      }
    });
  }

  _initInvoiceDropzone() {
    const el = document.getElementById('invoiceDropZone');
    this.invoiceDropzone = new Dropzone(el, {
      url: './',
      autoProcessQueue: false,
      maxFiles: 1,
      uploadMultiple: false,
      acceptedFiles: '.xlsx,.xls',
      addRemoveLinks: true,
      init: function () {
        this.on('addedfile', (file) => {
          readSheetFromFile(file).then(sheet => {
            handleInvoiceExcel(sheet);
          });
        });

        this.on('dragover', () => el.style.opacity = '0.7');
        this.on('drop', () => el.style.opacity = '');
        this.on('dragleave', () => el.style.opacity = '');
      }
    });
  }
}

function handleOrderExcel(sheet) {
  const marketplace = registry.detect(sheet);
  if (marketplace) {
    marketplace.parseOrders(sheet);
    statusDisplay.showOrderStatus(marketplace.platformName, marketplace.orders.length);
  } else {
    statusDisplay.showOrderError('미지원 발주서');
    alert('미지원 발주서가 존재합니다.\n해당 파일은 무시됩니다.');
  }
}

function handleInvoiceExcel(sheet) {
  statusDisplay.clearInvoiceStatus();
  const allInvoiceJson = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  registry.matchAllInvoices(allInvoiceJson, sellerInfo);

  const files = registry.getJob2Files(sellerInfo);
  files.forEach(f => {
    statusDisplay.showInvoiceStatus(f.marketplace.platformName + ' (' + f.data.length + '건)');
  });

  if (files.length === 0) {
    statusDisplay.showInvoiceStatus('매칭된 송장 없음');
  }
}

export const dropzoneHandler = new DropzoneHandler();
