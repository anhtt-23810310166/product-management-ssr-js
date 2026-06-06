const createTree = require("../../helpers/createTree");

describe("helpers/createTree", () => {
    test("trả về mảng rỗng khi input rỗng", () => {
        expect(createTree([])).toEqual([]);
    });

    test("tạo tree từ danh sách phẳng 1 cấp (root nodes)", () => {
        const categories = [
            { _id: { toString: () => "1" }, title: "Điện thoại", parent_id: "" },
            { _id: { toString: () => "2" }, title: "Laptop", parent_id: "" }
        ];
        const tree = createTree(categories);
        expect(tree).toHaveLength(2);
        expect(tree[0].title).toBe("Điện thoại");
        expect(tree[0].children).toEqual([]);
        expect(tree[1].title).toBe("Laptop");
    });

    test("tạo tree 2 cấp (cha-con)", () => {
        const categories = [
            { _id: { toString: () => "1" }, title: "Điện thoại", parent_id: "" },
            { _id: { toString: () => "2" }, title: "iPhone", parent_id: "1" },
            { _id: { toString: () => "3" }, title: "Samsung", parent_id: "1" }
        ];
        const tree = createTree(categories);
        expect(tree).toHaveLength(1);
        expect(tree[0].title).toBe("Điện thoại");
        expect(tree[0].children).toHaveLength(2);
        expect(tree[0].children[0].title).toBe("iPhone");
        expect(tree[0].children[1].title).toBe("Samsung");
    });

    test("tạo tree 3 cấp (cha-con-cháu)", () => {
        const categories = [
            { _id: { toString: () => "1" }, title: "Điện tử", parent_id: "" },
            { _id: { toString: () => "2" }, title: "Điện thoại", parent_id: "1" },
            { _id: { toString: () => "3" }, title: "iPhone 15", parent_id: "2" }
        ];
        const tree = createTree(categories);
        expect(tree).toHaveLength(1);
        expect(tree[0].children).toHaveLength(1);
        expect(tree[0].children[0].children).toHaveLength(1);
        expect(tree[0].children[0].children[0].title).toBe("iPhone 15");
    });

    test("xử lý item có toObject method (Mongoose document)", () => {
        const categories = [
            {
                _id: { toString: () => "1" },
                title: "Category A",
                parent_id: "",
                toObject: () => ({
                    _id: { toString: () => "1" },
                    title: "Category A",
                    parent_id: ""
                })
            }
        ];
        const tree = createTree(categories);
        expect(tree).toHaveLength(1);
        expect(tree[0].title).toBe("Category A");
        expect(tree[0].children).toEqual([]);
    });

    test("item không có con thì children là mảng rỗng", () => {
        const categories = [
            { _id: { toString: () => "1" }, title: "Root", parent_id: "" }
        ];
        const tree = createTree(categories);
        expect(tree[0].children).toEqual([]);
    });
});
