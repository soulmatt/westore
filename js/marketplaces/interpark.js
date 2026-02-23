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

  detect(headerRows) {
    return headerRows[0][0] === '주문/발송관리';
  }

  _buildInvoiceEntry(order, trackingNumber, sellerInfo) {
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
      "송장번호": trackingNumber,
    };
  }
}

registry.register(new Interpark());
