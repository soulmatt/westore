import { BaseMarketplace } from './base-marketplace.js';
import { registry } from '../core/marketplace-registry.js';
import { checkPhoneNumber } from '../core/excel-utils.js';

class SSG extends BaseMarketplace {
  constructor() {
    super({
      id: 'ssg',
      platformName: 'SSG.COM',
      invoiceFileName: '송장_ssg.com_',
      parseRowOffset: 0,
      useDefval: true,
      columns: {
        recipientName: '수취인',
        zipCode: '우편번호',
        address: '수취인도로명주소',
        phone1: '수취인휴대전화번호',
        phone2: '수취인전화번호',
        productName: '상품명',
        option: '옵션명',
        quantity: '주문수량',
        deliveryMessage: '고객배송메모',
        orderNumber: '주문번호',
      },
      job2SheetName: 'sheet1',
      job2FileType: 'xls',
    });
  }

  detect(headers) {
    return headers[0] === '순번' && headers[1] === '출고유형';
  }

  getPhone1(order) {
    const phone = order["수취인휴대전화번호"];
    return checkPhoneNumber(phone) ? phone : '';
  }

  getPhone2(order) {
    const phone = order["수취인전화번호"];
    return checkPhoneNumber(phone) ? phone : '';
  }

  getPhone2Type2(order) {
    return '';
  }

  matchInvoices(allInvoiceJson, sellerInfo) {
    this.invoices = [];
    const filtered = this._filterInvoicesByPlatform(allInvoiceJson, this.platformName);

    if (sellerInfo.vendor.id === 1) {
      this.orders.forEach(order => {
        filtered.forEach(invoice => {
          const nameMatch = (invoice["받는분"] || '').replace(/ /g, '') ===
            (order["수취인"] || '').replace(/ /g, '');
          const addrMatch = (invoice["받는분주소"] || '').replace(/ /g, '') ===
            (order["수취인도로명주소"] || '').replace(/ /g, '');
          if (nameMatch && addrMatch) {
            this.invoices.push({
              "no": order["순번"],
              "배송번호": order["배송번호"],
              "배송유형상세": order["배송유형"],
              "택배사": sellerInfo.vendor.ssg.code,
              "송장번호": String(invoice["운송장번호"] || '').replaceAll('-', ''),
              "중량정보": '20',
            });
          }
        });
      });
    }

    if (sellerInfo.vendor.id === 2) {
      this.orders.forEach(order => {
        this.invoices.push({
          "no": order["순번"],
          "배송번호": order["배송번호"],
          "배송유형상세": order["배송유형"],
          "택배사": sellerInfo.vendor.ssg.code,
          "송장번호": '',
          "중량정보": '20',
        });
      });
      filtered.forEach(invoice => {
        const orderNumber = (invoice["고객주문번호"] || '').split('/')[1];
        if (!orderNumber) return;
        this.orders.forEach((order, idx) => {
          if (orderNumber.replace(/ /g, '') == order["주문번호"]) {
            this.invoices[idx]["송장번호"] = String(invoice["운송장번호"] || '').replaceAll('-', '');
          }
        });
      });
    }
  }
}

registry.register(new SSG());
