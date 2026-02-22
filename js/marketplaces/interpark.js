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
    const filtered = this._filterInvoicesByPlatform(allInvoiceJson, this.platformName);

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
        filtered.forEach(invoice => {
          const nameMatch = (invoice["받는분"] || '').replace(/ /g, '') ===
            (order["수령자명"] || '').replace(/ /g, '');
          const addrMatch = (invoice["받는분주소"] || '').replace(/ /g, '') ===
            (order["주소"] || '').replace(/ /g, '');
          if (nameMatch && addrMatch) {
            this.invoices.push(buildEntry(order, invoice["운송장번호"]));
          }
        });
      });
    }

    if (sellerInfo.vendor.id === 2) {
      // Type2: 원본은 '상품상세내용' 컬럼으로 필터링
      const filteredType2 = allInvoiceJson.filter(inv =>
        inv["고객주문번호"] && inv["고객주문번호"].includes(this.platformName)
      );
      this.orders.forEach(order => {
        this.invoices.push(buildEntry(order, ''));
      });
      filteredType2.forEach(invoice => {
        const orderNumber = (invoice["고객주문번호"] || '').split('/')[1];
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
