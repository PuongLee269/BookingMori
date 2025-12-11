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
const bookingModalOverlay = document.getElementById("booking-modal-overlay");
const bookingModalClose = document.getElementById("booking-modal-close");
const bookingModalCancel = document.getElementById("booking-modal-cancel");
const bookingForm = document.getElementById("booking-form");
const modalSelectedDateEl = document.getElementById("modal-selected-date");
const newNameEl = document.getElementById("new-name");
const newStartEl = document.getElementById("new-start");
const newEndEl = document.getElementById("new-end");
const newNotesEl = document.getElementById("new-notes");
const newPriceEl = document.getElementById("new-price");
const newHasVATEl = document.getElementById("new-has-vat");
const newNeedSupportEl = document.getElementById("new-need-support");
const newIsPaidEl = document.getElementById("new-is-paid");
const newRepeatEnabledEl = document.getElementById("new-repeat-enabled");
const newRepeatPanel = document.getElementById("repeat-panel");
const newRepeatIntervalEl = document.getElementById("new-repeat-interval");
const newRepeatCountEl = document.getElementById("new-repeat-count");
const newRepeatStartEl = document.getElementById("new-repeat-start");
const newRepeatEndEl = document.getElementById("new-repeat-end");
const repeatDayListEl = document.getElementById("repeat-day-list");

// ====== STATE ======
// Số ô hiển thị trên thanh ngày
const VISIBLE_DAYS = 4;

// stripOffset = ô đầu tiên lệch bao nhiêu ngày so với HÔM NAY
// 0 = hôm nay, 1 = ngày mai, -1 = hôm qua, ...
let stripOffset = 0;

// ngày đang chọn (dùng ISO yyyy-mm-dd)
let selectedDateISO = todayOffsetISO(0);

// id booking đang xem chi tiết
let currentBookingId = null;

// bảng thứ
const WEEKDAYS = [
    "CN", "T2", "T3", "T4", "T5", "T6", "T7"
];

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
    [screenBooking, screenBookingDetail, screenFinance, screenProduction]
        .forEach(s => s.classList.remove("is-active"));

    if (tab === "booking") {
        screenBooking.classList.add("is-active");
    } else if (tab === "finance") {
        screenFinance.classList.add("is-active");
    } else if (tab === "production") {
        screenProduction.classList.add("is-active");
    }
}

// ====== DATE STRIP (KHÔNG GIỚI HẠN) ======
datePrevBtn.addEventListener("click", () => {
    stripOffset--;          // lùi 1 ngày
    renderDateStrip();
    // nếu selectedDate đang ngoài 4 ô hiển thị thì auto chọn ô đầu
    ensureSelectedDateVisible();
    renderBookingList();
});

dateNextBtn.addEventListener("click", () => {
    stripOffset++;          // tiến 1 ngày
    renderDateStrip();
    ensureSelectedDateVisible();
    renderBookingList();
});

function renderDateStrip() {
    dateListEl.innerHTML = "";

    for (let i = 0; i < VISIBLE_DAYS; i++) {
        const info = getDateInfoFromOffset(stripOffset + i);
        const pill = document.createElement("div");
        pill.className = "date-pill";
        if (info.iso === selectedDateISO) pill.classList.add("is-active");
        if (info.isToday) pill.classList.add("is-today");

        pill.innerHTML = `
            <div class="date-pill__number">${info.day}</div>
            <div class="date-pill__weekday">${info.weekdayShort}</div>
            <div class="date-pill__dot"></div>
        `;

        pill.addEventListener("click", () => {
            selectedDateISO = info.iso;
            renderDateStrip();
            renderBookingList();
        });

        dateListEl.appendChild(pill);
    }

    // không disable mũi tên nữa → vô hạn theo cảm nhận người dùng
    datePrevBtn.disabled = false;
    dateNextBtn.disabled = false;
}

// Khi kéo thanh ngày quá xa, đảm bảo selectedDate vẫn nằm trong 4 ô;
// nếu không thì set selectedDate = ô đầu tiên
function ensureSelectedDateVisible() {
    let isVisible = false;
    for (let i = 0; i < VISIBLE_DAYS; i++) {
        const info = getDateInfoFromOffset(stripOffset + i);
        if (info.iso === selectedDateISO) {
            isVisible = true;
            break;
        }
    }
    if (!isVisible) {
        const first = getDateInfoFromOffset(stripOffset);
        selectedDateISO = first.iso;
    }
}

