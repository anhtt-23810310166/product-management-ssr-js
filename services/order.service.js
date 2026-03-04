const BaseService = require("./base.service");
const Order = require("../models/order.model");

class OrderService extends BaseService {
    constructor() {
        super(Order, "orders", { searchField: "customerName" });
    }
}

module.exports = new OrderService();
