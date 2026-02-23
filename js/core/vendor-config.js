/**
 * 택배 벤더 설정
 */
const CURRENT_VENDOR_ID = 2; // 변경 시 CJ대한통운(1) 또는 롯데택배(2)

const VENDORS = [
  {
    id: 1,
    name: "CJ대한통운",
    sheetName: "배송관리",
    invoiceColumns: { orderNumber: '고객주문번호', trackingNumber: '운송장번호' },
    smartStore: { viewName: "CJ대한통운" },
    st11: { code: '00034', deliveryType: '01' },
    coupang: { viewName: "CJ 대한통운" },
    kakao: { code: "2" },
    gmarket: { viewName: "CJ택배" },
    lotteon: { viewName: "CJ택배" },
    ssg: { code: '0000033011' },
    interpark: { code: '169168' },
    wemakeprice: { viewName: 'CJ대한통운' },
  },
  {
    id: 2,
    name: "롯데택배",
    sheetName: "Sheet1",
    invoiceColumns: { orderNumber: '주문번호', trackingNumber: '운송장번호' },
    smartStore: { viewName: "롯데택배" },
    st11: { code: '00012', deliveryType: '01' },
    coupang: { viewName: "롯데택배" },
    kakao: { code: "76" },
    gmarket: { viewName: "롯데택배" },
    lotteon: { viewName: "롯데택배" },
    ssg: { code: '롯데택배' },
    interpark: { code: '롯데택배' },
    wemakeprice: { viewName: '롯데택배' },
  }
];

export function getVendorById(id) {
  return VENDORS.find(v => v.id === id);
}

export { CURRENT_VENDOR_ID, VENDORS };
