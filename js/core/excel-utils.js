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
    reader.onload = async (e) => {
      const data = e.target.result;

      // 1) 비밀번호 없이 SheetJS로 직접 시도
      try {
        const wb = XLSX.read(data, { type: 'array' });
        return resolve(wb.Sheets[wb.SheetNames[0]]);
      } catch (plainErr) {
        // 파싱 실패 → 암호화 파일일 수 있으므로 복호화 시도
      }

      // 2) xlsx-populate로 '1111' 비밀번호 시도 (스마트스토어 기본 비번)
      try {
        const sheet = await decryptAndParse(data, '1111');
        return resolve(sheet);
      } catch (err) {
        // 비밀번호 틀림 → 사용자 입력으로 넘어감
      }

      // 3) 사용자에게 비밀번호 입력 요청 (최대 3회)
      for (let attempt = 1; attempt <= 3; attempt++) {
        const userPw = prompt(
          `"${file.name}" 파일이 비밀번호로 보호되어 있습니다.\n비밀번호를 입력해주세요:`
        );
        if (!userPw) return reject(new Error('비밀번호 입력 취소'));

        try {
          const sheet = await decryptAndParse(data, userPw);
          return resolve(sheet);
        } catch (err) {
          if (attempt === 3) return reject(new Error('비밀번호 3회 실패'));
        }
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/** xlsx-populate로 복호화 → SheetJS 파싱 */
async function decryptAndParse(data, password) {
  const wb = await XlsxPopulate.fromDataAsync(new Uint8Array(data), { password });
  const decryptedData = await wb.outputAsync({ type: 'arraybuffer' });
  const sheetjsWb = XLSX.read(decryptedData, { type: 'array' });
  return sheetjsWb.Sheets[sheetjsWb.SheetNames[0]];
}

export function checkPhoneNumber(str) {
  if (!str) return false;
  const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{4,6}$/im;
  return regex.test(String(str));
}
