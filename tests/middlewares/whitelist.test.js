const whitelist = require("../../middlewares/whitelist.middleware");

describe("middlewares/whitelist", () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {};
        next = jest.fn();
    });

    test("chỉ giữ lại các field được phép", () => {
        req.body = { title: "SP1", price: 100, hack: "malicious" };
        whitelist(["title", "price"])(req, res, next);
        expect(req.body).toEqual({ title: "SP1", price: 100 });
        expect(req.body.hack).toBeUndefined();
        expect(next).toHaveBeenCalled();
    });

    test("bỏ qua field không có trong body", () => {
        req.body = { title: "SP1" };
        whitelist(["title", "price", "description"])(req, res, next);
        expect(req.body).toEqual({ title: "SP1" });
        expect(next).toHaveBeenCalled();
    });

    test("giữ body rỗng khi không có field nào khớp", () => {
        req.body = { hack: "bad" };
        whitelist(["title"])(req, res, next);
        expect(req.body).toEqual({});
        expect(next).toHaveBeenCalled();
    });

    test("gọi next() khi body null/undefined", () => {
        req.body = null;
        whitelist(["title"])(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test("giữ nguyên giá trị khi field hợp lệ", () => {
        req.body = { title: "SP1", price: 0, status: "" };
        whitelist(["title", "price", "status"])(req, res, next);
        expect(req.body.price).toBe(0);
        expect(req.body.status).toBe("");
    });
});
