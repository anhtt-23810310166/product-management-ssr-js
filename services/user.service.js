const BaseService = require("./base.service");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

class UserService extends BaseService {
    constructor() {
        super(User, "users", { searchField: "fullName" });
    }

    /**
     * Cập nhật thông tin khách hàng (bao gồm hash pass)
     */
    async update(id, data, file) {
        const user = await this.Model.findById(id);
        if (!user) throw new Error("NOT_FOUND");

        const updateData = {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            status: data.status
        };

        if (data.password && data.password.trim() !== "") {
            updateData.password = bcrypt.hashSync(data.password, 10);
        }

        if (file) {
            updateData.avatar = file.path;
        }

        await this.Model.updateOne({ _id: id }, updateData);
        return await this.Model.findById(id);
    }
}

module.exports = new UserService();
