// Dashboard Charts - Chart.js Integration
// Sử dụng AJAX fetch chart data từ API /admin/dashboard/chart-data

document.addEventListener("DOMContentLoaded", function () {
    const prefixAdmin = "/admin";

    // Chart.js global defaults — đồng bộ font với project
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.color = "#7e8299";
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyleWidth = 8;
    Chart.defaults.plugins.legend.labels.padding = 16;

    // Format VND
    function formatVND(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + "M";
        }
        if (value >= 1000) {
            return (value / 1000).toFixed(0) + "K";
        }
        return value.toLocaleString("vi-VN");
    }

    // Tooltip callback format VND
    function tooltipVND(context) {
        var value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
        return context.dataset.label + ": " + value.toLocaleString("vi-VN") + " ₫";
    }

    // Fetch data & render
    fetch(prefixAdmin + "/dashboard/chart-data")
        .then(function (res) { return res.json(); })
        .then(function (result) {
            if (result.code !== 200) return;
            var data = result.data;

            renderDailyRevenueChart(data.dailyRevenue);
            renderMonthlyRevenueChart(data.monthlyRevenue);
            renderOrderStatusChart(data.orderStatus);
            renderTopProductsChart(data.topProducts);
            renderPaymentMethodChart(data.paymentMethod);
        })
        .catch(function (err) {
            console.log("Dashboard chart error:", err);
        });

    // --- Chart 1: Doanh thu 7 ngày (Line + Bar) ---
    function renderDailyRevenueChart(daily) {
        var ctx = document.getElementById("dailyRevenueChart");
        if (!ctx) return;

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: daily.labels,
                datasets: [
                    {
                        label: "Doanh thu",
                        data: daily.data,
                        backgroundColor: "rgba(62, 151, 255, 0.15)",
                        borderColor: "#3e97ff",
                        borderWidth: 2,
                        borderRadius: 4,
                        order: 2
                    },
                    {
                        label: "Đơn hàng",
                        data: daily.orderCount,
                        type: "line",
                        borderColor: "#50cd89",
                        backgroundColor: "rgba(80, 205, 137, 0.1)",
                        pointBackgroundColor: "#50cd89",
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 2,
                        tension: 0.3,
                        fill: false,
                        yAxisID: "y1",
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: "index",
                    intersect: false
                },
                plugins: {
                    legend: { position: "top" },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                if (context.dataset.label === "Doanh thu") {
                                    return "Doanh thu: " + context.parsed.y.toLocaleString("vi-VN") + " ₫";
                                }
                                return "Đơn hàng: " + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        position: "left",
                        grid: { color: "rgba(0,0,0,0.04)" },
                        ticks: {
                            callback: function (value) { return formatVND(value); },
                            font: { size: 11 }
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: "right",
                        grid: { drawOnChartArea: false },
                        ticks: {
                            stepSize: 1,
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }

    // --- Chart 2: Doanh thu 12 tháng (Area) ---
    function renderMonthlyRevenueChart(monthly) {
        var ctx = document.getElementById("monthlyRevenueChart");
        if (!ctx) return;

        new Chart(ctx, {
            type: "line",
            data: {
                labels: monthly.labels,
                datasets: [
                    {
                        label: "Doanh thu",
                        data: monthly.data,
                        borderColor: "#3e97ff",
                        backgroundColor: function (context) {
                            var chart = context.chart;
                            var ctx2 = chart.ctx;
                            var area = chart.chartArea;
                            if (!area) return "rgba(62, 151, 255, 0.1)";
                            var gradient = ctx2.createLinearGradient(0, area.top, 0, area.bottom);
                            gradient.addColorStop(0, "rgba(62, 151, 255, 0.2)");
                            gradient.addColorStop(1, "rgba(62, 151, 255, 0.01)");
                            return gradient;
                        },
                        pointBackgroundColor: "#3e97ff",
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: "Đơn hàng",
                        data: monthly.orderCount,
                        borderColor: "#7239ea",
                        backgroundColor: "transparent",
                        pointBackgroundColor: "#7239ea",
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: false,
                        yAxisID: "y1"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: "index",
                    intersect: false
                },
                plugins: {
                    legend: { position: "top" },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                if (context.dataset.label === "Doanh thu") {
                                    return "Doanh thu: " + context.parsed.y.toLocaleString("vi-VN") + " ₫";
                                }
                                return "Đơn hàng: " + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    },
                    y: {
                        beginAtZero: true,
                        position: "left",
                        grid: { color: "rgba(0,0,0,0.04)" },
                        ticks: {
                            callback: function (value) { return formatVND(value); },
                            font: { size: 11 }
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: "right",
                        grid: { drawOnChartArea: false },
                        ticks: {
                            stepSize: 1,
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }

    // --- Chart 3: Trạng thái đơn hàng (Doughnut) ---
    function renderOrderStatusChart(orderStatus) {
        var ctx = document.getElementById("orderStatusChart");
        if (!ctx) return;

        new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: orderStatus.labels,
                datasets: [
                    {
                        data: orderStatus.data,
                        backgroundColor: orderStatus.colors,
                        borderWidth: 0,
                        hoverOffset: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "65%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: { size: 11 },
                            padding: 12
                        }
                    }
                }
            }
        });
    }

    // --- Chart 4: Top sản phẩm bán chạy (Horizontal Bar) ---
    function renderTopProductsChart(topProducts) {
        var ctx = document.getElementById("topProductsChart");
        if (!ctx) return;

        var labels = topProducts.map(function (p) {
            var title = p.title || "Không tên";
            return title.length > 20 ? title.substring(0, 20) + "..." : title;
        });
        var soldData = topProducts.map(function (p) { return p.totalSold; });
        var colors = ["#3e97ff", "#50cd89", "#f9a825", "#7239ea", "#f1416c"];

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Đã bán",
                        data: soldData,
                        backgroundColor: colors.slice(0, topProducts.length),
                        borderRadius: 4,
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return "Đã bán: " + context.parsed.x + " sản phẩm";
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: "rgba(0,0,0,0.04)" },
                        ticks: {
                            stepSize: 1,
                            font: { size: 11 }
                        }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    }
                }
            }
        });
    }

    // --- Chart 5: Phương thức thanh toán (Pie) ---
    function renderPaymentMethodChart(paymentMethod) {
        var ctx = document.getElementById("paymentMethodChart");
        if (!ctx) return;

        new Chart(ctx, {
            type: "pie",
            data: {
                labels: paymentMethod.labels,
                datasets: [
                    {
                        data: paymentMethod.data,
                        backgroundColor: paymentMethod.colors,
                        borderWidth: 2,
                        borderColor: "#ffffff",
                        hoverOffset: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: { size: 11 },
                            padding: 12
                        }
                    }
                }
            }
        });
    }
});