// ====== NEW BOOKING MODAL ======
function openBookingModal() {
    modalSelectedDateEl.textContent = selectedDateISO;
    bookingForm.reset();
    toggleRepeatPanel(false);
    syncRepeatDaySelection();
    bookingModalOverlay.classList.add("is-open");
    newNameEl.focus();
}

function closeBookingModal() {
    bookingModalOverlay.classList.remove("is-open");
}

newRepeatEnabledEl?.addEventListener("change", () => toggleRepeatPanel());

if (repeatDayListEl) {
    repeatDayListEl.querySelectorAll(".day-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            chip.classList.toggle("is-selected");
        });
    });
}

function toggleRepeatPanel(forceState) {
    if (!newRepeatPanel || !newRepeatEnabledEl) return;
    const isActive = typeof forceState === "boolean" ? forceState : newRepeatEnabledEl.checked;
    newRepeatEnabledEl.checked = isActive;
    newRepeatPanel.classList.toggle("is-hidden", !isActive);
    newRepeatPanel.classList.toggle("is-active", isActive);

    if (isActive) {
        if (!newRepeatStartEl.value) newRepeatStartEl.value = newStartEl.value;
        if (!newRepeatEndEl.value) newRepeatEndEl.value = newEndEl.value;
        if (getSelectedWeekdays().length === 0) {
            syncRepeatDaySelection();
        }
    }
}

function syncRepeatDaySelection() {
    if (!repeatDayListEl) return;
    const targetWeekday = new Date(selectedDateISO).getDay();
    repeatDayListEl.querySelectorAll(".day-chip").forEach(btn => {
        const value = Number(btn.dataset.weekday);
        btn.classList.toggle("is-selected", value === targetWeekday);
    });
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

    screenBooking.classList.remove("is-active");
    screenBookingDetail.classList.add("is-active");
}

backToBookingBtn.addEventListener("click", () => {
    screenBookingDetail.classList.remove("is-active");
    screenBooking.classList.add("is-active");
});

