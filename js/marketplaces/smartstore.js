import { BaseMarketplace } from './base-marketplace.js';
import { registry } from '../core/marketplace-registry.js';

class SmartStore extends BaseMarketplace {
  constructor() {
    super({
      id: 'smartstore',
      platformName: '스마트스토어',
      invoiceFileName: '송장_스마트스토어_',
      parseRowOffset: 1,
      useDefval: false,
      columns: {
        recipientName: '수취인명',
        zipCode: '우편번호',
        address: '통합배송지',
        phone1: '수취인연락처1',
        phone2: '수취인연락처2',
        productName: '상품명',
        option: '옵션정보',
        quantity: '수량',
        deliveryMessage: '배송메세지',
        orderNumber: '상품주문번호',
      },
      job2SheetName: '발송처리',
      job2FileType: 'xls',
    });
  }

  detect(headers) {
    return headers[0] && headers[0].includes('엑셀 일괄발송');
  }

  // Type2에서는 상품명에 옵션 미포함
  getProductNameType2(order) {
    return order[this.columns.productName] || '';
  }

  // Type2에서는 주문번호 컬럼이 다름
  getCustomerOrderNumberType2(order) {
    return this.platformName + '/' + order["주문번호"];
  }

  matchInvoices(allInvoiceJson, sellerInfo) {
    this.invoices = [];
    const filtered = this._filterInvoicesByPlatform(allInvoiceJson, this.platformName);

    if (sellerInfo.vendor.id === 1) {
      this.orders.forEach(order => {
        filtered.forEach(invoice => {
          // 원본: order["수취인명"]과 order["배송지"]로 매칭
          const nameMatch = (invoice["받는분"] || '').replace(/ /g, '') ===
            (order["수취인명"] || '').replace(/ /g, '');
          const addrMatch = (invoice["받는분주소"] || '').replace(/ /g, '') ===
            (order["배송지"] || '').replace(/ /g, '');
          if (nameMatch && addrMatch) {
            this.invoices.push({
              "상품주문번호": order["상품주문번호"],
              "배송방법": "택배,등기,소포",
              "택배사": sellerInfo.vendor.smartStore.viewName,
              "송장번호": invoice["운송장번호"],
            });
          }
        });
      });
    }

    if (sellerInfo.vendor.id === 2) {
      // Type2: 모든 주문을 먼저 엔트리로 생성
      this.orders.forEach(order => {
        this.invoices.push({
          "상품주문번호": order["상품주문번호"],
          "배송방법": "택배,등기,소포",
          "택배사": sellerInfo.vendor.smartStore.viewName,
          "송장번호": '',
        });
      });
      // 고객주문번호에서 주문번호를 추출하여 매칭 (원본: order["주문번호"]로 비교)
      filtered.forEach(invoice => {
        const orderNumber = (invoice["고객주문번호"] || '').split('/')[1];
        if (!orderNumber) return;
        this.orders.forEach((order, idx) => {
          if (orderNumber.replace(/ /g, '') == order["주문번호"]) {
            this.invoices[idx]["송장번호"] = invoice["운송장번호"];
          }
        });
      });
    }
  }
}

registry.register(new SmartStore());
