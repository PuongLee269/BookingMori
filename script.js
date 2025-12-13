// ====== DATA DEMO ======
const DEFAULT_BOOKINGS = [
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

const DEFAULT_PRICING = {
    oddHourPrice: 200000,
    recurringRules: {
        range10to20: 180000,
        range20to40: 150000,
        rangeOver40: 120000
    }
};

let bookings = [];
let costs = [];
let pricingConfig = cloneData(DEFAULT_PRICING);

// ====== ELEMENTS ======
const screenBooking = document.getElementById("screen-booking");
const screenBookingDetail = document.getElementById("screen-booking-detail");
const screenFinance = document.getElementById("screen-finance");
const screenProduction = document.getElementById("screen-production");
const screenSettings = document.getElementById("screen-settings");

const tabButtons = document.querySelectorAll(".icon-btn[data-tab]");

const dateListEl = document.getElementById("date-list");
const datePrevBtn = document.getElementById("date-prev");
const dateNextBtn = document.getElementById("date-next");
const dateTodayBtn = document.getElementById("date-today");
const monthGridEl = document.getElementById("month-grid");
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
const priceRuleSelect = document.getElementById("price-rule-select");
const priceAutoInfoEl = document.getElementById("price-auto-info");
const newHasVATEl = document.getElementById("new-has-vat");
const newNeedSupportEl = document.getElementById("new-need-support");
const newIsPaidEl = document.getElementById("new-is-paid");
const newRepeatEnabledEl = document.getElementById("new-repeat-enabled");
const newRepeatPanel = document.getElementById("repeat-panel");
const newRepeatIntervalEl = document.getElementById("new-repeat-interval");
const newRepeatUnitEl = document.getElementById("new-repeat-unit");
const newRepeatStartEl = document.getElementById("new-repeat-start");
const newRepeatEndEl = document.getElementById("new-repeat-end");
const repeatDayListEl = document.getElementById("repeat-day-list");
const repeatDaysWrapper = document.getElementById("repeat-days");
const repeatEndRadios = document.querySelectorAll("input[name='repeat-end']");
const repeatEndDateEl = document.getElementById("repeat-end-date");
const repeatEndCountEl = document.getElementById("repeat-end-count");
const clearDataBtn = document.getElementById("clear-data-btn");
const settingOddPriceEl = document.getElementById("setting-odd-price");
const settingRange10to20El = document.getElementById("setting-range-10-20");
const settingRange20to40El = document.getElementById("setting-range-20-40");
const settingRangeOver40El = document.getElementById("setting-range-over-40");

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

const STORAGE_KEYS = {
    bookings: "bm_bookings",
    costs: "bm_costs",
    pricing: "bm_pricing"
};

const REPEAT_MAX_OCCURRENCES = 24;
const REPEAT_DEFAULT_COUNT = 6;
let lastValidRepeatCount = REPEAT_DEFAULT_COUNT;

// ====== INIT ======
initApp();

function initApp() {
    loadPersistedData();
    renderDateStrip();
    renderMonthGrid();
    renderBookingList();
    renderCostList();
    renderPricingSettings();
    updateFinancePanel();
    updateChart();
}

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
    [screenBooking, screenBookingDetail, screenFinance, screenProduction, screenSettings]
        .forEach(s => s?.classList.remove("is-active"));

    if (tab === "booking") {
        screenBooking.classList.add("is-active");
    } else if (tab === "finance") {
        screenFinance.classList.add("is-active");
    } else if (tab === "production") {
        screenProduction.classList.add("is-active");
    } else if (tab === "settings") {
        screenSettings?.classList.add("is-active");
    }
}

function loadPersistedData() {
    bookings = readFromStorage(STORAGE_KEYS.bookings, DEFAULT_BOOKINGS);
    costs = readFromStorage(STORAGE_KEYS.costs, []);
    const storedPricing = readFromStorage(STORAGE_KEYS.pricing, DEFAULT_PRICING) || {};
    pricingConfig = {
        oddHourPrice: storedPricing.oddHourPrice ?? DEFAULT_PRICING.oddHourPrice,
        recurringRules: {
            range10to20: storedPricing.recurringRules?.range10to20 ?? DEFAULT_PRICING.recurringRules.range10to20,
            range20to40: storedPricing.recurringRules?.range20to40 ?? DEFAULT_PRICING.recurringRules.range20to40,
            rangeOver40: storedPricing.recurringRules?.rangeOver40 ?? DEFAULT_PRICING.recurringRules.rangeOver40
        }
    };
}

