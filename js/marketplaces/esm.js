import { BaseMarketplace } from './base-marketplace.js';
import { registry } from '../core/marketplace-registry.js';

class Esm extends BaseMarketplace {
  constructor() {
    super({
      id: 'esm',
      platformName: 'ESM',
      invoiceFileName: '송장_esm_',
      parseRowOffset: 0,
      useDefval: true,
      columns: {
        recipientName: '수령인명',
        zipCode: '우편번호',
        address: '주소',
        phone1: '수령인 휴대폰',
        phone2: '수령인 전화번호',
        phone2Type2: '구매자 휴대폰',
        productName: '상품명',
        option: '옵션',
        quantity: '수량',
        deliveryMessage: '배송시 요구사항',
        orderNumber: '주문번호',
      },
      job2SheetName: 'Sheet1',
      job2FileType: 'xls',
    });
    this._gmarketName = '지마켓';
    this._auctionName = '옥션';
  }

  detect(headerRows) {
    return headerRows[0][0] === '판매아이디' || headerRows[0][0] === '아이디';
  }

  // 지마켓/옥션 동적 판별
  _getStoreName(order) {
    return (order["판매아이디"] || order["아이디"] || '').includes(this._gmarketName)
      ? this._gmarketName
      : this._auctionName;
  }

  _buildInvoiceEntry(order, trackingNumber, sellerInfo) {
    const optionName = order["옵션"] ? ' - ' + order["옵션"] : '';
    return {
      "계정": order["판매아이디"] || order["아이디"],
      "상품명": order["상품명"] + optionName,
      "택배사": sellerInfo.vendor.esm.viewName,
      "주문번호": order["주문번호"],
      "수령자": order["수령인명"],
      "전화번호": order["수령인 전화번호"],
      "휴대폰": order["수령인 휴대폰"],
      "운송장/등기번호": trackingNumber,
    };
  }
}

registry.register(new Esm());
