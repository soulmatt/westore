# WeStore - Claude Code 프로젝트 가이드

## 프로젝트 개요

WeStore는 다중 마켓플레이스(스마트스토어, 쿠팡, 지마켓 등 9곳) 발주서를 통합하여 택배 업로드 파일을 생성하고, 택배사로부터 받은 송장 파일을 각 마켓플레이스 발송처리 파일로 변환하는 브라우저 기반 도구입니다.

서버 없이 클라이언트(브라우저)에서만 동작합니다. 데이터는 외부로 전송되지 않습니다.

## 기술 스택

- **프론트엔드**: Vanilla JS (ES6 모듈), Bootstrap 5, Dropzone.js
- **엑셀 처리**: SheetJS (XLSX), JSZip, FileSaver.js
- **빌드 도구**: 없음 (CDN + ES6 모듈 직접 로드)
- **배포**: GitHub Pages (정적 호스팅)

## 디렉토리 구조

```
westore/
├── index.html              # 단일 페이지 앱
├── css/app.css             # 커스텀 스타일
├── js/
│   ├── app.js              # 엔트리포인트 (모듈 초기화)
│   ├── core/
│   │   ├── vendor-config.js      # 택배 벤더 설정 (CJ대한통운/롯데택배)
│   │   ├── seller-info.js        # 발송처 정보 관리
│   │   ├── marketplace-registry.js # 마켓플레이스 레지스트리 싱글턴
│   │   └── excel-utils.js        # 엑셀 유틸리티 함수
│   ├── marketplaces/
│   │   ├── base-marketplace.js   # 베이스 클래스 (공통 로직)
│   │   ├── index.js              # 전체 마켓플레이스 import (자동 등록)
│   │   ├── smartstore.js         # 스마트스토어
│   │   ├── coupang.js            # 쿠팡
│   │   ├── gmarket.js            # 지마켓/옥션
│   │   ├── st11.js               # 11번가
│   │   ├── kakao.js              # 카카오톡스토어
│   │   ├── lotteon.js            # 롯데on
│   │   ├── ssg.js                # SSG.COM
│   │   ├── interpark.js          # 인터파크
│   │   └── wemakeprice.js        # 위메프
│   └── ui/
│       ├── download-handler.js   # 다운로드 버튼 처리
│       ├── dropzone-handler.js   # 파일 드롭존 처리
│       ├── form-handler.js       # 발송처 정보 폼
│       └── status-display.js     # 처리 상태 배지 표시
└── 참고/                          # 레거시 참고 코드 (.gitignore)
```

## 핵심 아키텍처 패턴

### 마켓플레이스 추가

`BaseMarketplace`를 상속하여 새 클래스를 만들고, `marketplaces/index.js`에 import 1줄 추가:

1. `js/marketplaces/새마켓.js` 파일 생성
2. `BaseMarketplace` 상속, `detect()` + `_buildInvoiceEntry()` 구현
3. `registry.register(new 새마켓())` 호출
4. `js/marketplaces/index.js`에 `import './새마켓.js'` 추가

### 택배 벤더 전환

`js/core/vendor-config.js`의 `CURRENT_VENDOR_ID` 값 변경:
- `1`: CJ대한통운
- `2`: 롯데택배 (현재 사용중)

### 송장 매칭 구조

`BaseMarketplace.matchInvoices()` → `_buildInvoiceMap()`으로 O(n) Map 생성 → 서브클래스의 `_buildInvoiceEntry()`에서 마켓플레이스별 출력 형식 생성.

### Job1/Job2 파일 흐름

- **Job1** (택배 업로드 파일): 발주서 업로드 → `convertToInvoiceFormat()` → `json_to_sheet`로 출력
- **Job2** (마켓 발송처리 파일): 송장 파일 업로드 → `matchInvoices()` → 마켓플레이스별 파일 출력

## 코딩 컨벤션

- ES6 모듈 (`import/export`) 사용, CommonJS 사용 금지
- 클래스 기반 설계, 싱글턴은 `export const instance = new Class()`
- 빌드 도구 없음 — CDN 라이브러리는 `index.html`에서 `<script>`로 로드
- 한국어 주석 사용

## 버전 관리

- 버전 형식: `vYYYY-MM-DD.N` (예: `v2026-02-23.1`)
- 버전 위치: `index.html` 하단 푸터
- **push 전에 반드시 버전을 올려야 함**

### 버전 업 + push 절차

1. `index.html` 푸터의 버전 문자열 업데이트 (오늘 날짜 + 순번)
2. `git commit -m "chore: 버전 vYYYY-MM-DD.N"`
3. `git push`

## 주의사항

- `convertToInvoiceFormat()`의 키 이름이 곧 택배 업로드 파일의 열 이름 (코드에서 직접 관리)
- 스마트스토어의 `columns.orderNumber`는 `'상품주문번호'` (다른 마켓은 `'주문번호'`)
- `vendor-config.js`의 `invoiceColumns`는 택배사 송장 파일의 실제 열 이름과 일치해야 함
- 데이터는 서버로 전송되지 않음 (브라우저 전용)