markPaidBtn.addEventListener("click", () => {
    if (!currentBookingId) return;
    const booking = bookings.find(b => b.id === currentBookingId);
    if (!booking) return;

    booking.notes = detailNotesEl.value.trim();
    booking.price = Number(detailPriceEl.value) || 0;
    booking.hasVAT = detailHasVATEl.checked;
    booking.needSupport = detailNeedSupportEl.checked;
    booking.isPaid = true;

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

    let maxRevenue = 0;
    Object.values(revenueByDate).forEach(v => { if (v > maxRevenue) maxRevenue = v; });
    if (maxRevenue === 0) maxRevenue = 1;

    // vẽ 4 cột doanh thu từ hôm nay trở đi
    const chartDates = [];
    for (let i = 0; i < VISIBLE_DAYS; i++) {
        chartDates.push(getDateInfoFromOffset(i));
    }

    chartDates.forEach(d => {
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

// tính thông tin 1 ngày dựa trên offset so với hôm nay
function getDateInfoFromOffset(offset) {
    const base = new Date();
    base.setHours(0,0,0,0);
    base.setDate(base.getDate() + offset);

    const iso = base.toISOString().slice(0,10);
    const todayISO = todayOffsetISO(0);

    return {
        iso,
        day: base.getDate(),
        weekdayShort: WEEKDAYS[base.getDay()],
        isToday: iso === todayISO
    };
}

function formatCurrency(value) {
    return (Number(value) || 0).toLocaleString("vi-VN") + " đ";
}

// open/close modal
addBookingBtn.addEventListener("click", openBookingModal);
bookingModalClose.addEventListener("click", closeBookingModal);
bookingModalCancel.addEventListener("click", closeBookingModal);
bookingModalOverlay.addEventListener("click", (e) => {
    if (e.target === bookingModalOverlay) closeBookingModal();
});

bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = newNameEl.value.trim();
    const start = newStartEl.value;
    const end = newEndEl.value;
    const price = Number(newPriceEl.value);

    if (!name) {
        alert("Vui lòng nhập tên khách/đơn vị.");
        newNameEl.focus();
        return;
    }
    if (!start || !end) {
        alert("Vui lòng chọn đầy đủ khung giờ.");
        if (!start) newStartEl.focus();
        else newEndEl.focus();
        return;
    }
    if (end <= start) {
        alert("Giờ kết thúc phải sau giờ bắt đầu.");
        newEndEl.focus();
        return;
    }
    if (!price || price <= 0) {
        alert("Nhập số tiền hợp lệ.");
        newPriceEl.focus();
        return;
    }

    const repeatEnabled = Boolean(newRepeatEnabledEl?.checked);
    const repeatWeeks = Math.max(0, Number(newRepeatCountEl?.value) || 0);
    const repeatInterval = Math.max(1, Number(newRepeatIntervalEl?.value) || 1);
    const repeatStart = newRepeatStartEl?.value || start;
    const repeatEnd = newRepeatEndEl?.value || end;
    const selectedWeekdays = getSelectedWeekdays();
    if (repeatEnabled && repeatWeeks === 0) {
        alert("Nhập số tuần muốn tạo lịch lặp.");
        newRepeatCountEl?.focus();
        return;
    }
    if (repeatEnabled && (!repeatStart || !repeatEnd)) {
        alert("Nhập đầy đủ giờ bắt đầu/kết thúc cho chu kỳ lặp.");
        newRepeatStartEl?.focus();
        return;
    }
    if (repeatEnabled && repeatEnd <= repeatStart) {
        alert("Giờ kết thúc lặp phải sau giờ bắt đầu lặp.");
        newRepeatEndEl?.focus();
        return;
    }
    if (repeatEnabled && selectedWeekdays.length === 0) {
        alert("Chọn ít nhất một thứ trong tuần để lặp lịch.");
        repeatDayListEl?.querySelector(".day-chip")?.focus?.();
        return;
    }

    const baseBooking = {
        id: Date.now(),
        date: selectedDateISO,
        name,
        start,
        end,
        notes: newNotesEl.value.trim(),
        price,
        hasVAT: newHasVATEl.checked,
        needSupport: newNeedSupportEl.checked,
        isPaid: newIsPaidEl.checked
    };

    const bookingsToAdd = buildRecurringBookings(baseBooking, {
        enabled: repeatEnabled,
        weeksCount: repeatWeeks,
        interval: repeatInterval,
        repeatStart,
        repeatEnd,
        weekdays: selectedWeekdays
    });

    const conflict = bookingsToAdd.find(b => hasTimeConflict(b, [...bookings, ...bookingsToAdd.filter(x => x !== b)]));
    if (conflict) {
        alert(`Trùng giờ với lịch đã có vào ${conflict.date}. Vui lòng chọn giờ khác.`);
        return;
    }

    bookings.push(...bookingsToAdd);
    closeBookingModal();
    renderBookingList();
    updateFinancePanel();
    updateChart();
});

function getSelectedWeekdays() {
    if (!repeatDayListEl) return [];
    const selected = Array.from(repeatDayListEl.querySelectorAll(".day-chip.is-selected"))
        .map(btn => Number(btn.dataset.weekday));
    return selected;
}

function buildRecurringBookings(baseBooking, options = {}) {
    const { enabled, weeksCount = 0, interval = 1, repeatStart, repeatEnd, weekdays = [] } = options;
    const list = [baseBooking];

    if (!enabled || weeksCount === 0) return list;

    const baseDate = new Date(baseBooking.date);
    const normalizedDays = weekdays.length > 0 ? weekdays : [baseDate.getDay()];
    const dates = generateWeeklyDatesForDays(baseDate, normalizedDays, weeksCount, interval);

    dates.forEach((date, idx) => {
        list.push({
            ...baseBooking,
            id: baseBooking.id + idx + 1,
            date,
            start: repeatStart || baseBooking.start,
            end: repeatEnd || baseBooking.end
        });
    });

    return list;
}

function generateWeeklyDatesForDays(baseDate, weekdays, weeksCount, interval) {
    const dates = [];
    const baseWeekday = baseDate.getDay();

    for (let i = 0; i < weeksCount; i++) {
        const weekShift = (i + 1) * interval * 7;
        weekdays.forEach(day => {
            const diff = (day - baseWeekday + 7) % 7;
            const target = new Date(baseDate);
            target.setDate(baseDate.getDate() + weekShift + diff);
            dates.push(target.toISOString().slice(0, 10));
        });
    }

    return dates;
}

function hasTimeConflict(booking, existingList) {
    return existingList.some(b => {
        if (b.date !== booking.date || b.id === booking.id) return false;
        const startA = timeToMinutes(booking.start);
        const endA = timeToMinutes(booking.end);
        const startB = timeToMinutes(b.start);
        const endB = timeToMinutes(b.end);

        return startA < endB && endA > startB;
    });
}

function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
}
