/**
 * 발송처 정보 폼 핸들러
 * - URL 파라미터 / localStorage로부터 폼 초기화
 * - 저장/삭제 기능
 * - 저장 버튼 텍스트 동적 변경
 */
import { sellerInfo } from '../core/seller-info.js';

class FormHandler {
  init() {
    this._nameInput = document.getElementById('senderName');
    this._phoneInput = document.getElementById('storeTelephone');
    this._addrInput = document.getElementById('storeAddress');
    this._msgInput = document.getElementById('defaultMessage');
    this._saveBtn = document.getElementById('btnSave');
    this._saveBtnText = document.getElementById('btnSaveText');
    this._clearBtn = document.getElementById('btnClear');

    this._nameError = document.getElementById('senderNameError');
    this._phoneError = document.getElementById('storeTelephoneError');
    this._addrError = document.getElementById('storeAddressError');

    this._isLoaded = !!localStorage.getItem('westore_seller_info');

    this._fillForm();
    this._bindEvents();
    this._validate();
    this._updateSaveBtn();
  }

  _fillForm() {
    this._nameInput.value = sellerInfo.senderName;
    this._phoneInput.value = sellerInfo.phone;
    this._addrInput.value = sellerInfo.addr;
    this._msgInput.value = sellerInfo.defaultMessage;
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
    this._msgInput.addEventListener('input', () => {
      sellerInfo.defaultMessage = this._msgInput.value;
    });
    this._saveBtn.addEventListener('click', () => {
      sellerInfo.save();
      this._isLoaded = true;
      this._updateSaveBtn();
      alert('발송처 정보가 저장되었습니다.');
    });

    this._clearBtn.addEventListener('click', () => {
      sellerInfo.clear();
      this._fillForm();
      this._validate();
      this._isLoaded = false;
      this._updateSaveBtn();
      // URL 파라미터에 발송처 정보가 있으면 제거
      const url = new URL(window.location);
      ['name', 'phone', 'addr', 'msg'].forEach(p => url.searchParams.delete(p));
      window.history.replaceState({}, '', url);
      alert('발송처 정보가 삭제되었습니다.');
    });
  }

  _validate() {
    this._toggleValid(this._nameInput, this._nameError, !!this._nameInput.value);
    this._toggleValid(this._phoneInput, this._phoneError, !!this._phoneInput.value);
    this._toggleValid(this._addrInput, this._addrError, !!this._addrInput.value);
  }

  _toggleValid(el, errorEl, isValid) {
    el.classList.toggle('is-valid', isValid);
    el.classList.toggle('is-invalid', !isValid);
    errorEl.classList.toggle('d-none', isValid);
  }

  _updateSaveBtn() {
    this._saveBtnText.textContent = this._isLoaded ? '브라우저에 수정' : '브라우저에 저장';
  }
}

export const formHandler = new FormHandler();
