const BaseService = require("./base.service");
const Account = require("../models/account.model");
const searchHelper = require("../helpers/search");
const bcrypt = require("bcryptjs");
const generate = require("../helpers/generate");

class AccountService extends BaseService {
    constructor() {
        super(Account, "accounts", { searchField: "fullName", nameField: "fullName" });
    }

    /**
     * Override list() để search trên cả fullName và email (dùng $or).
     */
    async list(query, options = {}) {
        const filterStatusHelper = require("../helpers/filterStatus");
        const paginationHelper = require("../helpers/pagination");
        const sortHelper = require("../helpers/sort");

        const filterStatus = filterStatusHelper(query);
        const find = { deleted: false, ...(options.extraFind || {}) };

        if (query.status) {
            find.status = query.status;
        }

        // Search trên cả fullName và email
        const objectSearch = searchHelper(query);
        if (objectSearch.regex) {
            find.$or = [
                { fullName: objectSearch.regex },
                { email: objectSearch.regex }
            ];
        }

        const totalItems = await this.Model.countDocuments(find);
        const objectPagination = paginationHelper(query, totalItems, options.limit || 20);
        const objectSort = sortHelper(query, options.sortOptions);

        const items = await this.Model
            .find(find)
            .select("-password -token")
            .sort(objectSort.sortObject)
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        return {
            items,
            filterStatus,
            keyword: objectSearch.keyword,
            sortOptions: objectSort.sortOptions,
            pagination: objectPagination
        };
    }

    /**
     * Tạo mới tài khoản quản trị
     */
    async create(data, file) {
        data.password = bcrypt.hashSync(data.password, 10);
        data.token = generate.generateRandomString(20);

        if (file) {
            data.avatar = file.path;
        }

        const account = new this.Model(data);
        await account.save();
        return account;
    }

    /**
     * Cập nhật tài khoản
     */
    async update(id, data, file) {
        const account = await this.Model.findById(id);
        if (!account) throw new Error("NOT_FOUND");

        if (data.password) {
            data.password = bcrypt.hashSync(data.password, 10);
        } else {
            delete data.password;
        }

        if (file) {
            data.avatar = file.path;
        }

        await this.Model.updateOne({ _id: id }, data);
        return await this.Model.findById(id);
    }
}

module.exports = new AccountService();
