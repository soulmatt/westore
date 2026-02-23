/**
 * WeStore 엔트리 포인트
 * - 모든 마켓플레이스 자동 등록
 * - UI 모듈 초기화
 */
import './marketplaces/index.js';
import { statusDisplay } from './ui/status-display.js';
import { formHandler } from './ui/form-handler.js';
import { dropzoneHandler } from './ui/dropzone-handler.js';
import { downloadHandler } from './ui/download-handler.js';

document.addEventListener('DOMContentLoaded', () => {
  statusDisplay.init();
  formHandler.init();
  dropzoneHandler.init();
  downloadHandler.init();

  // 모달 닫힐 때 내부 포커스 해제 → aria-hidden 접근성 경고 방지
  document.addEventListener('hide.bs.modal', (e) => {
    const focused = e.target.querySelector(':focus');
    if (focused) focused.blur();
  });
});
