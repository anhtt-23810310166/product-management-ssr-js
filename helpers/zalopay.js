const crypto = require("crypto");
const dayjs = require("dayjs");

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
        app_trans_id: `${dayjs().format('YYMMDD')}_${transID}`, // Mã giao dịch ZaloPay dạng YYMMDD_xxxxxx
        app_user: username || "user123",
        app_time: Date.now(), // timestamp milliseconds
        item: JSON.stringify([{ itemid: orderId, itemname: "Thanh toán đơn hàng", itemprice: amount, itemquantity: 1 }]),
        embed_data: JSON.stringify({
            redirecturl: `http://localhost:3000/cart/zalopay-return`,
            orderId: orderId.toString()
        }),
        amount: amount,
        description: `TechZone - Thanh toán đơn hàng #${orderId}`,
        bank_code: "",
        callback_url: `https://techzone.ngrok.app/cart/zalopay-callback`
    };

    // Tạo chữ ký (MAC) dùng native crypto
    const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = crypto.createHmac("sha256", config.key1).update(data).digest("hex");

    try {
        const url = new URL(config.endpoint);
        Object.entries(order).forEach(([k, v]) => url.searchParams.append(k, v));

        const response = await fetch(url.toString(), { method: "POST" });
        const resData = await response.json();

        if (resData && resData.return_code === 1) {
            return {
                paymentUrl: resData.order_url,
                appTransId: order.app_trans_id
            };
        } else {
            console.error("ZaloPay Create Order Failed:", resData);
            return null;
        }
    } catch (err) {
        console.error("ZaloPay Request Error:", err.message);
        return null;
    }
};

// Hàm verify MAC khi ZaloPay callback hoặc redirect về
module.exports.verifyReturnUrl = (reqQuery) => {
    const { amount, appid, apptransid, bankcode, checksum, discountamount, pmcid, status } = reqQuery;
    const dataStr = `${appid}|${apptransid}|${pmcid}|${bankcode}|${amount}|${discountamount}|${status}`;
    const reqMac = crypto.createHmac("sha256", config.key2).update(dataStr).digest("hex");

    return reqMac === checksum;
};
