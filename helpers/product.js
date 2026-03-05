// Helper: tính giá sau giảm (làm tròn đến hàng nghìn)
module.exports.getDiscountedPrice = (product, variant = null) => {
    let basePrice = product.price;
    if (variant && variant.price > 0) {
        basePrice = variant.price;
    }

    if (product.discountPercentage && product.discountPercentage > 0) {
        return Math.round(basePrice * (1 - product.discountPercentage / 100) / 1000) * 1000;
    }
    return basePrice;
};

// Helper: tính tổng số lượng cart
module.exports.getCartTotalQuantity = (cart) => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
};

// Helper: tính tổng tiền giỏ hàng
module.exports.calculateCartTotal = (cart, products) => {
    let total = 0;
    for (const cartItem of cart) {
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
            let variant = null;
            if (cartItem.variantId && product.variants) {
                variant = product.variants.find(v => v._id.toString() === cartItem.variantId.toString());
            }
            total += module.exports.getDiscountedPrice(product, variant) * cartItem.quantity;
        }
    }
    return total;
};
