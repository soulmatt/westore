import { BaseMarketplace } from './base-marketplace.js';
import { registry } from '../core/marketplace-registry.js';

class Kakao extends BaseMarketplace {
  constructor() {
    super({
      id: 'kakao',
      platformName: '카카오톡스토어',
      invoiceFileName: '송장_카카오_',
      parseRowOffset: 0,
      useDefval: true,
      columns: {
        recipientName: '수령인명',
        zipCode: '우편번호',
        address: '배송지주소',
        phone1: '하이픈포함 수령인연락처1',
        phone2: '하이픈포함 수령인연락처2',
        productName: '상품명',
        option: '옵션',
        quantity: '수량',
        deliveryMessage: '배송메세지',
        orderNumber: '주문번호',
      },
      job2SheetName: 'Sheet0',
      job2FileType: 'xlsx',
    });
  }

  detect(headers) {
    return headers[0] === '배송지/수신자정보 입력일';
  }

  matchInvoices(allInvoiceJson, sellerInfo) {
    this.invoices = [];
    const filtered = this._filterInvoicesByPlatform(allInvoiceJson, this.platformName);

    if (sellerInfo.vendor.id === 1) {
      this.orders.forEach(order => {
        filtered.forEach(invoice => {
          const nameMatch = (invoice["받는분"] || '').replace(/ /g, '') ===
            (order["수령인명"] || '').replace(/ /g, '');
          const addrMatch = (invoice["받는분주소"] || '').replace(/ /g, '') ===
            (order["배송지주소"] || '').replace(/ /g, '');
          if (nameMatch && addrMatch) {
            const entry = { ...order };
            entry["배송방법"] = '택배배송';
            entry["택배사코드"] = sellerInfo.vendor.kakao.code;
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
            inv["배송방법"] = '택배배송';
            inv["택배사코드"] = sellerInfo.vendor.kakao.code;
            inv["송장번호"] = invoice["운송장번호"];
          }
        });
      });
    }
  }
}

registry.register(new Kakao());
