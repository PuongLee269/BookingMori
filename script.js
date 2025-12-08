// ====== DATA DEMO ======
const bookings = [
    {
        id: 1,
        date: todayOffsetISO(0),
        name: "Nguyễn Văn A",
        start: "08:00",
        end: "10:00",
        notes: "Workshop quay chụp sản phẩm",
        price: 400000,
        hasVAT: false,
        needSupport: false,
        isPaid: false
    },
    {
        id: 2,
        date: todayOffsetISO(0),
        name: "Me.mori Class",
        start: "18:00",
        end: "20:00",
        notes: "Lớp trải nghiệm kể chuyện",
        price: 600000,
        hasVAT: true,
        needSupport: true,
        isPaid: false
    },
    {
        id: 3,
        date: todayOffsetISO(1),
        name: "Team Start-up ABC",
        start: "13:00",
        end: "15:00",
        notes: "Họp chiến lược marketing",
        price: 500000,
        hasVAT: false,
        needSupport: false,
        isPaid: false
    }
];

// danh sách chi phí
const costs = [];

// ====== ELEMENTS ======
const screenBooking = document.getElementById("screen-booking");
const screenBookingDetail = document.getElementById("screen-booking-detail");
const screenFinance = document.getElementById("screen-finance");
const screenProduction = document.getElementById("screen-production");

const tabButtons = document.querySelectorAll(".icon-btn[data-tab]");

const dateListEl = document.getElementById("date-list");
const datePrevBtn = document.getElementById("date-prev");
const dateNextBtn = document.getElementById("date-next");
const bookingListEl = document.getElementById("booking-list");

const backToBookingBtn = document.getElementById("back-to-booking");
const detailNameEl = document.getElementById("detail-name");
const detailTimeEl = document.getElementById("detail-time");
const detailNotesEl = document.getElementById("detail-notes");
const detailPriceEl = document.getElementById("detail-price");
const detailHasVATEl = document.getElementById("detail-has-vat");
const detailNeedSupportEl = document.getElementById("detail-need-support");
const markPaidBtn = document.getElementById("mark-paid-btn");

const revenueAmountEl = document.getElementById("revenue-amount");
const costAmountEl = document.getElementById("cost-amount");
const profitAmountEl = document.getElementById("profit-amount");
const chartPlaceholderEl = document.getElementById("chart-placeholder");

const productionDescEl = document.getElementById("production-desc");
const productionAmountEl = document.getElementById("production-amount");
const productionIsFixedEl = document.getElementById("production-is-fixed");
const addCostBtn = document.getElementById("add-cost-btn");
const costListEl = document.getElementById("cost-list");

const addBookingBtn = document.getElementById("add-booking-btn");

// ====== STATE ======
const TOTAL_DAYS = 14; // số ngày hiển thị trong slider
const VISIBLE_DAYS = 4;

const dates = createDateArray(TOTAL_DAYS);
let startIndex = 0; // index bắt đầu cho thanh trượt
let selectedDateISO = dates[0].iso; // ngày đang chọn
let currentBookingId = null;

// ====== INIT ======
renderDateStrip();
renderBookingList();
updateFinancePanel();
updateChart();

// ====== TAB NAVIGATION ======
tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if (!tab) return;

        tabButtons.forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        showScreen(tab);
    });
});

function showScreen(tab) {
    // mặc định ẩn tất cả
    [screenBooking, screenBookingDetail, screenFinance, screenProduction].forEach(s => s.classList.remove("is-active"));

    if (tab === "booking") {
        screenBooking.classList.add("is-active");
    } else if (tab === "finance") {
        screenFinance.classList.add("is-active");
    } else if (tab === "production") {
        screenProduction.classList.add("is-active");
    }
}

// ====== DATE STRIP RENDER ======
datePrevBtn.addEventListener("click", () => {
    if (startIndex > 0) {
        startIndex--;
        renderDateStrip();
    }
});
dateNextBtn.addEventListener("click", () => {
    if (startIndex + VISIBLE_DAYS < dates.length) {
        startIndex++;
        renderDateStrip();
    }
});

function renderDateStrip() {
    dateListEl.innerHTML = "";
    const slice = dates.slice(startIndex, startIndex + VISIBLE_DAYS);

    slice.forEach(d => {
        const pill = document.createElement("div");
        pill.className = "date-pill";
        if (d.iso === selectedDateISO) pill.classList.add("is-active");
        if (d.isToday) pill.classList.add("is-today");

        pill.innerHTML = `
            <div class="date-pill__number">${d.day}</div>
            <div class="date-pill__weekday">${d.weekdayShort}</div>
            <div class="date-pill__dot"></div>
        `;

        pill.addEventListener("click", () => {
            selectedDateISO = d.iso;
            renderDateStrip();
            renderBookingList();
        });

        dateListEl.appendChild(pill);
    });

    datePrevBtn.disabled = startIndex === 0;
    dateNextBtn.disabled = startIndex + VISIBLE_DAYS >= dates.length;
}

// ====== BOOKING LIST RENDER ======
function renderBookingList() {
    bookingListEl.innerHTML = "";

    const items = bookings.filter(b => b.date === selectedDateISO);

    if (items.length === 0) {
        const empty = document.createElement("div");
        empty.className = "booking-empty";
        empty.textContent = "Chưa có ai đặt phòng ngày này.";
        bookingListEl.appendChild(empty);
        return;
    }

    items.forEach(b => {
        const card = document.createElement("div");
        card.className = "booking-card";
        card.innerHTML = `
            <div class="booking-card__row">
                <div class="booking-card__name">${b.name}</div>
                <div class="booking-card__status ${b.isPaid ? "booking-card__paid" : "booking-card__unpaid"}">
                    ${b.isPaid ? "✔" : "✖"}
                </div>
            </div>
            <div class="booking-card__row">
                <div class="booking-card__time">${b.start} – ${b.end}</div>
                <div class="booking-card__time">${formatCurrency(b.price)}</div>
            </div>
        `;
        card.addEventListener("click", () => openBookingDetail(b.id));
        bookingListEl.appendChild(card);
    });
}

