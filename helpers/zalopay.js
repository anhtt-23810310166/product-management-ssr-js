const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const moment = require('moment'); // Required for formatting ZaloPay app_time. Need to install moment.

// Config cho môi trường Sandbox
const config = {
    app_id: "2553",
    key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
    key2: "kLtgPl8YESD1TzOOO8MStz4S9rX1lB8f",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

// Hàm tạo liên kết thanh toán ZaloPay
module.exports.createPaymentUrl = async (orderId, amount, itemStr, username) => {
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
        app_id: config.app_id,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // Mã giao dịch ZaloPay dạng YYMMDD_xxxxxx
        app_user: username || "user123",
        app_time: Date.now(), // timestamp miliseconds
        item: JSON.stringify([{ itemid: orderId, itemname: "Thanh toán đơn hàng", itemprice: amount, itemquantity: 1 }]), // Tối thiểu phải có 1 item
        embed_data: JSON.stringify({
            redirecturl: `http://localhost:3000/cart/zalopay-return`,
            orderId: orderId.toString()
        }),
        amount: amount,
        description: `TechZone - Thanh toán đơn hàng #${orderId}`,
        bank_code: "",
        callback_url: `https://techzone.ngrok.app/cart/zalopay-callback` // Không quan trọng với localhost vì ko nhận được callback thật từ Sandbox ZaloPay, ta sẽ verify ở returnUrl.
    };

    // Tạo chữ ký (MAC)
    const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
        const response = await axios.post(config.endpoint, null, { params: order });
        if (response.data && response.data.return_code === 1) {
            return {
                paymentUrl: response.data.order_url,
                appTransId: order.app_trans_id
            };
        } else {
            console.error("ZaloPay Create Order Failed:", response.data);
            return null;
        }
    } catch (err) {
        console.error("ZaloPay Request Error:", err.message);
        return null;
    }
};

// Hàm verify MAC khi ZaloPay callback hoặc redirect về
module.exports.verifyReturnUrl = (reqQuery) => {
    let { amount, appid, apptransid, bankcode, checksum, discountamount, pmcid, status } = reqQuery;
    
    // Checksum tính theo công thức: appid|apptransid|pmcid|bankcode|amount|discountamount|status
    let dataStr = `${appid}|${apptransid}|${pmcid}|${bankcode}|${amount}|${discountamount}|${status}`;
    let reqMac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    return reqMac === checksum;
};
