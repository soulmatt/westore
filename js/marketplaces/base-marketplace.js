/**
 * 마켓플레이스 베이스 클래스
 * 공통 로직: 발주서 파싱, CJ택배 양식 변환 (Type1/Type2)
 * 서브클래스에서 구현: detect(), matchInvoices()
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
  detect(headers) {
    return false;
  }

  /** 발주서 파싱 */
  parseOrders(sheet) {
    this.orders = [];
    const options = {};
    if (this.useDefval) options.defval = '';
    if (this.parseRowOffset > 0) options.range = this.parseRowOffset;
    this.orders = XLSX.utils.sheet_to_json(sheet, options);
    return this.orders;
  }

  /** CJ택배 양식으로 변환 */
  convertToInvoiceFormat(sellerInfo) {
    const result = [];
    const cols = this.columns;

    this.orders.forEach(order => {
      const productName = this.getProductName(order);
      const msg = this.getDeliveryMessage(order, sellerInfo);

      if (sellerInfo.vendor.id === 1) {
        result.push({
          "받는분성명": order[cols.recipientName],
          "받는분우편번호": order[cols.zipCode],
          "받는분주소(전체,분할)": order[cols.address],
          "받는분전화번호1": this.getPhone1(order),
          "받는분전화번호2": this.getPhone2(order),
          "품목명": productName,
          "수량": order[cols.quantity],
          "고객별자동합계총량": '',
          "고객주문번호": this.getCustomerOrderNumber(order, sellerInfo),
          "배송메세지": msg,
          "신용": '신용',
          "기본운임": '',
          "업체명": sellerInfo.senderName,
          "보내는분전화번호1": sellerInfo.phone,
          "보내는분전화번호2": '',
          "대리점명 업체명": sellerInfo.addr,
        });
      }

      if (sellerInfo.vendor.id === 2) {
        result.push({
          "보내는사람(지정)": sellerInfo.senderName,
          "주소(지정)": sellerInfo.addr,
          "전화번호1(지정)": sellerInfo.phone,
          "받는사람": order[cols.recipientName],
          "전화번호1": this.getPhone1(order),
          "주문자전화2": this.getPhone2Type2(order),
          "우편번호": order[cols.zipCode],
          "주소": order[cols.address],
          "상품명1": this.getProductNameType2(order),
          "상품상세1": '',
          "내품수량1": order[cols.quantity],
          "운임구분": '',
          "운임": '',
          "배송메시지": msg,
          "고객주문번호": this.getCustomerOrderNumberType2(order, sellerInfo),
        });
      }
    });

    return result;
  }

  /** 송장 매칭 - 서브클래스에서 구현 */
  matchInvoices(allInvoiceJson, sellerInfo) {
    this.invoices = [];
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

  getPhone2Type2(order) {
    const col = this.columns.phone2Type2;
    if (col) return order[col] || '';
    return this.getPhone2(order);
  }

  getProductName(order) {
    const cols = this.columns;
    let name = order[cols.productName] || '';
    if (cols.option && order[cols.option]) {
      name += ' - ' + order[cols.option];
    }
    return name;
  }

  getProductNameType2(order) {
    return this.getProductName(order);
  }

  getDeliveryMessage(order, sellerInfo) {
    return order[this.columns.deliveryMessage] || (sellerInfo && sellerInfo.defaultMessage) || '';
  }

  getCustomerOrderNumber(order, sellerInfo) {
    return this.platformName + '/' + order[this.columns.orderNumber];
  }

  getCustomerOrderNumberType2(order, sellerInfo) {
    return this.getCustomerOrderNumber(order, sellerInfo);
  }

  // ---- 공통 송장 매칭 헬퍼 ----

  _filterInvoicesByPlatform(allInvoiceJson, platformNames) {
    const names = Array.isArray(platformNames) ? platformNames : [platformNames];
    return allInvoiceJson.filter(inv => {
      if (!inv["고객주문번호"]) return false;
      return names.some(n => inv["고객주문번호"].includes(n));
    });
  }

  _matchByNameAndAddress(allInvoiceJson, sellerInfo, buildInvoiceEntry) {
    this.invoices = [];
    const filtered = this._filterInvoicesByPlatform(allInvoiceJson, this.platformName);

    if (sellerInfo.vendor.id === 1) {
      this.orders.forEach(order => {
        filtered.forEach(invoice => {
          const nameMatch = (invoice["받는분"] || '').replace(/ /g, '') ===
            (order[this.columns.recipientName] || '').replace(/ /g, '');
          const addrMatch = (invoice["받는분주소"] || '').replace(/ /g, '') ===
            (order[this.columns.address] || '').replace(/ /g, '');
          if (nameMatch && addrMatch) {
            this.invoices.push(buildInvoiceEntry(order, invoice, sellerInfo));
          }
        });
      });
    }

    if (sellerInfo.vendor.id === 2) {
      this._matchType2(filtered, sellerInfo, buildInvoiceEntry);
    }
  }

  _matchType2(filtered, sellerInfo, buildInvoiceEntry) {
    this.orders.forEach(order => {
      this.invoices.push(buildInvoiceEntry(order, null, sellerInfo));
    });
    filtered.forEach(invoice => {
      const orderNumber = (invoice["고객주문번호"] || '').split('/')[1];
      if (!orderNumber) return;
      this.invoices.forEach(inv => {
        if (this._matchType2OrderNumber(inv, orderNumber)) {
          this._fillType2Invoice(inv, invoice, sellerInfo);
        }
      });
    });
  }

  _matchType2OrderNumber(invoiceEntry, orderNumber) {
    return false; // 서브클래스에서 구현
  }

  _fillType2Invoice(invoiceEntry, invoice, sellerInfo) {
    // 서브클래스에서 구현
  }
}
