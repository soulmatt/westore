# WeStore 기술 명세

## 아키텍처

```
index.html
  └── js/app.js (엔트리포인트)
        ├── js/marketplaces/index.js (마켓플레이스 자동 등록)
        │     ├── smartstore.js → registry.register()
        │     ├── coupang.js    → registry.register()
        │     ├── gmarket.js    → registry.register()
        │     ├── st11.js       → registry.register()
        │     ├── kakao.js      → registry.register()
        │     ├── lotteon.js    → registry.register()
        │     ├── ssg.js        → registry.register()
        │     ├── interpark.js  → registry.register()
        │     └── wemakeprice.js→ registry.register()
        ├── js/ui/status-display.js
        ├── js/ui/form-handler.js
        ├── js/ui/dropzone-handler.js
        └── js/ui/download-handler.js
```

## 데이터 흐름

### Job1: 발주서 → 택배 업로드 파일

```
[발주서 엑셀] → Dropzone addedfile
  → readSheetFromFile()
  → registry.detect(sheet)            // 처음 3행 헤더로 마켓플레이스 자동 판별
  → marketplace.parseOrders(sheet)     // XLSX.utils.sheet_to_json
  → statusDisplay.showOrderStatus()

[1번 파일 다운로드 클릭]
  → registry.convertAllToInvoiceFormat(sellerInfo)
  → XLSX.utils.json_to_sheet()          // convertToInvoiceFormat 키 순서대로 출력
  → XLSX.writeFile()                   // .xlsx 다운로드
```

### Job2: 송장 파일 → 마켓플레이스 발송처리 파일

```
[송장 엑셀] → Dropzone addedfile
  → readSheetFromFile()
  → XLSX.utils.sheet_to_json()
  → registry.matchAllInvoices(allInvoiceJson, sellerInfo)
    → marketplace._buildInvoiceMap()   // Map(주문번호 → 운송장번호) O(n)
    → marketplace._buildInvoiceEntry() // 마켓플레이스별 출력 형식

[2번 파일 다운로드 클릭]
  → registry.getJob2Files(sellerInfo)
  → 1개: 단독 다운로드 / 여러개: ZIP 다운로드
```

## 핵심 클래스

### BaseMarketplace

모든 마켓플레이스의 부모 클래스. 공통 로직을 담당합니다.

| 메서드 | 역할 |
|--------|------|
| `detect(headerRows)` | 엑셀 처음 3행(2차원 배열)으로 마켓플레이스 판별 (서브클래스 구현) |
| `parseOrders(sheet)` | 발주서 시트를 JSON 배열로 파싱 |
| `convertToInvoiceFormat(sellerInfo)` | 택배 업로드 양식으로 변환 (키 이름 = 엑셀 열 이름) |
| `_buildInvoiceMap(allInvoiceJson, sellerInfo)` | 송장 데이터를 Map(주문번호→운송장번호)으로 변환 |
| `matchInvoices(allInvoiceJson, sellerInfo)` | 주문-송장 매칭 실행 |
| `_buildInvoiceEntry(order, trackingNumber, sellerInfo)` | 마켓플레이스별 출력 형식 (서브클래스 구현) |

### MarketplaceRegistry

싱글턴. 모든 마켓플레이스 인스턴스를 관리합니다.

| 메서드 | 역할 |
|--------|------|
| `register(marketplace)` | 마켓플레이스 등록 |
| `detect(sheet)` | 시트 헤더로 마켓플레이스 자동 판별 |
| `convertAllToInvoiceFormat(sellerInfo)` | 전체 마켓플레이스 Job1 변환 |
| `matchAllInvoices(allInvoiceJson, sellerInfo)` | 전체 마켓플레이스 Job2 매칭 |
| `getJob2Files(sellerInfo)` | 다운로드할 Job2 파일 목록 반환 |

### SellerInfo

발송처 정보 관리. 우선순위: URL 파라미터 > localStorage > 빈 값.

## 택배 벤더 설정

`vendor-config.js`에서 택배사별 설정을 관리합니다.

```js
const CURRENT_VENDOR_ID = 2;

// 각 벤더의 invoiceColumns가 송장 파일 매칭에 사용됨
// CJ대한통운: { orderNumber: '고객주문번호', trackingNumber: '운송장번호' }
// 롯데택배:   { orderNumber: '주문번호',     trackingNumber: '운송장번호' }
```

