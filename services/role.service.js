const BaseService = require("./base.service");
const Role = require("../models/role.model");

class RoleService extends BaseService {
    constructor() {
        super(Role, "roles", { searchField: "title", nameField: "title" });
    }

    /**
     * Tạo nhóm quyền
     */
    async create(data) {
        const role = new this.Model(data);
        await role.save();
        return role;
    }

    /**
     * Cập nhật nhóm quyền
     */
    async update(id, data) {
        const role = await this.Model.findById(id);
        if (!role) throw new Error("NOT_FOUND");

        role.title = data.title;
        role.description = data.description;
        
        await role.save();
        return role;
    }

    /**
     * Lấy tất cả nhóm quyền (không phân trang)
     */
    async getAll() {
        return await this.Model.find({ deleted: false }).sort({ createdAt: -1 });
    }

    /**
     * Cập nhật phân quyền
     */
    async updatePermissions(permissionsData) {
        // permissionsData is [{ id: "...", permissions: ["..."] }, ...]
        for (const item of permissionsData) {
            await this.Model.updateOne(
                { _id: item.id },
                { permissions: item.permissions }
            );
        }
    }
}

module.exports = new RoleService();
