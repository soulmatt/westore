import { BaseMarketplace } from './base-marketplace.js';
import { registry } from '../core/marketplace-registry.js';

class Coupang extends BaseMarketplace {
  constructor() {
    super({
      id: 'coupang',
      platformName: '쿠팡',
      invoiceFileName: '송장_쿠팡_',
      parseRowOffset: 0,
      useDefval: true,
      columns: {
        recipientName: '수취인이름',
        zipCode: '우편번호',
        address: '수취인 주소',
        phone1: '수취인전화번호',
        phone2: null,
        phone2Type2: '구매자전화번호',
        productName: '노출상품명(옵션명)',
        option: null,
        quantity: '구매수(수량)',
        deliveryMessage: '배송메세지',
        orderNumber: '주문번호',
      },
      job2SheetName: '배송관리',
      job2FileType: 'xlsx',
    });
  }

  detect(headers) {
    return headers[0] === '묶음배송번호' || headers[1] === '묶음배송번호';
  }

  getPhone2(order) {
    return '';
  }

  matchInvoices(allInvoiceJson, sellerInfo) {
    this.invoices = [];

    if (sellerInfo.vendor.id === 1) {
      this.orders.forEach(order => {
        const orderNum = String(order["주문번호"] || '').replace(/ /g, '');
        allInvoiceJson.forEach(invoice => {
          const invoiceNum = String(invoice["고객주문번호"] || '').replace(/ /g, '');
          if (invoiceNum === orderNum) {
            const entry = { ...order };
            entry["택배사"] = sellerInfo.vendor.coupang.viewName;
            entry["운송장번호"] = invoice["운송장번호"];
            this.invoices.push(entry);
          }
        });
      });
    }

    if (sellerInfo.vendor.id === 2) {
      this.orders.forEach(order => {
        this.invoices.push({ ...order });
      });
      allInvoiceJson.forEach(invoice => {
        const orderNumber = String(invoice["고객주문번호"] || '');
        if (!orderNumber) return;
        this.invoices.forEach(inv => {
          if (orderNumber.replace(/ /g, '') == inv["주문번호"]) {
            inv["택배사"] = sellerInfo.vendor.coupang.viewName;
            inv["운송장번호"] = invoice["운송장번호"];
          }
        });
      });
    }
  }
}

registry.register(new Coupang());
