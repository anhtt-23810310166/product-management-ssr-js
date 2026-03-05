const xlsx = require('xlsx');

// Hàm export dữ liệu ra file Excel
module.exports.exportToExcel = (data, columns, sheetName = 'Sheet1') => {
    // data: mảng các object (ví dụ: mảng sản phẩm)
    // columns: mảng các column header (ví dụ: ['Tiêu đề', 'Giá', 'Số lượng'])
    
    // Tạo mảng dữ liệu với dòng đầu tiên là columns
    const excelData = [columns];
    
    // Thêm các dòng data
    data.forEach(item => {
        excelData.push(Object.values(item));
    });

    const worksheet = xlsx.utils.aoa_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Trả về buffer
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

// Hàm import dữ liệu từ file Excel
module.exports.importFromExcel = (buffer) => {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Chuyển sheet sang JSON (dòng đầu là key)
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data;
};
