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

  _buildInvoiceEntry(order, trackingNumber, sellerInfo) {
    return {
      "no": order["순번"],
      "배송번호": order["배송번호"],
      "배송유형상세": order["배송유형"],
      "택배사": sellerInfo.vendor.ssg.code,
      "송장번호": String(trackingNumber || '').replaceAll('-', ''),
      "중량정보": '20',
    };
  }
}

registry.register(new SSG());