`invoiceColumns`는 택배사에서 내려주는 송장 엑셀 파일의 실제 열 이름입니다. `_buildInvoiceMap()`에서 이 설정을 읽어 주문번호↔운송장번호 매핑을 생성합니다.

## 스마트스토어 특수 처리

스마트스토어만 `columns.orderNumber = '상품주문번호'`를 사용합니다 (다른 마켓은 `'주문번호'`).

- Job1: `상품주문번호` 값이 택배 업로드 파일의 `주문번호` 열에 들어감
- 택배사: 해당 값을 자사 송장 파일의 `주문번호` 열로 반환
- Job2: `order['상품주문번호']` vs `inv['주문번호']` → 같은 값이므로 매칭 성공

## 마켓플레이스 감지 로직

`detect(headerRows)`는 시트 처음 3행을 2차원 배열로 받아 판별합니다. `headerRows[N][M]`은 Row N, Col M입니다.

| 마켓플레이스 | 감지 조건 | parseRowOffset |
|-------------|-----------|:--------------:|
| 스마트스토어 | `headerRows[0][0].includes('엑셀 일괄발송')` | 1 |
| 쿠팡 | `headerRows[0][0] === '묶음배송번호'` or `headerRows[0][1] === '묶음배송번호'` | 0 |
| 지마켓/옥션 | `headerRows[0][0] === '아이디'` | 0 |
| 11번가 | `headerRows.some(row => row[0].includes('발송준비중내역'))` | 2 |
| 카카오 | `headerRows[0][0] === '배송지/수신자정보 입력일'` | 0 |
| 롯데on | `headerRows[0][0] === '상품준비일시'` | 0 |
| SSG | `headerRows[0][0] === '순번' && headerRows[0][1] === '출고유형'` | 0 |
| 인터파크 | `headerRows[0][0] === '주문/발송관리'` | 5 |
| 위메프 | `headerRows[0][0] === '배송번호' && headerRows[0][1] === '주문번호'` | 0 |

## Job2 출력 형식 (마켓플레이스별)

| 마켓플레이스 | 시트명 | 파일형식 | 주요 출력 컬럼 |
|-------------|--------|---------|---------------|
| 스마트스토어 | 발송처리 | xls | 상품주문번호, 배송방법, 택배사, 송장번호 |
| 쿠팡 | 배송관리 | xlsx | 원본 전체 + 택배사, 운송장번호 |
| 지마켓 | Sheet1 | xls | 계정, 상품명, 택배사, 주문번호, 수령자, 전화번호, 휴대폰, 운송장/등기번호 |
| 11번가 | sk11st 발송처리 sheet | xls | 번호, 주문일시, 주문번호, 택배사코드, 송장/등기번호 등 (origin: 1) |
| 카카오 | Sheet0 | xlsx | 원본 전체 + 배송방법, 택배사코드, 송장번호 |
| 롯데on | sheet1 | xlsx | 원본 전체 + 배송사, 송장번호 |
| SSG | sheet1 | xls | no, 배송번호, 배송유형상세, 택배사, 송장번호(하이픈 제거), 중량정보 |
| 인터파크 | sheet1 | xlsx | 주문번호, 주문순번, 수령자, 상품명, 옵션명, 결제일, 택배사코드, 수량, 송장번호 (origin: 6) |
| 위메프 | orderList | xlsx | 원본 전체 + 송장번호, 택배사 |

## CDN 의존성

| 라이브러리 | 용도 |
|-----------|------|
| Bootstrap 5.3.3 | UI 프레임워크 |
| Bootstrap Icons 1.11.3 | 아이콘 |
| SheetJS (XLSX) 0.18.5 | 엑셀 읽기/쓰기 |
| Dropzone 5 | 파일 드래그앤드롭 |
| JSZip 3.10.1 | ZIP 생성 (다중 파일 다운로드) |
| FileSaver.js 2.0.5 | 파일 다운로드 |

## 저장소

- **localStorage key `westore_seller_info`**: 발송처 정보 (이름, 전화번호, 주소, 배송메세지, vendorId)
