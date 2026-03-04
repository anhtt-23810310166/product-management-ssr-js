// Bảng cước phí vận chuyển theo vùng
const SHIPPING_RATES = {
    north:   25000,
    central: 35000,
    south:   30000
};

const REGIONS = {
    north: ["Hà Nội","Hải Phòng","Hải Dương","Hưng Yên","Thái Bình","Nam Định","Ninh Bình","Hà Nam","Vĩnh Phúc","Bắc Ninh","Hà Giang","Cao Bằng","Bắc Kạn","Tuyên Quang","Lào Cai","Yên Bái","Thái Nguyên","Lạng Sơn","Quảng Ninh","Bắc Giang","Phú Thọ","Điện Biên","Hòa Bình","Sơn La","Lai Châu"],
    central:["Thanh Hóa","Nghệ An","Hà Tĩnh","Quảng Bình","Quảng Trị","Thừa Thiên Huế","Đà Nẵng","Quảng Nam","Quảng Ngãi","Bình Định","Phú Yên","Khánh Hòa","Ninh Thuận","Bình Thuận","Kon Tum","Gia Lai","Đắk Lắk","Đắk Nông","Lâm Đồng"],
    south:  ["Hồ Chí Minh","TP. Hồ Chí Minh","Bà Rịa - Vũng Tàu","Bình Phước","Bình Dương","Đồng Nai","Tây Ninh","Long An","Tiền Giang","Bến Tre","Trà Vinh","Vĩnh Long","Đồng Tháp","An Giang","Kiên Giang","Hậu Giang","Sóc Trăng","Bạc Liêu","Cà Mau","Cần Thơ"]
};

const REGION_LABELS = { north: "Miền Bắc", central: "Miền Trung", south: "Miền Nam" };

function calculateShippingFee(province) {
    if (!province) return { fee: 35000, region: "unknown", regionLabel: "Không xác định" };
    const norm = province.trim().toLowerCase();
    for (const [region, list] of Object.entries(REGIONS)) {
        if (list.some(p => p.toLowerCase() === norm || norm.includes(p.toLowerCase()))) {
            return { fee: SHIPPING_RATES[region], region, regionLabel: REGION_LABELS[region] };
        }
    }
    return { fee: 35000, region: "unknown", regionLabel: "Không xác định" };
}

function getProvinceList() {
    return [...REGIONS.north, ...REGIONS.central, ...REGIONS.south].sort((a, b) => a.localeCompare(b, "vi"));
}

module.exports = { calculateShippingFee, getProvinceList, SHIPPING_RATES };
