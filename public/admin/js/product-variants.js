// Product Variants — Dynamic form rows
// Thêm/xóa biến thể sản phẩm trong form create/edit

function addVariantRow() {
    var container = document.getElementById("variantsContainer");
    if (!container) return;

    var index = container.querySelectorAll(".variant-row").length;

    var row = document.createElement("div");
    row.className = "variant-row";
    row.setAttribute("data-index", index);

    row.innerHTML =
        '<div class="variant-row-fields">' +
            '<div class="variant-field">' +
                '<input class="form-input variant-input" type="text" name="variantName" placeholder="Tên (VD: Màu)">' +
            '</div>' +
            '<div class="variant-field">' +
                '<input class="form-input variant-input" type="text" name="variantValue" placeholder="Giá trị (VD: Đỏ)">' +
            '</div>' +
            '<div class="variant-field">' +
                '<input class="form-input variant-input" type="text" name="variantPrice" placeholder="Giá">' +
            '</div>' +
            '<div class="variant-field">' +
                '<input class="form-input variant-input" type="text" name="variantStock" placeholder="Tồn kho">' +
            '</div>' +
            '<div class="variant-field">' +
                '<input class="form-input variant-input" type="text" name="variantSku" placeholder="SKU">' +
            '</div>' +
        '</div>' +
        '<button class="btn-remove-variant" type="button" onclick="removeVariantRow(this)" title="Xóa biến thể">' +
            '<i class="fas fa-trash-alt"></i>' +
        '</button>';

    container.appendChild(row);

    // Animation
    row.style.opacity = "0";
    row.style.transform = "translateY(-8px)";
    setTimeout(function () {
        row.style.transition = "all 0.2s ease";
        row.style.opacity = "1";
        row.style.transform = "translateY(0)";
    }, 10);
}

function removeVariantRow(btn) {
    var row = btn.closest(".variant-row");
    if (!row) return;

    row.style.transition = "all 0.2s ease";
    row.style.opacity = "0";
    row.style.transform = "translateY(-8px)";
    setTimeout(function () {
        row.remove();
    }, 200);
}
