const errorHandler = require("../../middlewares/errorHandler.middleware");

describe("middlewares/errorHandler", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            method: "GET",
            originalUrl: "/test",
            xhr: false,
            headers: { accept: "text/html" },
            flash: jest.fn()
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            render: jest.fn().mockReturnThis(),
            redirect: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        // Suppress console.error during tests
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    test("trả JSON 500 cho AJAX request", () => {
        req.xhr = true;
        const err = new Error("Something broke");
        errorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            code: 500,
            message: "Có lỗi hệ thống xảy ra!"
        });
    });

    test("trả JSON với statusCode custom cho AJAX", () => {
        req.headers.accept = "application/json";
        const err = new Error("Not found");
        err.statusCode = 404;
        errorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            code: 404,
            message: "Not found"
        });
    });

    test("render 404 page cho request thường", () => {
        const err = new Error("Not found");
        err.statusCode = 404;
        errorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.render).toHaveBeenCalledWith("client/pages/errors/404", {
            pageTitle: "404 Not Found"
        });
    });

    test("flash error + redirect cho lỗi 500 request thường", () => {
        const err = new Error("DB Error");
        errorHandler(err, req, res, next);
        expect(req.flash).toHaveBeenCalledWith("error", "Có lỗi hệ thống xảy ra!");
        expect(res.redirect).toHaveBeenCalledWith("back");
    });
});
