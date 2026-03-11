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
    const orderPreviewTemplate = `
      <div class="dz-preview dz-file-preview">
        <span class="dz-badge"></span>
        <div class="dz-details"><div class="dz-filename"><span data-dz-name></span></div></div>
        <a class="dz-remove" href="javascript:undefined;" data-dz-remove>✕</a>
      </div>`;
    this.orderDropzone = new Dropzone(el, {
      url: './',
      autoProcessQueue: false,
      maxFiles: 20,
      uploadMultiple: true,
      acceptedFiles: '.xlsx,.xls',
      previewTemplate: orderPreviewTemplate,
      init: function () {
        this.on('addedfile', (file) => {
          readSheetFromFile(file).then(sheet => {
            handleOrderExcel(sheet, file);
          }).catch(() => {
            handleOrderExcelError(file);
          });
        });

        this.on('removedfile', function () {
          registry.clearAllOrders();
          const files = [...this.files];
          (async () => {
            for (const f of files) {
              try {
                const sheet = await readSheetFromFile(f);
                handleOrderExcel(sheet, f);
              } catch {
                handleOrderExcelError(f);
              }
            }
          })();
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

function handleOrderExcelError(file) {
  const badgeEl = file.previewElement && file.previewElement.querySelector('.dz-badge');
  if (badgeEl) {
    badgeEl.textContent = '읽기 실패';
    badgeEl.className = 'dz-badge badge bg-danger';
  }
}

function handleOrderExcel(sheet, file) {
  const badgeEl = file.previewElement && file.previewElement.querySelector('.dz-badge');
  const marketplace = registry.detect(sheet);
  if (marketplace) {
    const newOrders = marketplace.parseOrders(sheet, file.name);
    if (badgeEl) {
      badgeEl.textContent = `${marketplace.platformName}(${newOrders.length}건)`;
      badgeEl.className = 'dz-badge badge bg-success';
    }
  } else {
    if (badgeEl) {
      badgeEl.textContent = '미지원';
      badgeEl.className = 'dz-badge badge bg-danger';
    }
    alert('미지원 발주서가 존재합니다.\n해당 파일은 무시됩니다.');
  }
}

function handleInvoiceExcel(sheet) {
  statusDisplay.clearInvoiceStatus();
  const allInvoiceJson = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
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
