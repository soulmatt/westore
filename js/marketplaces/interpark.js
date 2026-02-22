import { BaseMarketplace } from './base-marketplace.js';
import { registry } from '../core/marketplace-registry.js';

class Interpark extends BaseMarketplace {
  constructor() {
    super({
      id: 'interpark',
      platformName: '인터파크',
      invoiceFileName: '송장_인터파크_',
      parseRowOffset: 5,
      useDefval: true,
      columns: {
        recipientName: '수령자명',
        zipCode: '우편번호',
        address: '주소',
        phone1: '수령자휴대폰번호',
        phone2: '수령자전화',
        phone2Type2: '구매자휴대폰번호',
        productName: '상품명',
        option: '옵션명',
        quantity: '수량',
        deliveryMessage: '배송메시지',
        orderNumber: '주문번호',
      },
      job2SheetName: 'sheet1',
      job2FileType: 'xlsx',
      job2Origin: 6,
    });
  }

  detect(headers) {
    return headers[0] === '주문/발송관리';
  }

  matchInvoices(allInvoiceJson, sellerInfo) {
    this.invoices = [];

    const buildEntry = (order, invoiceNumber) => {
      const optionName = order["옵션명"] ? ' - ' + order["옵션명"] : '';
      return {
        "주문번호": order["주문번호"],
        "주문순번": order["주문순번"],
        "수령자": order["수령자명"],
        "상품명": order["상품명"] + optionName,
        "옵션명": order["옵션명"],
        "결제일": order["결제일"],
        "택배사코드": sellerInfo.vendor.interpark.code,
        "수량": order["수량"],
        "송장번호": invoiceNumber,
      };
    };

    if (sellerInfo.vendor.id === 1) {
      this.orders.forEach(order => {
        const orderNum = String(order["주문번호"] || '').replace(/ /g, '');
        allInvoiceJson.forEach(invoice => {
          const invoiceNum = String(invoice["고객주문번호"] || '').replace(/ /g, '');
          if (invoiceNum === orderNum) {
            this.invoices.push(buildEntry(order, invoice["운송장번호"]));
          }
        });
      });
    }

    if (sellerInfo.vendor.id === 2) {
      this.orders.forEach(order => {
        this.invoices.push(buildEntry(order, ''));
      });
      allInvoiceJson.forEach(invoice => {
        const orderNumber = String(invoice["고객주문번호"] || '');
        if (!orderNumber) return;
        this.invoices.forEach(inv => {
          if (orderNumber.replace(/ /g, '') == inv["주문번호"]) {
            inv["송장번호"] = invoice["운송장번호"];
          }
        });
      });
    }
  }
}

registry.register(new Interpark());
