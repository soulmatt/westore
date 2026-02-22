import { BaseMarketplace } from './base-marketplace.js';
import { registry } from '../core/marketplace-registry.js';

class Gmarket extends BaseMarketplace {
  constructor() {
    super({
      id: 'gmarket',
      platformName: '지마켓',
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
        option: '주문옵션',
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

  detect(headers) {
    return headers[0] === '아이디';
  }

  // 지마켓/옥션 동적 판별
  _getStoreName(order) {
    return (order["아이디"] || '').includes(this._gmarketName)
      ? this._gmarketName
      : this._auctionName;
  }

  getCustomerOrderNumber(order) {
    return order["주문번호"];
  }

  getCustomerOrderNumberType2(order) {
    return this.getCustomerOrderNumber(order);
  }

  matchInvoices(allInvoiceJson, sellerInfo) {
    this.invoices = [];

    if (sellerInfo.vendor.id === 1) {
      this.orders.forEach(order => {
        const orderNum = String(order["주문번호"] || '').replace(/ /g, '');
        const optionName = order["주문옵션"] ? ' - ' + order["주문옵션"] : '';
        allInvoiceJson.forEach(invoice => {
          const invoiceNum = String(invoice["고객주문번호"] || '').replace(/ /g, '');
          if (invoiceNum === orderNum) {
            this.invoices.push({
              "계정": order["아이디"],
              "상품명": order["상품명"] + optionName,
              "택배사": sellerInfo.vendor.gmarket.viewName,
              "주문번호": order["주문번호"],
              "수령자": order["수령인명"],
              "전화번호": order["수령인 전화번호"],
              "휴대폰": order["수령인 휴대폰"],
              "운송장/등기번호": invoice["운송장번호"],
            });
          }
        });
      });
    }

    if (sellerInfo.vendor.id === 2) {
      this.orders.forEach(order => {
        const optionName = order["주문옵션"] ? ' - ' + order["주문옵션"] : '';
        this.invoices.push({
          "계정": order["아이디"],
          "상품명": order["상품명"] + optionName,
          "택배사": sellerInfo.vendor.gmarket.viewName,
          "주문번호": order["주문번호"],
          "수령자": order["수령인명"],
          "전화번호": order["수령인 전화번호"],
          "휴대폰": order["수령인 휴대폰"],
          "운송장/등기번호": '',
        });
      });
      allInvoiceJson.forEach(invoice => {
        const orderNumber = String(invoice["고객주문번호"] || '');
        if (!orderNumber) return;
        this.invoices.forEach(inv => {
          if (orderNumber.replace(/ /g, '') == inv["주문번호"]) {
            inv["운송장/등기번호"] = invoice["운송장번호"];
          }
        });
      });
    }
  }
}

registry.register(new Gmarket());
