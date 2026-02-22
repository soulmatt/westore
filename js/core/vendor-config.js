/**
 * CJ택배 Type1/Type2 배송사 설정
 */
const VENDORS = [
  {
    id: 1,
    name: "CJ대한통운",
    viewName: "CJ택배-Type1",
    sheetName: "배송관리",
    fileName: "CJ택배발송용",
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
    name: "CJ대한통운",
    viewName: "CJ택배-Type2",
    sheetName: "Sheet1",
    fileName: "CJ택배발송용",
    smartStore: { viewName: "CJ대한통운" },
    st11: { code: '00034', deliveryType: '01' },
    coupang: { viewName: "CJ 대한통운" },
    kakao: { code: "2" },
    gmarket: { viewName: "CJ택배" },
    lotteon: { viewName: "CJ택배" },
    ssg: { code: '0000033011' },
    interpark: { code: '169168' },
    wemakeprice: { viewName: 'CJ대한통운' },
  }
];

export function getVendorById(id) {
  return VENDORS.find(v => v.id === id);
}

export { VENDORS };
