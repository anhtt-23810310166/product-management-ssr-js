const BaseService = require("./base.service");
const Brand = require("../models/brand.model");

class BrandService extends BaseService {
    constructor() {
        super(Brand, "brands", { searchField: "name", nameField: "name" });
    }

    /**
     * Tạo thương hiệu
     */
    async create(data, file) {
        data.position = await this.autoPosition(data.position);

        if (file) {
            data.logo = file.path;
        }

        const brand = new this.Model(data);
        await brand.save();
        return brand;
    }

    /**
     * Cập nhật thương hiệu
     */
    async update(id, data, file) {
        const brand = await this.Model.findById(id);
        if (!brand) throw new Error("NOT_FOUND");

        if (data.position !== undefined && data.position !== "") {
            data.position = parseInt(data.position);
        }

        if (file) {
            data.logo = file.path;
        }

        // Cập nhật các trường
        brand.name = data.name;
        brand.description = data.description;
        brand.status = data.status;
        brand.position = data.position;
        if (data.logo) brand.logo = data.logo;

        await brand.save();
        return brand;
    }
}

module.exports = new BrandService();
