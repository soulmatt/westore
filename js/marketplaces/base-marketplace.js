/**
 * 마켓플레이스 베이스 클래스
 * 공통 로직: 발주서 파싱, 택배 양식 변환, 송장 매칭
 * 서브클래스에서 구현: detect(), _buildInvoiceEntry()
 */
export class BaseMarketplace {
  constructor(config) {
    this.id = config.id;
    this.platformName = config.platformName;
    this.invoiceFileName = config.invoiceFileName;
    this.parseRowOffset = config.parseRowOffset || 0;
    this.useDefval = config.useDefval !== false;
    this.columns = config.columns;

    // Job2 출력 설정
    this.job2SheetName = config.job2SheetName || 'Sheet1';
    this.job2FileType = config.job2FileType || 'xlsx';
    this.job2Origin = config.job2Origin || undefined;

    this.orders = [];
    this.invoices = [];
  }

  /** 엑셀 헤더로 판매처 판별 - 서브클래스에서 구현 */
  detect(headerRows) {
    return false;
  }

  /** 발주서 파싱 (같은 마켓플레이스의 여러 발주서를 누적) */
  parseOrders(sheet) {
    const options = {};
    if (this.useDefval) options.defval = '';
    if (this.parseRowOffset > 0) options.range = this.parseRowOffset;
    const newOrders = XLSX.utils.sheet_to_json(sheet, options);
    this.orders.push(...newOrders);
    return this.orders;
  }

  /** 택배 업로드 양식으로 변환 — 키 이름이 엑셀 열 이름으로 출력됨 */
  convertToInvoiceFormat(sellerInfo) {
    const result = [];
    const cols = this.columns;

    this.orders.forEach(order => {
      result.push({
        "받는분성명": order[cols.recipientName],
        "받는분우편번호": order[cols.zipCode],
        "받는분주소(전체, 분할)": order[cols.address],
        "받는분전화번호1": this.getPhone1(order),
        "받는분전화번호2": this.getPhone2(order),
        "상품명(옵션명)": this.getProductName(order),
        "수량": order[cols.quantity],
        "사용안함": '',
        "주문번호": order[cols.orderNumber],
        "배송메세지1": this.getDeliveryMessage(order, sellerInfo),
        "운임구분": '신용',
        "기본운임": '',
        "보내는분성명": sellerInfo.senderName,
        "보내는분전화번호1": sellerInfo.phone,
        "보내는분전화번호2": '',
        "보내는분주소(전체,분할)": sellerInfo.addr,
      });
    });

    return result;
  }

  /** 송장 데이터를 Map으로 변환 (주문번호 → 운송장번호) */
  _buildInvoiceMap(allInvoiceJson, sellerInfo) {
    const { orderNumber: orderCol, trackingNumber: trackingCol } = sellerInfo.vendor.invoiceColumns;
    const map = new Map();
    allInvoiceJson.forEach(inv => {
      const key = String(inv[orderCol] || '').replace(/ /g, '');
      if (key) map.set(key, String(inv[trackingCol] || ''));
    });
    return map;
  }

  /** 기본 matchInvoices — 서브클래스는 _buildInvoiceEntry만 구현 */
  matchInvoices(allInvoiceJson, sellerInfo) {
    const invoiceMap = this._buildInvoiceMap(allInvoiceJson, sellerInfo);
    this.invoices = [];
    this.orders.forEach(order => {
      const orderNum = String(order[this.columns.orderNumber] || '').replace(/ /g, '');
      const trackingNumber = invoiceMap.get(orderNum) || '';
      this.invoices.push(this._buildInvoiceEntry(order, trackingNumber, sellerInfo));
    });
  }

  /** 서브클래스에서 구현: 마켓플레이스별 출력 형식 */
  _buildInvoiceEntry(order, trackingNumber, sellerInfo) {
    return {};
  }

  clearOrders() {
    this.orders = [];
    this.invoices = [];
  }

  // ---- 헬퍼 메서드 (서브클래스에서 필요 시 오버라이드) ----

  getPhone1(order) {
    return order[this.columns.phone1] || '';
  }

  getPhone2(order) {
    return order[this.columns.phone2] || '';
  }

  getProductName(order) {
    const cols = this.columns;
    let name = order[cols.productName] || '';
    if (cols.option && order[cols.option]) {
      name += ' - ' + order[cols.option];
    }
    return name;
  }

  getDeliveryMessage(order, sellerInfo) {
    return order[this.columns.deliveryMessage] || (sellerInfo && sellerInfo.defaultMessage) || '';
  }

}
