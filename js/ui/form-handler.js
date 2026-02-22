/**
 * 발송처 정보 폼 핸들러
 * - URL 파라미터 / localStorage로부터 폼 초기화
 * - 저장/삭제 기능
 */
import { sellerInfo } from '../core/seller-info.js';

class FormHandler {
  init() {
    this._nameInput = document.getElementById('senderName');
    this._phoneInput = document.getElementById('storeTelephone');
    this._addrInput = document.getElementById('storeAddress');
    this._saveBtn = document.getElementById('btnSave');
    this._clearBtn = document.getElementById('btnClear');

    this._fillForm();
    this._bindEvents();
    this._validate();
  }

  _fillForm() {
    this._nameInput.value = sellerInfo.senderName;
    this._phoneInput.value = sellerInfo.phone;
    this._addrInput.value = sellerInfo.addr;
  }

  _bindEvents() {
    this._nameInput.addEventListener('input', () => {
      sellerInfo.senderName = this._nameInput.value;
      this._validate();
    });
    this._phoneInput.addEventListener('input', () => {
      sellerInfo.phone = this._phoneInput.value;
      this._validate();
    });
    this._addrInput.addEventListener('input', () => {
      sellerInfo.addr = this._addrInput.value;
      this._validate();
    });
    this._saveBtn.addEventListener('click', () => {
      sellerInfo.save();
      alert('발송처 정보가 저장되었습니다.');
    });

    this._clearBtn.addEventListener('click', () => {
      sellerInfo.clear();
      this._fillForm();
      this._validate();
      alert('발송처 정보가 삭제되었습니다.');
    });
  }

  _validate() {
    this._toggleValid(this._nameInput, !!this._nameInput.value);
    this._toggleValid(this._phoneInput, !!this._phoneInput.value);
    this._toggleValid(this._addrInput, !!this._addrInput.value);
  }

  _toggleValid(el, isValid) {
    el.classList.toggle('is-valid', isValid);
    el.classList.toggle('is-invalid', !isValid);
  }
}

export const formHandler = new FormHandler();
