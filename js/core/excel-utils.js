/**
 * 엑셀 유틸리티 함수
 */

export function getNowDateForFileName() {
  const d = new Date();
  const pad = n => n < 10 ? '0' + n : '' + n;
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
    + '_' + pad(d.getHours()) + '.' + pad(d.getMinutes()) + '.' + pad(d.getSeconds());
}

export function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; ++i) {
    view[i] = s.charCodeAt(i) & 0xFF;
  }
  return buf;
}

export function makeJob2WorkBook(invoiceJson, sheetName, fileType, origin) {
  if (!invoiceJson || invoiceJson.length <= 0) return null;

  const wb = XLSX.utils.book_new();
  const opts = origin ? { origin } : undefined;
  const ws = XLSX.utils.json_to_sheet(invoiceJson, opts);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  if (fileType === 'xls') {
    return XLSX.write(wb, { bookType: 'biff8', bookSST: true, type: 'binary' });
  }
  return XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
}

export function readSheetFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary' });
        const firstSheetName = wb.SheetNames[0];
        resolve(wb.Sheets[firstSheetName]);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

export function checkPhoneNumber(str) {
  if (!str) return false;
  const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{4,6}$/im;
  return regex.test(String(str));
}
