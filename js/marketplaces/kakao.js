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

  detect(headerRows) {
    return headerRows[0][0] === '배송지/수신자정보 입력일';
  }

  _buildInvoiceEntry(order, trackingNumber, sellerInfo) {
    return {
      ...order,
      "배송방법": '택배배송',
      "택배사코드": sellerInfo.vendor.kakao.code,
      "송장번호": trackingNumber,
    };
  }
}

registry.register(new Kakao());
