import { BaseMarketplace } from './base-marketplace.js';
import { registry } from '../core/marketplace-registry.js';

class St11 extends BaseMarketplace {
  constructor() {
    super({
      id: 'st11',
      platformName: '11번가',
      invoiceFileName: '송장_11번가_',
      parseRowOffset: 2,
      useDefval: false,
      columns: {
        recipientName: '수취인',
        zipCode: '우편번호',
        address: '주소',
        phone1: '휴대폰번호',
        phone2: '전화번호',
        productName: '상품명',
        option: '옵션',
        quantity: '수량',
        deliveryMessage: '배송메시지',
        orderNumber: '주문번호',
      },
      job2SheetName: 'sk11st 발송처리 sheet',
      job2FileType: 'xls',
      job2Origin: 1,
    });
  }

  detect(headerRows) {
    // 11번가는 Row 0이 안내 문구, Row 1이 '발송준비중내역'
    return headerRows.some(row => row[0] && row[0].includes('발송준비중내역'));
  }

  _buildInvoiceEntry(order, trackingNumber, sellerInfo) {
    return {
      "번호": order["번호"],
      "주문일시": order["주문일시"],
      "결제완료일": order["결제일시"],
      "주문번호": order["주문번호"],
      "주문상태": order["주문상태"],
      "배송번호": order["배송번호"],
      "택배사코드": sellerInfo.vendor.st11.code,
      "송장/등기번호": trackingNumber,
      "배송방법": sellerInfo.vendor.st11.deliveryType,
      "상품번호": order["상품번호"],
    };
  }
}

registry.register(new St11());
