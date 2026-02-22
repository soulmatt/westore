/**
 * 다운로드 핸들러
 * - Job1: 발주서 → CJ택배 양식 다운로드
 * - Job2: 송장 → 각 마켓플레이스 발송처리 파일 다운로드
 */
import { registry } from '../core/marketplace-registry.js';
import { sellerInfo } from '../core/seller-info.js';
import { getNowDateForFileName, s2ab, makeJob2WorkBook } from '../core/excel-utils.js';
import { dropzoneHandler } from './dropzone-handler.js';
import { columnEditor } from './column-editor.js';

class DownloadHandler {
  init() {
    document.getElementById('downloadJob1Excel').addEventListener('click', () => {
      this.downloadJob1();
    });
    document.getElementById('downloadJob2Excel').addEventListener('click', () => {
      this.downloadJob2();
    });
  }

  downloadJob1() {
    if (dropzoneHandler.getOrderFileCount() <= 0) {
      alert('발주 파일을 업로드해 주세요!');
      return;
    }
    if (!sellerInfo.isValid()) {
      alert('발송처 정보(이름, 전화번호, 주소)를 모두 입력해 주세요!');
      return;
    }

    const invoiceFormat = registry.convertAllToInvoiceFormat(sellerInfo);
    if (invoiceFormat.length === 0) {
      alert('변환할 주문 데이터가 없습니다.');
      return;
    }

    const vendor = sellerInfo.vendor;
    const fileName = vendor.fileName + '_' + getNowDateForFileName() + '.xlsx';
    const wb = XLSX.utils.book_new();

    const columnOrder = columnEditor.getColumnOrder();
    const header = columnOrder;
    const aoa = [header];
    invoiceFormat.forEach(row => {
      aoa.push(columnOrder.map(colName =>
        colName === '' ? '' : (row[colName] !== undefined ? row[colName] : '')
      ));
    });
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, vendor.sheetName);
    XLSX.writeFile(wb, fileName, { bookType: 'xlsx' });
  }

  downloadJob2() {
    const files = registry.getJob2Files(sellerInfo);
    if (files.length === 0) {
      alert('매칭된 송장 데이터가 없습니다.\n발주서와 송장 파일을 먼저 업로드해 주세요.');
      return;
    }

    const orderFileCount = dropzoneHandler.getOrderFileCount();

    // 원본 동작: 발주 파일이 1개면 단독 다운로드, 여러 개면 ZIP
    if (orderFileCount === 1 && files.length === 1) {
      const f = files[0];
      const wbout = makeJob2WorkBook(f.data, f.sheetName, f.fileType, f.origin);
      if (wbout) {
        saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), f.fileName);
      }
      return;
    }

    const zip = new JSZip();
    files.forEach(f => {
      const wbout = makeJob2WorkBook(f.data, f.sheetName, f.fileType, f.origin);
      if (wbout) {
        zip.file(f.fileName, wbout, { binary: true });
      }
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      saveAs(content, '송장_' + getNowDateForFileName() + '.zip');
    });
  }
}

export const downloadHandler = new DownloadHandler();