// ====== DATE STRIP (KHÔNG GIỚI HẠN) ======
datePrevBtn.addEventListener("click", () => {
    stripOffset--;          // lùi 1 ngày
    renderDateStrip();
    // nếu selectedDate đang ngoài 4 ô hiển thị thì auto chọn ô đầu
    ensureSelectedDateVisible();
    renderBookingList();
    renderMonthGrid();
});

dateNextBtn.addEventListener("click", () => {
    stripOffset++;          // tiến 1 ngày
    renderDateStrip();
    ensureSelectedDateVisible();
    renderBookingList();
    renderMonthGrid();
});

dateTodayBtn?.addEventListener("click", () => {
    stripOffset = 0;
    selectedDateISO = todayOffsetISO(0);
    renderDateStrip();
    renderBookingList();
    renderMonthGrid();
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
            renderMonthGrid();
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

// ====== MONTH GRID ======
function renderMonthGrid() {
    if (!monthGridEl) return;

    monthGridEl.innerHTML = "";

    const base = parseLocalDateFromISO(selectedDateISO);
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayISO = todayOffsetISO(0);

    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const bookingCounts = bookings.reduce((acc, b) => {
        if (b.date.startsWith(monthKey)) {
            acc[b.date] = (acc[b.date] || 0) + 1;
        }
        return acc;
    }, {});

    for (let i = 0; i < startWeekday; i++) {
        const placeholder = document.createElement("div");
        placeholder.className = "month-cell is-muted";
        monthGridEl.appendChild(placeholder);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const iso = `${monthKey}-${String(day).padStart(2, "0")}`;
        const cell = document.createElement("div");
        cell.className = "month-cell";

        if (iso === todayISO) cell.classList.add("is-today");
        if (iso === selectedDateISO) cell.classList.add("is-selected");

        const count = bookingCounts[iso];
        if (count) {
            const badge = document.createElement("div");
            badge.className = "month-cell__badge";
            badge.textContent = count;
            cell.appendChild(badge);
        }

        const label = document.createElement("div");
        label.className = "month-cell__day";
        label.textContent = day;
        cell.appendChild(label);

        cell.addEventListener("click", () => {
            selectedDateISO = iso;
            stripOffset = diffDaysFromToday(iso);
            renderDateStrip();
            renderBookingList();
            renderMonthGrid();
        });

        monthGridEl.appendChild(cell);
    }
}

// ====== NEW BOOKING MODAL ======
function openBookingModal() {
    modalSelectedDateEl.textContent = selectedDateISO;
    bookingForm.reset();
    if (priceRuleSelect) priceRuleSelect.value = "auto";
    resetRepeatControls();
    toggleRepeatPanel(false);
    bookingModalOverlay.classList.add("is-open");
    newNameEl.focus();
    updatePriceSuggestion();
}

function closeBookingModal() {
    bookingModalOverlay.classList.remove("is-open");
}

function resetRepeatControls() {
    if (newRepeatIntervalEl) newRepeatIntervalEl.value = 1;
    if (newRepeatUnitEl) newRepeatUnitEl.value = "week";
    if (newRepeatStartEl) newRepeatStartEl.value = newStartEl.value;
    if (newRepeatEndEl) newRepeatEndEl.value = newEndEl.value;
    if (repeatEndCountEl) repeatEndCountEl.value = REPEAT_DEFAULT_COUNT;
    lastValidRepeatCount = REPEAT_DEFAULT_COUNT;
    if (repeatEndDateEl) repeatEndDateEl.value = "";
    repeatEndRadios?.forEach(r => { r.checked = r.value === "none"; });
    syncRepeatDaySelection();
    updateRepeatUnitState();
    updateRepeatEndInputs();
    setRepeatCountErrorState(false);
}

newRepeatEnabledEl?.addEventListener("change", () => toggleRepeatPanel());
newStartEl?.addEventListener("change", () => { syncRepeatTimesFromMain(); updatePriceSuggestion(); });
newEndEl?.addEventListener("change", () => { syncRepeatTimesFromMain(); updatePriceSuggestion(); });
newRepeatIntervalEl?.addEventListener("input", () => updatePriceSuggestion());
newRepeatUnitEl?.addEventListener("change", () => {
    updateRepeatUnitState();
    updatePriceSuggestion();
});
repeatEndRadios?.forEach(radio => radio.addEventListener("change", updateRepeatEndInputs));
repeatEndCountEl?.addEventListener("input", () => handleRepeatCountInput());
repeatEndDateEl?.addEventListener("change", () => updatePriceSuggestion());
priceRuleSelect?.addEventListener("change", () => updatePriceSuggestion(true));

[settingOddPriceEl, settingRange10to20El, settingRange20to40El, settingRangeOver40El]
    .forEach(el => el?.addEventListener("input", handlePricingInputChange));

if (repeatDayListEl) {
    repeatDayListEl.querySelectorAll(".day-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            chip.classList.toggle("is-selected");
            updatePriceSuggestion();
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
        syncRepeatTimesFromMain(true);
        if (getSelectedWeekdays().length === 0) {
            syncRepeatDaySelection();
        }
        updateRepeatUnitState();
        updateRepeatEndInputs();
    }

    updatePriceSuggestion();
}

function syncRepeatDaySelection() {
    if (!repeatDayListEl) return;
    const targetWeekday = parseLocalDateFromISO(selectedDateISO).getDay();
    repeatDayListEl.querySelectorAll(".day-chip").forEach(btn => {
        const value = Number(btn.dataset.weekday);
        btn.classList.toggle("is-selected", value === targetWeekday);
    });
}

function updateRepeatUnitState() {
    const unit = newRepeatUnitEl?.value || "week";
    const isWeekly = unit === "week";
    repeatDaysWrapper?.classList.toggle("is-hidden", !isWeekly);
}

function getSelectedRepeatEndType() {
    const selected = Array.from(repeatEndRadios || []).find(r => r.checked);
    return selected?.value || "none";
}

function updateRepeatEndInputs() {
    const type = getSelectedRepeatEndType();
    if (repeatEndDateEl) repeatEndDateEl.disabled = type !== "until";
    if (repeatEndCountEl) repeatEndCountEl.disabled = type !== "count";
    if (type !== "count") {
        setRepeatCountErrorState(false);
    } else {
        handleRepeatCountInput();
    }
    updatePriceSuggestion();
}

function handleRepeatCountInput() {
    const isCountType = getSelectedRepeatEndType() === "count";
    const { isInvalid } = normalizeRepeatCountInput();
    setRepeatCountErrorState(isCountType && isInvalid);
    updatePriceSuggestion();
}

function normalizeRepeatCountInput() {
    if (!repeatEndCountEl) return { value: lastValidRepeatCount, isInvalid: false };

    const rawValue = repeatEndCountEl.value?.trim();
    if (!rawValue) {
        return { value: lastValidRepeatCount, isInvalid: true };
    }
    const parsed = Number(rawValue);
    const isWholeNumber = Number.isInteger(parsed);

    if (isWholeNumber && parsed >= 1) {
        lastValidRepeatCount = parsed;
        repeatEndCountEl.value = String(parsed);
        return { value: parsed, isInvalid: false };
    }

    if (isWholeNumber && parsed < 1) {
        lastValidRepeatCount = 1;
        repeatEndCountEl.value = "1";
        return { value: 1, isInvalid: false };
    }

    return { value: lastValidRepeatCount, isInvalid: true };
}

function setRepeatCountErrorState(hasError) {
    if (!repeatEndCountEl) return;
    repeatEndCountEl.classList.toggle("is-invalid", hasError);
    if (hasError) {
        repeatEndCountEl.setAttribute("aria-invalid", "true");
    } else {
        repeatEndCountEl.removeAttribute("aria-invalid");
    }
}

function renderPricingSettings() {
    if (settingOddPriceEl) settingOddPriceEl.value = pricingConfig.oddHourPrice || "";
    if (settingRange10to20El) settingRange10to20El.value = pricingConfig.recurringRules?.range10to20 || "";
    if (settingRange20to40El) settingRange20to40El.value = pricingConfig.recurringRules?.range20to40 || "";
    if (settingRangeOver40El) settingRangeOver40El.value = pricingConfig.recurringRules?.rangeOver40 || "";
}

function handlePricingInputChange() {
    pricingConfig = {
        oddHourPrice: safePriceValue(settingOddPriceEl?.value, pricingConfig.oddHourPrice),
        recurringRules: {
            range10to20: safePriceValue(settingRange10to20El?.value, pricingConfig.recurringRules?.range10to20),
            range20to40: safePriceValue(settingRange20to40El?.value, pricingConfig.recurringRules?.range20to40),
            rangeOver40: safePriceValue(settingRangeOver40El?.value, pricingConfig.recurringRules?.rangeOver40)
        }
    };

    persistPricing();
    updatePriceSuggestion();
}

function safePriceValue(value, fallback = 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    return Math.max(0, fallback || 0);
}

function calculateDurationHours(start, end) {
    const diffMinutes = timeToMinutes(end) - timeToMinutes(start);
    return diffMinutes > 0 ? diffMinutes / 60 : 0;
}

function buildRepeatOptionsSnapshot(start, end) {
    const repeatEnabled = Boolean(newRepeatEnabledEl?.checked);
    const repeatInterval = Math.max(1, Number(newRepeatIntervalEl?.value) || 1);
    const repeatUnit = newRepeatUnitEl?.value || "week";
    const repeatStart = newRepeatStartEl?.value || start;
    const repeatEnd = newRepeatEndEl?.value || end;
    const repeatEndType = getSelectedRepeatEndType();
    const repeatEndDate = repeatEndDateEl?.value;
    const repeatCount = repeatEndType === "count" ? normalizeRepeatCountInput().value : null;
    const weekdays = repeatUnit === "week" ? getSelectedWeekdays() : [];

    return {
        repeatEnabled,
        repeatInterval,
        repeatUnit,
        repeatStart,
        repeatEnd,
        repeatEndType,
        repeatEndDate,
        repeatCount,
        weekdays
    };
}

function estimateOccurrencesForForm(start, end) {
    const options = buildRepeatOptionsSnapshot(start, end);
    const base = {
        id: 0,
        date: selectedDateISO,
        name: "__preview__",
        start,
        end,
        notes: "",
        price: 0,
        hasVAT: false,
        needSupport: false,
        isPaid: false
    };

    const preview = buildRecurringBookings(base, {
        enabled: options.repeatEnabled,
        interval: options.repeatInterval,
        unit: options.repeatUnit,
        repeatStart: options.repeatStart,
        repeatEnd: options.repeatEnd,
        weekdays: options.weekdays,
        endType: options.repeatEndType,
        endDate: options.repeatEndDate,
        occurrences: options.repeatCount
    });

    return preview.length;
}

function resolveRateBySelection(selection, totalHours) {
    switch (selection) {
        case "odd":
            return pricingConfig.oddHourPrice || 0;
        case "range-10-20":
            return pricingConfig.recurringRules?.range10to20 || 0;
        case "range-20-40":
            return pricingConfig.recurringRules?.range20to40 || 0;
        case "range-over-40":
            return pricingConfig.recurringRules?.rangeOver40 || 0;
        case "auto":
        default:
            return getAutoRateForHours(totalHours);
    }
}

function getAutoRateForHours(totalHours) {
    if (totalHours > 40) return pricingConfig.recurringRules?.rangeOver40 || 0;
    if (totalHours >= 20) return pricingConfig.recurringRules?.range20to40 || 0;
    if (totalHours >= 10) return pricingConfig.recurringRules?.range10to20 || 0;
    return pricingConfig.oddHourPrice || 0;
}

function getPricingLabel(selection, totalHours) {
    if (selection === "auto") {
        if (totalHours > 40) return "Tự tính: gói >40h";
        if (totalHours >= 20) return "Tự tính: gói 20–40h";
        if (totalHours >= 10) return "Tự tính: gói 10–20h";
        return "Tự tính: giá giờ lẻ";
    }
    const map = {
        odd: "Giá giờ lẻ",
        "range-10-20": "Ưu đãi 10–20h",
        "range-20-40": "Ưu đãi 20–40h",
        "range-over-40": "Ưu đãi >40h",
        manual: "Tự nhập"
    };
    return map[selection] || "Bảng giá";
}

function updatePriceSuggestion(force = false) {
    if (!priceRuleSelect || !newStartEl || !newEndEl || !priceAutoInfoEl || !newPriceEl) return;

    const selection = priceRuleSelect.value || "auto";
    if (selection === "manual") {
        priceAutoInfoEl.textContent = "Bạn đang tự nhập số tiền.";
        return;
    }

    const start = newStartEl.value;
    const end = newEndEl.value;

    if (!start || !end) {
        priceAutoInfoEl.textContent = "Nhập giờ để hệ thống tự tính.";
        return;
    }
    if (end <= start) {
        priceAutoInfoEl.textContent = "Giờ kết thúc phải sau giờ bắt đầu.";
        return;
    }

    const durationHours = calculateDurationHours(start, end);
    const occurrences = estimateOccurrencesForForm(start, end) || 1;
    const totalHours = durationHours * occurrences;
    const rate = resolveRateBySelection(selection, totalHours);
    const computed = Math.round(durationHours * rate);
    const label = getPricingLabel(selection, totalHours);

    if (selection !== "manual") {
        newPriceEl.value = computed || "";
    }

    const hoursText = `${durationHours.toFixed(1)}h x ${occurrences} buổi`;
    priceAutoInfoEl.textContent = `${label}: ${formatCurrency(computed)} (${hoursText})`;
}

function syncRepeatTimesFromMain(force = false) {
    if (!newRepeatStartEl || !newRepeatEndEl) return;
    const startVal = newStartEl?.value || "";
    const endVal = newEndEl?.value || "";
    const repeatActive = Boolean(newRepeatEnabledEl?.checked);

    const shouldSyncStart = force || repeatActive || !newRepeatStartEl.value;
    const shouldSyncEnd = force || repeatActive || !newRepeatEndEl.value;

    if (shouldSyncStart) newRepeatStartEl.value = startVal;
    if (shouldSyncEnd) newRepeatEndEl.value = endVal;
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
                <div class="booking-card__actions">
                    <button class="booking-card__delete" aria-label="Xóa booking">×</button>
                    <div class="booking-card__status ${b.isPaid ? "booking-card__paid" : "booking-card__unpaid"}">
                        ${b.isPaid ? "✔" : "✖"}
                    </div>
                </div>
            </div>
            <div class="booking-card__row">
                <div class="booking-card__time">${b.start} – ${b.end}</div>
                <div class="booking-card__time">${formatCurrency(b.price)}</div>
            </div>
        `;
        card.addEventListener("click", () => openBookingDetail(b.id));
        const deleteBtn = card.querySelector(".booking-card__delete");
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteBooking(b.id);
        });
        bookingListEl.appendChild(card);
    });
}

function deleteBooking(id) {
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) return;

    bookings.splice(index, 1);
    renderBookingList();
    renderMonthGrid();
    updateFinancePanel();
    updateChart();
    persistBookings();
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
    renderMonthGrid();
    updateFinancePanel();
    updateChart();
    persistBookings();

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
    persistCosts();

    productionDescEl.value = "";
    productionAmountEl.value = "";
    productionIsFixedEl.checked = false;

    renderCostList();
    updateFinancePanel();
});

clearDataBtn?.addEventListener("click", () => {
    const confirmReset = confirm("Xóa toàn bộ dữ liệu demo và đặt lại? Bạn sẽ mất các chỉnh sửa.");
    if (!confirmReset) return;
    clearAllData();
});

function renderCostList() {
    costListEl.innerHTML = "";
    if (costs.length === 0) return;

    costs.forEach(c => {
        const li = document.createElement("li");
        li.className = "cost-item";
        li.dataset.id = c.id;
        li.innerHTML = `
            <span class="cost-item__label">${c.desc}</span>
            <span class="cost-item__value">${formatCurrency(c.amount)}</span>
        `;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "cost-item__delete";
        deleteBtn.textContent = "✕";
        deleteBtn.dataset.id = c.id;
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            handleRemoveCost(c.id);
        });

        li.appendChild(deleteBtn);
        costListEl.appendChild(li);
    });
}

function handleRemoveCost(id) {
    const index = costs.findIndex(c => c.id === id);
    if (index === -1) return;

    costs.splice(index, 1);
    renderCostList();
    updateFinancePanel();
    persistCosts();
}

// ====== HELPER FUNCTIONS ======
function readFromStorage(key, fallback) {
    const fallbackCopy = cloneData(fallback);

    if (typeof localStorage === "undefined") return fallbackCopy;

    const raw = localStorage.getItem(key);
    if (!raw) return fallbackCopy;

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(fallbackCopy)) {
            return Array.isArray(parsed) ? parsed : fallbackCopy;
        }
        if (isPlainObject(fallbackCopy)) {
            return isPlainObject(parsed) ? parsed : fallbackCopy;
        }
        return parsed ?? fallbackCopy;
    } catch (err) {
        console.warn(`Không đọc được dữ liệu ${key}:`, err);
        return fallbackCopy;
    }
}

function writeToStorage(key, value) {
    if (typeof localStorage === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
        console.warn(`Không lưu được dữ liệu ${key}:`, err);
    }
}

function removeFromStorage(key) {
    if (typeof localStorage === "undefined") return;
    try {
        localStorage.removeItem(key);
    } catch (err) {
        console.warn(`Không xoá được dữ liệu ${key}:`, err);
    }
}

function persistBookings() {
    writeToStorage(STORAGE_KEYS.bookings, bookings);
}

function persistCosts() {
    writeToStorage(STORAGE_KEYS.costs, costs);
}

function persistPricing() {
    writeToStorage(STORAGE_KEYS.pricing, pricingConfig);
}

function clearAllData() {
    removeFromStorage(STORAGE_KEYS.bookings);
    removeFromStorage(STORAGE_KEYS.costs);
    removeFromStorage(STORAGE_KEYS.pricing);

    bookings = cloneData(DEFAULT_BOOKINGS);
    costs = [];
    pricingConfig = cloneData(DEFAULT_PRICING);

    stripOffset = 0;
    selectedDateISO = todayOffsetISO(0);

    renderDateStrip();
    renderMonthGrid();
    renderBookingList();
    renderCostList();
    renderPricingSettings();
    updateFinancePanel();
    updateChart();

    persistBookings();
    persistCosts();
    persistPricing();

    alert("Đã đặt lại dữ liệu demo và xoá thông tin lưu cục bộ.");
}

function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}

function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function todayOffsetISO(offset) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return formatLocalISODate(d);
}

function diffDaysFromToday(targetISO) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = parseLocalDateFromISO(targetISO);
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

// tính thông tin 1 ngày dựa trên offset so với hôm nay
function getDateInfoFromOffset(offset) {
    const base = new Date();
    base.setHours(0,0,0,0);
    base.setDate(base.getDate() + offset);

    const iso = formatLocalISODate(base);
    const todayISO = todayOffsetISO(0);

    return {
        iso,
        day: base.getDate(),
        weekdayShort: WEEKDAYS[base.getDay()],
        isToday: iso === todayISO
    };
}

function formatLocalISODate(date) {
    const d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseLocalDateFromISO(iso) {
    const [year, month, day] = iso.split("-").map(Number);
    const date = new Date(year, (month || 1) - 1, day || 1);
    date.setHours(0, 0, 0, 0);
    return date;
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

    updatePriceSuggestion(true);
    const price = Number(newPriceEl.value);
    if (!price || price <= 0) {
        alert("Nhập số tiền hợp lệ.");
        newPriceEl.focus();
        return;
    }

    const repeatEnabled = Boolean(newRepeatEnabledEl?.checked);
    const repeatInterval = Math.max(1, Number(newRepeatIntervalEl?.value) || 1);
    const repeatUnit = newRepeatUnitEl?.value || "week";
    const repeatStartValue = newRepeatStartEl?.value;
    const repeatEndValue = newRepeatEndEl?.value;
    const repeatTimesAligned = (!repeatStartValue && !repeatEndValue)
        || (repeatStartValue === start && repeatEndValue === end);
    const repeatStart = repeatStartValue || start;
    const repeatEnd = repeatEndValue || end;
    const selectedWeekdays = repeatUnit === "week" ? getSelectedWeekdays() : [];
    const repeatEndType = getSelectedRepeatEndType();
    const repeatEndDate = repeatEndDateEl?.value;
    const repeatCountState = normalizeRepeatCountInput();
    const repeatCount = repeatCountState.value;
    setRepeatCountErrorState(repeatEndType === "count" && repeatCountState.isInvalid);

    if (repeatEnabled && !repeatTimesAligned && (!repeatStart || !repeatEnd)) {
        alert("Nhập đầy đủ giờ bắt đầu/kết thúc cho chu kỳ lặp.");
        newRepeatStartEl?.focus();
        return;
    }
    if (repeatEnabled && !repeatTimesAligned && repeatEnd <= repeatStart) {
        alert("Giờ kết thúc lặp phải sau giờ bắt đầu lặp.");
        newRepeatEndEl?.focus();
        return;
    }
    if (repeatEnabled && repeatUnit === "week" && selectedWeekdays.length === 0) {
        alert("Chọn ít nhất một thứ trong tuần để lặp lịch.");
        repeatDayListEl?.querySelector(".day-chip")?.focus?.();
        return;
    }
    if (repeatEnabled && repeatEndType === "until" && !repeatEndDate) {
        alert("Chọn ngày kết thúc cho chu kỳ lặp.");
        repeatEndDateEl?.focus();
        return;
    }
    if (repeatEnabled && repeatEndType === "until" && repeatEndDate <= selectedDateISO) {
        alert("Ngày kết thúc phải sau ngày bắt đầu.");
        repeatEndDateEl?.focus();
        return;
    }
    if (repeatEnabled && repeatEndType === "count" && repeatCountState.isInvalid) {
        repeatEndCountEl?.focus();
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
        interval: repeatInterval,
        unit: repeatUnit,
        repeatStart,
        repeatEnd,
        weekdays: selectedWeekdays,
        endType: repeatEndType,
        endDate: repeatEndDate,
        occurrences: repeatEndType === "count" ? repeatCount : null
    });

    const conflict = bookingsToAdd.find(b => hasTimeConflict(b, [...bookings, ...bookingsToAdd.filter(x => x !== b)]));
    if (conflict) {
        alert(`Trùng giờ với lịch đã có vào ${conflict.date}. Vui lòng chọn giờ khác.`);
        return;
    }

    bookings.push(...bookingsToAdd);
    persistBookings();
    closeBookingModal();
    renderBookingList();
    renderMonthGrid();
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
    const {
        enabled,
        interval = 1,
        unit = "week",
        repeatStart,
        repeatEnd,
        weekdays = [],
        endType = "none",
        endDate,
        occurrences
    } = options;
    const list = [baseBooking];

    if (!enabled) return list;

    const baseDate = parseLocalDateFromISO(baseBooking.date);
    const normalizedDays = unit === "week" ? (weekdays.length > 0 ? weekdays : [baseDate.getDay()]) : [];
    const limit = buildRepeatLimit(baseDate, { endType, endDate, occurrences });

    const dates = unit === "day"
        ? generateDailyDates(baseDate, interval, limit)
        : generateWeeklyDatesForDays(baseDate, normalizedDays, interval, limit);

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

function buildRepeatLimit(baseDate, { endType = "none", endDate, occurrences }) {
    const limit = {
        maxCount: REPEAT_MAX_OCCURRENCES,
        until: null
    };

    if (endType === "count" && typeof occurrences === "number") {
        const total = Math.min(REPEAT_MAX_OCCURRENCES, Math.max(1, occurrences));
        limit.maxCount = Math.max(0, total - 1);
    }

    if (endType === "until" && endDate) {
        const until = parseLocalDateFromISO(endDate);
        if (until > baseDate) {
            limit.until = until;
        }
    }

    return limit;
}

function generateWeeklyDatesForDays(baseDate, weekdays, interval, limit) {
    const dates = [];
    const baseWeekday = baseDate.getDay();
    const sortedDays = [...weekdays].sort((a, b) => a - b);
    let weekIndex = 0;

    while (dates.length < limit.maxCount) {
        const weekShift = (weekIndex + 1) * interval * 7;
        sortedDays.forEach(day => {
            if (dates.length >= limit.maxCount) return;
            const diff = (day - baseWeekday + 7) % 7;
            const target = new Date(baseDate);
            target.setDate(baseDate.getDate() + weekShift + diff);
            if (limit.until && target > limit.until) return;
            dates.push(formatLocalISODate(target));
        });
        weekIndex++;

        if (limit.until) {
            const nextBase = new Date(baseDate);
            nextBase.setDate(baseDate.getDate() + (weekIndex + 1) * interval * 7);
            if (nextBase > limit.until) break;
        }

        if (weekIndex > REPEAT_MAX_OCCURRENCES * interval) break; // safety guard
    }

    return dates;
}

function generateDailyDates(baseDate, interval, limit) {
    const dates = [];
    let step = 1;

    while (dates.length < limit.maxCount) {
        const target = new Date(baseDate);
        target.setDate(baseDate.getDate() + step * interval);
        if (limit.until && target > limit.until) break;
        dates.push(formatLocalISODate(target));
        step++;

        if (!limit.until && step > REPEAT_MAX_OCCURRENCES * interval) break; // safety guard
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
