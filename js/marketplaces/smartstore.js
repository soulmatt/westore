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
    return order["주문번호"];
  }

  matchInvoices(allInvoiceJson, sellerInfo) {
    this.invoices = [];

    if (sellerInfo.vendor.id === 1) {
      this.orders.forEach(order => {
        const orderNum = String(order["상품주문번호"] || '').replace(/ /g, '');
        allInvoiceJson.forEach(invoice => {
          const invoiceNum = String(invoice["고객주문번호"] || '').replace(/ /g, '');
          if (invoiceNum === orderNum) {
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
      this.orders.forEach(order => {
        this.invoices.push({
          "상품주문번호": order["상품주문번호"],
          "배송방법": "택배,등기,소포",
          "택배사": sellerInfo.vendor.smartStore.viewName,
          "송장번호": '',
        });
      });
      allInvoiceJson.forEach(invoice => {
        const orderNumber = String(invoice["고객주문번호"] || '');
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
