import { BaseMarketplace } from './base-marketplace.js';
import { registry } from '../core/marketplace-registry.js';

class SmartStore extends BaseMarketplace {
  constructor() {
    super({
      id: 'smartstore',
      platformName: '스마트스토어',
      invoiceFileName: '송장_스마트스토어_',
      parseRowOffset: 1,
      useDefval: false,
      columns: {
        recipientName: '수취인명',
        zipCode: '우편번호',
        address: '통합배송지',
        phone1: '수취인연락처1',
        phone2: '수취인연락처2',
        productName: '상품명',
        option: '옵션정보',
        quantity: '수량',
        deliveryMessage: '배송메세지',
        orderNumber: '상품주문번호',
      },
      job2SheetName: '발송처리',
      job2FileType: 'xls',
    });
  }

  detect(headerRows) {
    return headerRows[0][0] && headerRows[0][0].includes('엑셀 일괄발송');
  }

  _buildInvoiceEntry(order, trackingNumber, sellerInfo) {
    return {
      "상품주문번호": order["상품주문번호"],
      "배송방법": "택배,등기,소포",
      "택배사": sellerInfo.vendor.smartStore.viewName,
      "송장번호": trackingNumber,
    };
  }
}

registry.register(new SmartStore());
