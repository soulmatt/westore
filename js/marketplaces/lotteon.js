import { BaseMarketplace } from './base-marketplace.js';
import { registry } from '../core/marketplace-registry.js';

class LotteOn extends BaseMarketplace {
  constructor() {
    super({
      id: 'lotteon',
      platformName: '롯데on',
      invoiceFileName: '송장_롯데on_',
      parseRowOffset: 0,
      useDefval: true,
      columns: {
        recipientName: '수취인명',
        zipCode: '우편번호',
        address: '배송지',
        phone1: '수취인휴대폰번호',
        phone2: null,
        phone2Type2: '주문자휴대폰번호',
        productName: '상품명',
        option: '입력형추가옵션',
        quantity: '수량',
        deliveryMessage: '배송메세지',
        orderNumber: '주문번호',
      },
      job2SheetName: 'sheet1',
      job2FileType: 'xlsx',
    });
  }

  detect(headers) {
    return headers[0] === '상품준비일시';
  }

  getPhone2(order) {
    return '';
  }

  matchInvoices(allInvoiceJson, sellerInfo) {
    this.invoices = [];
    const filtered = this._filterInvoicesByPlatform(allInvoiceJson, this.platformName);

    if (sellerInfo.vendor.id === 1) {
      this.orders.forEach(order => {
        filtered.forEach(invoice => {
          const nameMatch = (invoice["받는분"] || '').replace(/ /g, '') ===
            (order["수취인명"] || '').replace(/ /g, '');
          const addrMatch = (invoice["받는분주소"] || '').replace(/ /g, '') ===
            (order["배송지"] || '').replace(/ /g, '');
          if (nameMatch && addrMatch) {
            const entry = { ...order };
            entry["배송사"] = sellerInfo.vendor.lotteon.viewName;
            entry["송장번호"] = invoice["운송장번호"];
            this.invoices.push(entry);
          }
        });
      });
    }

    if (sellerInfo.vendor.id === 2) {
      this.orders.forEach(order => {
        this.invoices.push({ ...order });
      });
      filtered.forEach(invoice => {
        const orderNumber = (invoice["고객주문번호"] || '').split('/')[1];
        if (!orderNumber) return;
        this.invoices.forEach(inv => {
          if (orderNumber.replace(/ /g, '') == inv["주문번호"]) {
            inv["배송사"] = sellerInfo.vendor.lotteon.viewName;
            inv["송장번호"] = invoice["운송장번호"];
          }
        });
      });
    }
  }
}

registry.register(new LotteOn());
