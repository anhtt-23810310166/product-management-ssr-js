const BaseService = require("./base.service");
const FlashSale = require("../models/flash-sale.model");

class FlashSaleService extends BaseService {
    constructor() {
        super(FlashSale, "flash-sale", { searchField: "title", nameField: "title" });
    }

    /**
     * Tạo Flash Sale
     */
    async create(data) {
        const products = this.parseProducts(data);

        const flashSale = new this.Model({
            title: data.title,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            products,
            status: data.status || "active"
        });
        
        await flashSale.save();
        return flashSale;
    }

    /**
     * Cập nhật Flash Sale
     */
    async update(id, data) {
        const flashSale = await this.findById(id);
        if (!flashSale) throw new Error("NOT_FOUND");

        flashSale.title = data.title;
        flashSale.startTime = new Date(data.startTime);
        flashSale.endTime = new Date(data.endTime);
        flashSale.status = data.status || "active";

        const newProducts = this.parseProducts(data);
        const mappedProducts = newProducts.map(np => {
            const existing = flashSale.products.find(op => op.product_id.toString() === np.product_id);
            return {
                ...np,
                sold: existing ? existing.sold : 0
            };
        });

        flashSale.products = mappedProducts;
        await flashSale.save();
        return flashSale;
    }

    /**
     * Hàm phụ trợ parse danh sách products từ body
     */
    parseProducts(data) {
        const products = [];
        if (data.productIds) {
            const ids = Array.isArray(data.productIds) ? data.productIds : [data.productIds];
            const discounts = Array.isArray(data.productDiscounts) ? data.productDiscounts : [data.productDiscounts];
            const stocks = Array.isArray(data.productStocks) ? data.productStocks : [data.productStocks];

            for (let i = 0; i < ids.length; i++) {
                products.push({
                    product_id: ids[i],
                    discountPercentage: parseInt(discounts[i]) || 0,
                    stock: parseInt(stocks[i]) || 0,
                    sold: 0 // Default sold cho sp mới
                });
            }
        }
        return products;
    }
}

module.exports = new FlashSaleService();
