document.addEventListener("DOMContentLoaded", function () {
    // 1. Kiểm tra xem trang hiện tại có biến productId (nghĩa là đang ở trang chi tiết sản phẩm)
    // Biến window.currentProductId sẽ được gắn ở cuối file detail.pug
    const currentProductId = window.currentProductId;

    if (currentProductId) {
        let list = [];
        try {
            list = JSON.parse(localStorage.getItem("viewHistory") || "[]");
        } catch (e) {
            console.error("Lỗi parse viewHistory từ localStorage", e);
        }

        // Xóa ID nếu đã tồn tại để đẩy lên đầu
        list = list.filter(function (id) {
            return id !== currentProductId;
        });

        // Thêm vào đầu danh sách
        list.unshift(currentProductId);

        // Giữ tối đa 20 sản phẩm
        if (list.length > 20) list = list.slice(0, 20);

        localStorage.setItem("viewHistory", JSON.stringify(list));
    }

    // 2. Load sản phẩm đã xem (loại trừ sản phẩm hiện tại nếu đang ở trang chi tiết)
    loadRecentlyViewed(currentProductId);
});

function loadRecentlyViewed(excludeProductId) {
    let list = [];
    try {
        list = JSON.parse(localStorage.getItem("viewHistory") || "[]");
    } catch (e) {}

    // Lọc bỏ sản phẩm hiện tại và lấy 6 sản phẩm mới nhất
    let others = list;
    if (excludeProductId) {
        others = list.filter(function (id) {
            return id !== excludeProductId;
        });
    }
    others = others.slice(0, 6);

    const section = document.getElementById("recentlyViewedSection");
    const container = document.getElementById("recentlyViewedList");

    if (others.length === 0 || !section || !container) {
        if (section) section.style.display = "none";
        return;
    }

    // Fetch API lấy thông tin sản phẩm
    fetch("/products/by-ids?ids=" + others.join(","))
        .then(function (res) {
            return res.json();
        })
        .then(function (products) {
            if (!products || products.length === 0) {
                section.style.display = "none";
                return;
            }

            let html = "";
            products.forEach(function (p) {
                let priceHtml = "";
                if (p.discount > 0) {
                    priceHtml = '<div class="text-danger font-weight-bold">' + p.priceNew.toLocaleString("vi-VN") + '₫</div><small class="text-muted"><del>' + p.price.toLocaleString("vi-VN") + '₫</del></small>';
                } else {
                    priceHtml = '<div class="text-danger font-weight-bold">' + p.price.toLocaleString("vi-VN") + '₫</div>';
                }

                html += '<div class="col-lg-2 col-md-3 col-4 mb-3">' +
                    '<a href="/products/detail/' + p.slug + '" class="text-decoration-none">' +
                    '<div class="card border-0 shadow-sm h-100">' +
                    '<img src="' + (p.thumbnail || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop") + '" class="card-img-top p-2" style="height:120px;object-fit:contain;" alt="">' +
                    '<div class="card-body p-2">' +
                    '<div class="small text-dark mb-1" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + p.title + '</div>' +
                    priceHtml +
                    '</div>' +
                    '</div>' +
                    '</a>' +
                    '</div>';
            });

            container.innerHTML = html;
            section.style.display = "block";
        })
        .catch(function (error) {
            console.error("Lỗi khi load sản phẩm đã xem", error);
        });
}
