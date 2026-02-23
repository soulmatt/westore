/**
 * 택배 양식 컬럼 순서 에디터
 * - Type1 기본 16개 컬럼 + 14개 빈 열 = 총 30행 (A~AD)
 * - 3컬럼: 열 문자 | 내용 (클릭 시 수정) | 위/아래 화살표
 * - download-handler에서 getColumnOrder()로 순서 조회
 */

const DEFAULT_COLUMNS = [
  '받는분성명',
  '받는분우편번호',
  '받는분주소(전체, 분할)',
  '받는분전화번호1',
  '받는분전화번호2',
  '상품명(옵션명)',
  '수량',
  '사용안함',
  '주문번호',
  '배송메세지1',
  '운임구분',
  '기본운임',
  '보내는분성명',
  '보내는분전화번호1',
  '보내는분전화번호2',
  '보내는분주소(전체,분할)',
];

const TOTAL_ROWS = 30;
const STORAGE_KEY = 'westore_column_order';

function colLetter(index) {
  if (index < 26) return String.fromCharCode(65 + index);
  return 'A' + String.fromCharCode(65 + index - 26);
}

class ColumnEditor {
  constructor() {
    this._columns = this._loadOrBuildColumns();
    this._editingIndex = -1;
    this._listEl = null;
  }

  init() {
    this._listEl = document.getElementById('columnEditorList');

    const modalEl = document.getElementById('columnEditorModal');
    if (modalEl) {
      modalEl.addEventListener('shown.bs.modal', () => {
        this._render();
      });
    }

    const resetBtn = document.getElementById('columnEditorResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetToDefault());
    }
  }

  _loadOrBuildColumns() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === TOTAL_ROWS) {
          return parsed;
        }
      }
    } catch (_) { /* 무시 */ }
    return this._buildInitialColumns();
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._columns));
    } catch (_) { /* 무시 */ }
  }

  resetToDefault() {
    this._columns = this._buildInitialColumns();
    this._editingIndex = -1;
    localStorage.removeItem(STORAGE_KEY);
    this._render();
  }

  _buildInitialColumns() {
    return Array.from({ length: TOTAL_ROWS }, (_, i) =>
      i < DEFAULT_COLUMNS.length ? DEFAULT_COLUMNS[i] : ''
    );
  }

  getColumnOrder() {
    if (this._columns.length === 0) {
      this._columns = this._buildInitialColumns();
    }
    return [...this._columns];
  }

  _render() {
    if (!this._listEl) {
      this._listEl = document.getElementById('columnEditorList');
    }
    if (!this._listEl) return;

    this._listEl.innerHTML = '';
    this._columns.forEach((name, i) => {
      const row = document.createElement('div');
      row.className = 'column-editor-row';

      // 1열: 열 문자
      const letter = document.createElement('span');
      letter.className = 'column-editor-col-letter';
      letter.textContent = colLetter(i);

      // 2열: 내용
      const nameCell = document.createElement('span');
      nameCell.className = 'column-editor-col-name';

      if (i === this._editingIndex) {
        nameCell.classList.add('editing');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control form-control-sm column-editor-input';
        input.value = name;
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this._commitEdit(i, input.value);
          } else if (e.key === 'Escape') {
            this._editingIndex = -1;
            this._render();
          }
        });
        input.addEventListener('blur', () => {
          if (this._editingIndex !== i) return;
          this._commitEdit(i, input.value);
        });

        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'btn btn-outline-danger btn-sm column-editor-clear-btn';
        clearBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
        clearBtn.addEventListener('mousedown', (e) => {
          e.preventDefault(); // blur 방지
          this._commitEdit(i, '');
        });

        nameCell.appendChild(input);
        nameCell.appendChild(clearBtn);

        // 렌더 후 input에 포커스
        requestAnimationFrame(() => {
          input.focus();
          input.select();
        });
      } else {
        if (name) {
          nameCell.textContent = name;
        } else {
          nameCell.classList.add('empty');
          nameCell.textContent = '(빈 열)';
        }
        nameCell.addEventListener('click', (e) => {
          e.stopPropagation();
          this._editingIndex = i;
          this._render();
        });
      }

      // 3열: 화살표
      const actions = document.createElement('span');
      actions.className = 'column-editor-actions';

      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'btn btn-outline-secondary btn-sm';
      upBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
      upBtn.disabled = i === 0;
      upBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._move(i, -1);
      });

      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'btn btn-outline-secondary btn-sm';
      downBtn.innerHTML = '<i class="bi bi-arrow-down"></i>';
      downBtn.disabled = i === TOTAL_ROWS - 1;
      downBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._move(i, 1);
      });

      actions.appendChild(upBtn);
      actions.appendChild(downBtn);

      row.appendChild(letter);
      row.appendChild(nameCell);
      row.appendChild(actions);
      this._listEl.appendChild(row);
    });
  }

  _commitEdit(index, value) {
    this._columns[index] = value;
    this._editingIndex = -1;
    this._save();
    this._render();
  }

  _move(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= TOTAL_ROWS) return;

    [this._columns[index], this._columns[newIndex]] =
      [this._columns[newIndex], this._columns[index]];

    if (this._editingIndex === index) {
      this._editingIndex = newIndex;
    }
    this._save();
    this._render();
  }
}

export const columnEditor = new ColumnEditor();