// ====== BOOKING DETAIL ======
function openBookingDetail(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    currentBookingId = id;

    detailNameEl.textContent = booking.name;
    detailTimeEl.textContent = `${booking.start} – ${booking.end}`;
    detailNotesEl.value = booking.notes || "";
    detailPriceEl.value = booking.price || "";
    detailHasVATEl.checked = booking.hasVAT;
    detailNeedSupportEl.checked = booking.needSupport;

    // chuyển sang màn detail nhưng vẫn giữ tab booking đang active
    screenBooking.classList.remove("is-active");
    screenBookingDetail.classList.add("is-active");
}

backToBookingBtn.addEventListener("click", () => {
    screenBookingDetail.classList.remove("is-active");
    screenBooking.classList.add("is-active");
});

// xác nhận thanh toán
markPaidBtn.addEventListener("click", () => {
    if (!currentBookingId) return;
    const booking = bookings.find(b => b.id === currentBookingId);
    if (!booking) return;

    // cập nhật thông tin từ form
    booking.notes = detailNotesEl.value.trim();
    booking.price = Number(detailPriceEl.value) || 0;
    booking.hasVAT = detailHasVATEl.checked;
    booking.needSupport = detailNeedSupportEl.checked;
    booking.isPaid = true;

    // cập nhật UI
    renderBookingList();
    updateFinancePanel();
    updateChart();

    alert("Đã xác nhận thanh toán cho khách này.");
});

// ====== FINANCE PANEL ======
function updateFinancePanel() {
    const revenue = bookings
        .filter(b => b.isPaid)
        .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

    const cost = costs.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    const profit = revenue - cost;

    revenueAmountEl.textContent = formatCurrency(revenue);
    costAmountEl.textContent = formatCurrency(cost);
    profitAmountEl.textContent = formatCurrency(profit);
}

// ====== SIMPLE REVENUE CHART ======
function updateChart() {
    chartPlaceholderEl.innerHTML = "";

    // gom doanh thu theo ngày
    const revenueByDate = {};
    bookings.forEach(b => {
        if (!b.isPaid) return;
        revenueByDate[b.date] = (revenueByDate[b.date] || 0) + (Number(b.price) || 0);
    });

    // max để scale chiều cao
    let maxRevenue = 0;
    Object.values(revenueByDate).forEach(v => { if (v > maxRevenue) maxRevenue = v; });
    if (maxRevenue === 0) maxRevenue = 1;

    dates.slice(0, VISIBLE_DAYS).forEach(d => {
        const value = revenueByDate[d.iso] || 0;
        const heightPercent = Math.round((value / maxRevenue) * 100);

        const bar = document.createElement("div");
        bar.className = "chart-bar";

        const fill = document.createElement("div");
        fill.className = "chart-bar__fill";
        fill.style.height = `${heightPercent}%`;

        const label = document.createElement("div");
        label.className = "chart-bar__label";
        label.textContent = d.day;

        bar.appendChild(fill);
        bar.appendChild(label);
        chartPlaceholderEl.appendChild(bar);
    });
}

// ====== PRODUCTION / COST ======
addCostBtn.addEventListener("click", () => {
    const desc = productionDescEl.value.trim();
    const amount = Number(productionAmountEl.value);

    if (!desc) {
        alert("Nhập nội dung chi phí.");
        productionDescEl.focus();
        return;
    }
    if (!amount || amount <= 0) {
        alert("Nhập số tiền chi phí hợp lệ.");
        productionAmountEl.focus();
        return;
    }

    const costItem = {
        id: Date.now(),
        desc,
        amount,
        isFixed: productionIsFixedEl.checked,
        date: todayOffsetISO(0)
    };

    costs.push(costItem);

    productionDescEl.value = "";
    productionAmountEl.value = "";
    productionIsFixedEl.checked = false;

    renderCostList();
    updateFinancePanel();
});

function renderCostList() {
    costListEl.innerHTML = "";
    if (costs.length === 0) return;

    costs.forEach(c => {
        const li = document.createElement("li");
        li.className = "cost-item";
        li.innerHTML = `
            <span class="cost-item__label">${c.desc}</span>
            <span class="cost-item__value">${formatCurrency(c.amount)}</span>
        `;
        costListEl.appendChild(li);
    });
}

// ====== HELPER FUNCTIONS ======
function todayOffsetISO(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
}

function createDateArray(totalDays) {
    const arr = [];
    const weekdays = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
    const todayISO = todayOffsetISO(0);

    for (let i = 0; i < totalDays; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const iso = d.toISOString().slice(0, 10);
        arr.push({
            iso,
            day: d.getDate(),
            weekdayShort: weekdays[d.getDay()].replace("Thứ ", "T").replace("Chủ nhật", "CN"),
            isToday: iso === todayISO
        });
    }
    return arr;
}

function formatCurrency(value) {
    return (Number(value) || 0).toLocaleString("vi-VN") + " đ";
}

// demo: nút + chỉ báo
addBookingBtn.addEventListener("click", () => {
    alert("Bản demo: Nút + sẽ được nối với Google Form / Trang tính ở bước sau.");
});
