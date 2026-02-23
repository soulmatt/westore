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

  _buildInvoiceEntry(order, trackingNumber, sellerInfo) {
    return {
      ...order,
      "배송사": sellerInfo.vendor.lotteon.viewName,
      "송장번호": trackingNumber,
    };
  }
}

registry.register(new LotteOn());
