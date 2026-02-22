import { BaseMarketplace } from './base-marketplace.js';
import { registry } from '../core/marketplace-registry.js';

class WeMakePrice extends BaseMarketplace {
  constructor() {
    super({
      id: 'wemakeprice',
      platformName: '위메프',
      invoiceFileName: '송장_위메프_',
      parseRowOffset: 0,
      useDefval: true,
      columns: {
        recipientName: '받는사람',
        zipCode: '우편번호',
        address: '주소',
        phone1: '받는사람 연락처',
        phone2: null,
        phone2Type2: '구매자 휴대폰',
        productName: '상품명',
        option: '옵션',
        quantity: '수량',
        deliveryMessage: '배송메세지',
        orderNumber: '주문번호',
      },
      job2SheetName: 'orderList',
      job2FileType: 'xlsx',
    });
  }

  detect(headers) {
    return headers[0] === '배송번호' && headers[1] === '주문번호';
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
            entry["송장번호"] = invoice["운송장번호"];
            entry["택배사"] = sellerInfo.vendor.wemakeprice.viewName;
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
            inv["송장번호"] = invoice["운송장번호"];
            inv["택배사"] = sellerInfo.vendor.wemakeprice.viewName;
          }
        });
      });
    }
  }
}

registry.register(new WeMakePrice());
