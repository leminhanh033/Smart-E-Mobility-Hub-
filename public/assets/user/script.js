var notyf = new Notyf({
  duration: 3000,
  position: {
    x: "right",
    y: "top",
  }
});

const alertMessage = (data) => {
  sessionStorage.setItem("notify", JSON.stringify(data))
}

const notify = JSON.parse(sessionStorage.getItem("notify"));
if (notify) {
  if (notify.code == "error") {
    notyf.error(notify.message);
  }
  if (notify.code == "success") {
    notyf.success(notify.message);
  }
  sessionStorage.removeItem("notify");
}

const parkingCard = document.querySelectorAll(".book-parking .book-parking__list .parking-card");
if (parkingCard.length > 0) {
  parkingCard.forEach(card => {
    card.addEventListener("click", () => {
      // fetch
      parkingCard.forEach(i => i.classList.remove("parking-card--selected"));
      card.classList.add("parking-card--selected");
    })
  })
}

// ----- 1. Chọn xe cần sạc -----
const vehiclePicks = document.querySelectorAll(".schedule-charging .vehicle-pick");
if (vehiclePicks.length > 0) {
  vehiclePicks.forEach(pick => {
    pick.addEventListener("click", () => {
      vehiclePicks.forEach(i => i.classList.remove("vehicle-pick--selected"));
      pick.classList.add("vehicle-pick--selected");
    });
  });
}

// ----- 2. Chọn thời lượng sạc -----
const durationBtns = document.querySelectorAll(".schedule-charging .duration-btn");
if (durationBtns.length > 0) {
  durationBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      durationBtns.forEach(i => i.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

// ----- 3. Chọn khung giờ sạc (time slot) -----
const timeSlots = document.querySelectorAll(".schedule-charging .time-slot");
if (timeSlots.length > 0) {
  timeSlots.forEach(slot => {
    slot.addEventListener("click", () => {
      // Bỏ chọn tất cả
      timeSlots.forEach(i => i.classList.remove("time-slot--selected"));

      // Chọn cái vừa click
      slot.classList.add("time-slot--selected");

      // Đồng bộ radio bên trong (vì click vào label có thể không tự check)
      const radio = slot.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
}

// ----- 4. Chọn tab (Đặt chỗ đỗ / Đổi lịch sạc / Gửi yêu cầu) -----
const tabBtns = document.querySelectorAll(".schedule-charging .tab-btn");
if (tabBtns.length > 0) {
  tabBtns.forEach(tab => {
    tab.addEventListener("click", () => {
      tabBtns.forEach(i => i.classList.remove("active"));
      tab.classList.add("active");
    });
  });
}

const selectStart = document.getElementById("selectStart");
const selectEnd = document.getElementById("selectEnd");

function updateURLWithCoordinates() {
  const currentUrl = new URL(window.location.href);

  if (selectStart && selectStart.selectedIndex > 0) {
    const selectedOptionStart = selectStart.options[selectStart.selectedIndex];

    const fromLat = selectedOptionStart.getAttribute("lat");
    const fromLng = selectedOptionStart.getAttribute("lng");
    const fromName = selectedOptionStart.getAttribute("name");
    const fromID = selectedOptionStart.getAttribute("value");

    if (fromLat && fromLng) {
      currentUrl.searchParams.set("fromLat", fromLat);
      currentUrl.searchParams.set("fromLng", fromLng);
      currentUrl.searchParams.set("fromName", fromName);
      currentUrl.searchParams.set("fromID", fromID);
    }
  } else {
    currentUrl.searchParams.delete("fromLat");
    currentUrl.searchParams.delete("fromLng");
    currentUrl.searchParams.delete("fromName");
    currentUrl.searchParams.delete("fromID");
  }

  // --- XỬ LÝ ĐIỂM ĐẾN (TO) ---
  if (selectEnd && selectEnd.selectedIndex > 0) {
    const selectedOptionEnd = selectEnd.options[selectEnd.selectedIndex];
    const toLat = selectedOptionEnd.getAttribute("lat");
    const toName = selectedOptionEnd.getAttribute("name");
    const toLng = selectedOptionEnd.getAttribute("lng");
    const toID = selectedOptionEnd.getAttribute("value");

    if (toLat && toLng) {
      currentUrl.searchParams.set("toLat", toLat);
      currentUrl.searchParams.set("toLng", toLng);
      currentUrl.searchParams.set("toName", toName);
      currentUrl.searchParams.set("toID", toID);
    }
  } else {
    currentUrl.searchParams.delete("toLat");
    currentUrl.searchParams.delete("toLng");
    currentUrl.searchParams.delete("toName");
    currentUrl.searchParams.delete("toID");
  }

  window.location.href = currentUrl.href

}

if (selectStart) selectStart.addEventListener("change", updateURLWithCoordinates);
if (selectEnd) selectEnd.addEventListener("change", updateURLWithCoordinates);

//Hub hiện tại
const urlParams = new URLSearchParams(window.location.search);
const fromIDParam = urlParams.get('fromID');
// 2. Nếu URL có chứa param này
if (fromIDParam) {
  const selectElement = document.getElementById('selectStart');
  if (selectElement) {
    // Duyệt qua các option để tìm option có value trùng khớp với param
    for (let option of selectElement.options) {
      if (option.value === fromIDParam) {
        option.selected = true;
        break;
      }
    }
  }
}
//Hub đi đến
const toIDParam = urlParams.get('toID');
// 2. Nếu URL có chứa param này
if (toIDParam) {
  const selectElement = document.getElementById('selectEnd');
  if (selectElement) {
    // Duyệt qua các option để tìm option có value trùng khớp với param
    for (let option of selectElement.options) {
      if (option.value === toIDParam) {
        option.selected = true;
        break;
      }
    }
  }
}

//Xem chi tiết
const viewDetailBtns = document.querySelectorAll(".vehicle-item__link");
if (viewDetailBtns.length > 0) {
  viewDetailBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      const targetUrl = this.getAttribute("data-url");
      const vehicleId = this.getAttribute("data-id");
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set("vehicleID", vehicleId);
      window.location.href = `${targetUrl}?${currentParams.toString()}`;
    });
  });
}

//Tạo báo cáo sự cố
const reportForm = document.querySelector("#report-form");
if (reportForm) {
  const validate = new JustValidate('#report-form');
  validate
    .onSuccess((event) => {
      const type = event.target.type.value;
      const hub = event.target.hub.value;
      const vehicle = event.target.vehicle.value;
      const description = event.target.description.value;
      fetch("/report/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: type,
          hub: hub,
          vehicle: vehicle,
          description: description,
        })
      })
        .then(res => res.json())
        .then(data => {
          console.log(data);
          if (data.code == "success") {
            // alertMessage(data);
            // window.location.reload;
            notyf.success(data.message)
          }
          if (data.code == "error") {
            notyf.error(data.message);
          }
        })
    })
}

//Nút quay lại
const btnBackDetail = document.querySelector(".shared-vehicle-detail__back");
if (btnBackDetail) {
  btnBackDetail.addEventListener("click", function (e) {
    e.preventDefault();

    const targetUrl = this.getAttribute("href");

    const currentParams = new URLSearchParams(window.location.search);

    currentParams.delete("vehicleID");

    const queryString = currentParams.toString();
    const newUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    window.location.href = newUrl;
  });
}

//Nút đặt xe
const btnBookVehicle = document.getElementById("btnBookVehicle");

if (btnBookVehicle) {
  btnBookVehicle.addEventListener("click", function () {
    const vehicleId = this.getAttribute("data-id");

    // Đổi trạng thái nút để tránh người dùng bấm nhiều lần (Double Click)
    const originalText = this.innerText;
    this.innerText = "Đang xử lý...";
    this.disabled = true;

    // Gọi API
    fetch("/shared-vehicle/booking/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleId: vehicleId,
        endHubID: toIDParam,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "success") {
          notyf.success(data.message);

          setTimeout(() => {
            window.location.href = "/activity/active"; // Chuyển sang trang quản lý chuyến đi
          }, 1500);
        } else {
          notyf.error(data.message);
          this.innerText = originalText;
          this.disabled = false;
        }
      })
      .catch((error) => {
        console.error("Lỗi:", error);
        notyf.error("Không thể kết nối đến Server!");
        this.innerText = originalText;
        this.disabled = false;
      });
  });
}

// =========================================================
// Đổi dropdown → thẻ card bên dưới active theo
// =========================================================
const hubSelectParking = document.getElementById("hubSelect");
const parkingCards = document.querySelectorAll(".parking-card");

if (hubSelectParking) {
  hubSelectParking.addEventListener("change", function () {
    const hubId = this.value;

    // Đổi thẻ active
    if (parkingCards.length > 0) {
      parkingCards.forEach((card) => {
        if (card.getAttribute("data-id") === hubId) {
          card.classList.add("parking-card--selected");
        } else {
          card.classList.remove("parking-card--selected");
        }
      });
    }

    // Cập nhật summary
    const selectedCard = document.querySelector(`.parking-card[data-id="${hubId}"]`);
    if (selectedCard) {
      const summaryHubName = document.getElementById("summaryHubName");
      const summaryHubAddress = document.getElementById("summaryHubAddress");

      if (summaryHubName) {
        summaryHubName.innerText = selectedCard.getAttribute("data-name");
      }
      if (summaryHubAddress) {
        summaryHubAddress.innerText = selectedCard.getAttribute("data-address");
      }
    }

    // Cập nhật data-id cho nút xác nhận
    const btnConfirmParking = document.getElementById("btnConfirmParking");
    if (btnConfirmParking) {
      btnConfirmParking.setAttribute("data-id", hubId);
    }
  });
}

// =========================================================
// Click vào card → dropdown cũng đổi theo
// =========================================================
if (parkingCards.length > 0) {
  parkingCards.forEach((card) => {
    card.addEventListener("click", function () {
      const hubId = this.getAttribute("data-id");
      if (hubSelectParking) {
        hubSelectParking.value = hubId;
        hubSelectParking.dispatchEvent(new Event("change"));
      }
    });
  });
}

//Lấy thông tin hub trong trang đặt chỗ đỗ
const summaryHubName = document.getElementById("summaryHubName");
const summaryHubAddress = document.getElementById("summaryHubAddress");
const summarySlotCode = document.getElementById("summarySlotCode");

if (parkingCards.length > 0) {
  parkingCards.forEach((card) => {
    card.addEventListener("click", () => {
      parkingCards.forEach((c) => c.classList.remove("parking-card--selected"));

      card.classList.add("parking-card--selected");

      // 3. Lấy dữ liệu từ data-* của card
      const hubId = card.getAttribute("data-id");
      const hubName = card.getAttribute("data-name");
      const hubAddress = card.getAttribute("data-address");

      // 4. Cập nhật thông tin sang cột Summary
      if (summaryHubName) summaryHubName.innerText = hubName;
      if (summaryHubAddress) summaryHubAddress.innerText = hubAddress;

      // Cập nhật ID Hub vào nút Xác nhận 
      if (btnConfirmParking) btnConfirmParking.setAttribute("data-id", hubId);

      // (Giả lập) Tạo ngẫu nhiên một mã chỗ đỗ khi đổi Hub
      if (summarySlotCode) {
        const randomSlot = "D-" + Math.floor(Math.random() * 20 + 1).toString().padStart(2, "0");
        summarySlotCode.innerText = randomSlot;
      }
    });
  });
}

//Xác nhận đặt chỗ
const btnConfirmParking = document.getElementById("btnConfirmParking");
if (btnConfirmParking) {
  btnConfirmParking.addEventListener("click", function () {
    // Lấy ID Hub đang được chọn (đã được gắn từ sự kiện click vào Card)
    const hubId = this.getAttribute("data-id");
    const summarySlotCodeEl = document.querySelector("#summarySlotCode");
    const slotCode = summarySlotCodeEl ? summarySlotCodeEl.innerText : "";
    if (!hubId) {
      notyf.error("Vui lòng chọn một Hub để đặt chỗ!");
      return;
    }

    // Đổi trạng thái nút để tránh bấm nhiều lần
    const originalText = this.innerText;
    this.innerText = "Đang xử lý...";
    this.disabled = true;

    // Gọi API
    fetch("/book/parking/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hubId: hubId, slotCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "success") {
          notyf.success(data.message);

          // Chuyển hướng sau 1.5 giây
          setTimeout(() => {
            window.location.href = "/activity/active";
          }, 1500);
        } else {
          notyf.error(data.message);
          this.innerText = originalText;
          this.disabled = false;
        }
      })
      .catch((error) => {
        console.error("Lỗi:", error);
        notyf.error("Không thể kết nối đến Server!");
        this.innerText = originalText;
        this.disabled = false;
      });
  });
}

// ==========================================
// XỬ LÝ MODAL THÊM XE MỚI
// ==========================================
const addVehicleModal = document.getElementById("addVehicleModal");
const btnAddNewVehicle = document.getElementById("btnAddNewVehicle");
const btnCloseVehicleModal = document.getElementById("closeVehicleModalBtn");
const btnCancelVehicleModal = document.getElementById("cancelVehicleModalBtn");
const createVehicleForm = document.getElementById("create-vehicle-form");

// Mở Modal
if (btnAddNewVehicle && addVehicleModal) {
  btnAddNewVehicle.addEventListener("click", () => {
    addVehicleModal.classList.add("is-open");
  });
}

// Đóng Modal (X, Hủy, Click ngoài)
if (btnCloseVehicleModal && addVehicleModal) {
  btnCloseVehicleModal.addEventListener("click", () => {
    addVehicleModal.classList.remove("is-open");
  });
}
if (btnCancelVehicleModal && addVehicleModal) {
  btnCancelVehicleModal.addEventListener("click", () => {
    addVehicleModal.classList.remove("is-open");
  });
}
if (addVehicleModal) {
  addVehicleModal.addEventListener("click", (e) => {
    if (e.target === addVehicleModal) {
      addVehicleModal.classList.remove("is-open");
    }
  });
}

// Submit Form Thêm Xe
if (createVehicleForm) {
  createVehicleForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Chặn load lại trang

    // Lấy dữ liệu
    const license = document.getElementById("license").value;
    const type = document.getElementById("type").value;
    const model = document.getElementById("model").value;
    const batteryCapacity = document.getElementById("batteryCapacity").value;

    const btnSubmit = document.querySelector(".schedule-charging .modal-overlay .modal-footer .btn-submit");
    const originalText = btnSubmit.innerText;
    btnSubmit.innerText = "Đang lưu...";
    btnSubmit.disabled = true;

    // Gọi API
    fetch("/book/vehicle/owner/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        license, type, model, batteryCapacity
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.code === "success") {
          notyf.success(data.message);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          notyf.error(data.message);
          btnSubmit.innerText = originalText;
          btnSubmit.disabled = false;
        }
      })
      .catch(err => {
        console.error(err);
        notyf.error("Lỗi kết nối đến server!");
        btnSubmit.innerText = originalText;
        btnSubmit.disabled = false;
      });
  });
}

// ==========================================
// XỬ LÝ ĐẶT LỊCH SẠC (trang /book/charging/schedule)
// ==========================================
(function initChargingSchedule() {
  const page = document.querySelector(".schedule-charging");
  if (!page) return;

  // ---------- Elements ----------
  const desiredPinSelect   = page.querySelector("#desiredPinSelect");
  const chargingDateInput  = page.querySelector("#chargingDate");
  const chargingTimeInput  = page.querySelector("#chargingTime");
  const hubSelectInput     = page.querySelector("#hubSelect");
  const chargingTypeSelect = page.querySelector("#chargingType");
  const durationRadios     = page.querySelectorAll('input[name="duration"]');
  const btnConfirmCharging = page.querySelector("#btnConfirmCharging");

  if (!hubSelectInput) {
    console.warn("[schedule-charging] Không tìm thấy #hubSelect");
  }

  // Set ngày mặc định hôm nay
  if (chargingDateInput && !chargingDateInput.value) {
    chargingDateInput.value = new Date().toISOString().split("T")[0];
  }

  const fmt = (n) => Number(n).toLocaleString("vi-VN");

  // Lấy duration từ radio đang checked
  function getSelectedDuration() {
    const checked = page.querySelector('input[name="duration"]:checked');
    return checked ? parseInt(checked.value) : 45;
  }

  // ---------- UPDATE SUMMARY ----------
  function updateSummary() {
    const selectedVehicle = page.querySelector(".vehicle-pick--selected:not(.vehicle-pick--add)");
    if (!selectedVehicle) return;

    const vehicleName  = selectedVehicle.getAttribute("data-name") || "";
    const vehiclePlate = selectedVehicle.getAttribute("data-plate") || "";
    const startPin     = parseInt(selectedVehicle.getAttribute("data-pin")) || 20;

    const desiredPin = desiredPinSelect ? parseInt(desiredPinSelect.value) : 85;
    const dateVal    = chargingDateInput ? chargingDateInput.value : "";
    const timeVal    = chargingTimeInput ? chargingTimeInput.value : "08:00";

    let hubText = "Chưa chọn Hub";
    if (hubSelectInput && hubSelectInput.selectedIndex >= 0) {
      hubText = hubSelectInput.options[hubSelectInput.selectedIndex].text;
    }

    const portType = chargingTypeSelect ? chargingTypeSelect.value : "AC";
    const durationMin = getSelectedDuration();

    // ---- Left ----
    const elCurrentPin = document.getElementById("currentPinDisplay");
    if (elCurrentPin) elCurrentPin.innerText = startPin + "%";

    // ---- Summary ----
    const elVName = document.getElementById("summaryVehicleName");
    const elVPlate = document.getElementById("summaryVehiclePlate");
    if (elVName) elVName.innerText = vehicleName;
    if (elVPlate) elVPlate.innerText = "Biển số: " + vehiclePlate;

    // Giờ kết thúc
    let endTimeStr = timeVal;
    if (timeVal && dateVal) {
      const startDate = new Date(`${dateVal}T${timeVal}:00`);
      if (!isNaN(startDate.getTime())) {
        const endDate = new Date(startDate.getTime() + durationMin * 60000);
        endTimeStr =
          String(endDate.getHours()).padStart(2, "0") + ":" +
          String(endDate.getMinutes()).padStart(2, "0");
      }
    }

    const elTimeRange = document.getElementById("summaryTimeRange");
    const elTimeSlot = document.getElementById("summaryTimeSlot");
    const elPinRange = document.getElementById("summaryPinRange");
    const elDur = document.getElementById("summaryDuration");
    const elHub = document.getElementById("summaryHubName");

    if (elTimeRange) elTimeRange.innerText = `${timeVal} - ${endTimeStr}`;
    if (elTimeSlot) elTimeSlot.innerText = `${timeVal} - ${endTimeStr}`;
    if (elPinRange) elPinRange.innerHTML = `${startPin}% &rarr; ${desiredPin}%`;
    if (elDur) elDur.innerText = `~${durationMin} phút`;
    if (elHub) elHub.innerText = hubText;

    // Công suất
    const summaryBlockSub = page.querySelector(".summary__block-sub");
    if (summaryBlockSub) {
      summaryBlockSub.innerText = portType === "DC"
        ? "Công suất: 30 kW (DC Fast Charging)"
        : "Công suất: 3.3 kW (AC Standard)";
    }

    const timeSlotMeta = page.querySelector(".time-slot__meta span");
    if (timeSlotMeta) {
      timeSlotMeta.innerHTML = `Cổng tự động &bull; Trụ ${portType} Standard`;
    }

    // ---- Chi phí ----
    const rate = portType === "DC" ? 800 : 500;
    const chargingCost = durationMin * rate;

    let minutesUntilStart = 0;
    if (dateVal && timeVal) {
      const scheduledStart = new Date(`${dateVal}T${timeVal}:00`);
      if (!isNaN(scheduledStart.getTime())) {
        minutesUntilStart = Math.max(0, Math.ceil((scheduledStart - Date.now()) / 60000));
      }
    }
    const reservationFee = minutesUntilStart * 200;
    const totalCost = chargingCost + reservationFee;

    const elCost = document.getElementById("summaryCost");
    if (elCost) {
      elCost.innerHTML =
        fmt(totalCost) + " VNĐ" +
        `<br><small style="font-weight:400;color:#64748b;font-size:12px;line-height:1.5;">` +
        `Sạc: ${fmt(chargingCost)}đ (${durationMin}p × ${fmt(rate)}đ)<br>` +
        `Giữ cổng: ${fmt(reservationFee)}đ (chờ ${minutesUntilStart}p × 200đ)` +
        `</small>`;
    }
  }

  // ---------- Sự kiện chọn xe ----------
  page.querySelectorAll(".vehicle-pick:not(.vehicle-pick--add)").forEach((pick) => {
    pick.addEventListener("click", () => {
      page.querySelectorAll(".vehicle-pick").forEach((p) =>
        p.classList.remove("vehicle-pick--selected")
      );
      pick.classList.add("vehicle-pick--selected");
      updateSummary();
    });
  });

  // ---------- Input change ----------
  if (desiredPinSelect)   desiredPinSelect.addEventListener("change", updateSummary);
  if (chargingDateInput)  chargingDateInput.addEventListener("change", updateSummary);
  if (chargingTimeInput)  chargingTimeInput.addEventListener("change", updateSummary);
  if (hubSelectInput)     hubSelectInput.addEventListener("change", updateSummary);
  if (chargingTypeSelect) chargingTypeSelect.addEventListener("change", updateSummary);

  // ---------- Duration radios ----------
  durationRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (!this.checked) return;
      page.querySelectorAll(".duration-btn").forEach((btn) => btn.classList.remove("active"));
      const label = page.querySelector(`label[for="${this.id}"]`);
      if (label) label.classList.add("active");
      updateSummary();
    });
  });

  // ---------- Submit ----------
  if (btnConfirmCharging) {
    btnConfirmCharging.addEventListener("click", function () {
      const selectedVehicle = page.querySelector(
        ".vehicle-pick--selected:not(.vehicle-pick--add)"
      );
      if (!selectedVehicle) {
        notyf.error("Vui lòng chọn xe cần sạc!");
        return;
      }

      const vehicleId = selectedVehicle.getAttribute("data-id");
      if (!vehicleId || vehicleId === "undefined") {
        notyf.error("Không xác định được xe. Vui lòng chọn lại.");
        console.error("[schedule-charging] data-id rỗng:", selectedVehicle);
        return;
      }

      const hubId = hubSelectInput ? hubSelectInput.value : "";
      if (!hubId || hubId === "undefined") {
        notyf.error("Vui lòng chọn Mobility Hub!");
        console.error("[schedule-charging] hubSelectInput.value rỗng:", hubSelectInput);
        return;
      }

      const desiredPin = desiredPinSelect ? desiredPinSelect.value : "85";
      const date = chargingDateInput ? chargingDateInput.value : "";
      const time = chargingTimeInput ? chargingTimeInput.value : "";
      const duration = getSelectedDuration();
      const portType = chargingTypeSelect ? chargingTypeSelect.value : "AC";

      if (!date || !time) {
        notyf.error("Vui lòng chọn ngày và giờ sạc!");
        return;
      }

      // Compute scheduledStart và gửi kèm để tránh thiếu field ở BE
      const scheduledStartDate = new Date(`${date}T${time}:00`);
      if (isNaN(scheduledStartDate.getTime())) {
        notyf.error("Ngày/giờ không hợp lệ.");
        return;
      }
      if (scheduledStartDate < new Date()) {
        notyf.error("Không thể đặt lịch trong quá khứ.");
        return;
      }
      const scheduledStart = scheduledStartDate.toISOString();

      const payload = {
        vehicleOwnerID: vehicleId,
        hubId,
        desiredPin,
        date,
        time,
        duration,
        portType,
        scheduledStart,
      };
      console.log("[schedule-charging] POST /book/charging/create →", payload);

      const originalText = this.innerText;
      this.innerText = "Đang xử lý...";
      this.disabled = true;

      fetch("/book/charging/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "success") {
            notyf.success(data.message);
            setTimeout(() => { window.location.href = "/activity/active"; }, 1500);
          } else {
            notyf.error(data.message);
            this.innerText = originalText;
            this.disabled = false;
          }
        })
        .catch((err) => {
          console.error("Lỗi đặt lịch sạc:", err);
          notyf.error("Lỗi kết nối đến server!");
          this.innerText = originalText;
          this.disabled = false;
        });
    });
  }

  // ---------- Chạy lần đầu ----------
  updateSummary();
})();

// ==========================================
// XỬ LÝ NÚT HỦY (CANCEL)
// ==========================================
const cancelBtns = document.querySelectorAll(".activity-card .btn-cancel");

if (cancelBtns.length > 0) {
  cancelBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      // Lấy ID và Type từ nút vừa click
      const id = this.getAttribute("data-id");
      const type = this.getAttribute("data-type");

      // Hộp thoại xác nhận cho chắc chắn
      if (!confirm("Bạn có chắc chắn muốn hủy đăng ký này không?")) {
        return;
      }

      // Đổi text để tránh click nhiều lần
      const originalText = this.innerText;
      this.innerText = "Đang xử lý...";
      this.disabled = true;

      // Gọi API Backend
      fetch("/activity/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: id, type: type })
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === "success") {
            notyf.success(data.message);
            // Tải lại trang sau 1 giây để cập nhật giao diện
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            notyf.error(data.message);
            this.innerText = originalText;
            this.disabled = false;
          }
        })
        .catch(error => {
          console.error("Lỗi:", error);
          notyf.error("Lỗi kết nối đến server!");
          this.innerText = originalText;
          this.disabled = false;
        });
    });
  });
}


//Đăng ký nhu cầu sạc
(function initChargingDemand() {
  "use strict";

  // Guard: chỉ chạy khi có nút demand (trang /book/charging/demand)
  const btnConfirm = document.getElementById("btnConfirmDemand");
  if (!btnConfirm) return;

  const hubCards        = document.querySelectorAll(".hub-pick");
  const summaryHubName  = document.getElementById("summaryHubName");
  const summaryHubAddress = document.getElementById("summaryHubAddress");
  const btnCancel       = document.getElementById("btnCancelDemand");

  // ---------- Cập nhật summary ----------
  function updateSummary(hubId) {
    const radio = document.querySelector(`input[name="hub"][value="${hubId}"]`);
    if (!radio) return;

    if (summaryHubName)    summaryHubName.textContent = radio.dataset.name || "Chưa chọn Hub";
    if (summaryHubAddress) summaryHubAddress.textContent = radio.dataset.address || "--";

    hubCards.forEach((card) => {
      const input = card.querySelector('input[name="hub"]');
      card.classList.toggle("hub-pick--selected", input && input.value === hubId);
    });
  }

  function getSelectedHubId() {
    const checked = document.querySelector('input[name="hub"]:checked');
    return checked ? checked.value : null;
  }

  // ---------- Sự kiện chọn Hub ----------
  hubCards.forEach((card) => {
    card.addEventListener("click", () => {
      const input = card.querySelector('input[name="hub"]');
      if (!input) return;
      input.checked = true;
      updateSummary(input.value);
    });
    card.setAttribute("tabindex", "0");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  const initialHubId = getSelectedHubId();
  if (initialHubId) updateSummary(initialHubId);

  // ---------- Toast ----------
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.textContent = message;
    Object.assign(toast.style, {
      position: "fixed", top: "20px", right: "20px",
      padding: "12px 18px", borderRadius: "8px",
      fontSize: "14px", fontWeight: "600", color: "#fff",
      background: type === "success" ? "#16a34a" : "#dc2626",
      boxShadow: "0 8px 20px rgba(0,0,0,.15)",
      zIndex: "9999", opacity: "0",
      transform: "translateY(-10px)", transition: "all .25s ease",
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      setTimeout(() => toast.remove(), 250);
    }, 2500);
  }

  // ---------- Submit ----------
  btnConfirm.addEventListener("click", async function () {
    const hubId = getSelectedHubId();
    if (!hubId) {
      showToast("Vui lòng chọn Mobility Hub trước khi gửi.", "error");
      return;
    }

    btnConfirm.disabled = true;
    const originalText = btnConfirm.textContent;
    btnConfirm.textContent = "Đang gửi...";

    try {
      // Endpoint riêng cho demand — KHÔNG dùng /book/charging/schedule (GET)
      const res = await fetch("/book/charging/demand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hubId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.code === "error") {
        throw new Error(data.message || "Gửi nhu cầu thất bại.");
      }

      showToast(data.message || "Đã gửi nhu cầu sạc thành công!", "success");
      btnConfirm.textContent = "Đã gửi";
    } catch (err) {
      console.error("[submitChargingDemand]", err);
      showToast(err.message || "Có lỗi xảy ra.", "error");
      btnConfirm.disabled = false;
      btnConfirm.textContent = originalText;
    }
  });

  // ---------- Cancel ----------
  if (btnCancel) {
    btnCancel.addEventListener("click", () => {
      if (document.referrer) window.history.back();
      else window.location.href = "/book/parking";
    });
  }
})();

// =========================================================
// TIMER + CƯỚC LIVE
// =========================================================
const RATE_PER_MINUTE = 500;
const pad = (n) => String(n).padStart(2, "0");

const timerList = document.querySelectorAll(".activity-card__timer[data-target-time]");
const liveCosts = document.querySelectorAll('.activity-card__cost[data-mode="live"]');

function tickTimersAndCosts() {
  const now = Date.now();

  // 1) Đồng hồ
  if (timerList.length > 0) {
    timerList.forEach((el) => {
      const target = new Date(el.getAttribute("data-target-time")).getTime();
      if (isNaN(target)) return;

      const mode = el.getAttribute("data-mode") || "countdown";
      const digits = el.querySelector(".timer-digits");
      if (!digits) return;

      let diff = mode === "countdown" ? target - now : now - target;
      if (diff < 0) diff = 0;

      if (mode === "countdown" && diff === 0) {
        digits.classList.add("expired");
      } else {
        digits.classList.remove("expired");
      }

      const totalSec = Math.floor(diff / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;

      digits.textContent =
        h > 0
          ? `${pad(h)} : ${pad(m)} : ${pad(s)}`
          : `${pad(m)} : ${pad(s)}`;
    });
  }

  // 2) Cước live — đọc data-unit để biết tính theo phút hay giờ
  if (liveCosts.length > 0) {
    liveCosts.forEach((el) => {
      const start = new Date(el.getAttribute("data-start-time")).getTime();
      if (isNaN(start)) return;

      const rate = Number(el.getAttribute("data-rate")) || RATE_PER_MINUTE;
      const unit = el.getAttribute("data-unit") || "minute";
      const elapsedMs = Math.max(0, now - start);

      let cost;
      if (unit === "hour") {
        // 1.000đ/giờ → tỷ lệ thuận, làm tròn lên từng đồng
        cost = Math.ceil((elapsedMs / 3600000) * rate);
      } else {
        // 500đ/phút → làm tròn lên từng phút
        cost = Math.ceil(elapsedMs / 60000) * rate;
      }

      el.textContent = cost.toLocaleString("vi-VN") + " VNĐ";
    });
  }
}

setInterval(tickTimersAndCosts, 1000);
tickTimersAndCosts();

// =========================================================
// NHẬN XE  → bắt đầu tính giờ
// =========================================================
const receiveBtns = document.querySelectorAll(".activity-card .btn-receive");

if (receiveBtns.length > 0) {
  receiveBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      const type = this.getAttribute("data-type");

      if (!confirm("Xác nhận nhận xe? Đồng hồ tính cước sẽ bắt đầu ngay.")) {
        return;
      }

      const originalText = this.innerText;
      this.innerText = "Đang xử lý...";
      this.disabled = true;

      fetch("/activity/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, type: type }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "success") {
            notyf.success(data.message || "Đã nhận xe. Bắt đầu tính giờ.");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            notyf.error(data.message || "Không thể nhận xe.");
            this.innerText = originalText;
            this.disabled = false;
          }
        })
        .catch((error) => {
          console.error("Lỗi:", error);
          notyf.error("Lỗi kết nối đến server!");
          this.innerText = originalText;
          this.disabled = false;
        });
    });
  });
}

// =========================================================
// TRẢ XE  → dừng đồng hồ, chốt cước 500đ/phút
// =========================================================
const returnBtns = document.querySelectorAll(".activity-card .btn-return");

if (returnBtns.length > 0) {
  returnBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      const type = this.getAttribute("data-type");

      if (!confirm("Xác nhận trả xe? Cước sẽ được tính 500đ/phút.")) {
        return;
      }

      const originalText = this.innerText;
      this.innerText = "Đang xử lý...";
      this.disabled = true;

      fetch("/activity/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, type: type }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "success") {
            const costText =
              data.cost != null
                ? ` Đã trả xe. Tổng cước: ${Number(data.cost).toLocaleString("vi-VN")} VNĐ.`
                : "";
            notyf.success((data.message || "Đã trả xe.") + costText);
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            notyf.error(data.message || "Không thể trả xe.");
            this.innerText = originalText;
            this.disabled = false;
          }
        })
        .catch((error) => {
          console.error("Lỗi:", error);
          notyf.error("Lỗi kết nối đến server!");
          this.innerText = originalText;
          this.disabled = false;
        });
    });
  });
}

// =========================================================
// GỬI XE (parking checkin)
// =========================================================
const parkBtns = document.querySelectorAll(".activity-card .btn-park");

if (parkBtns.length > 0) {
  parkBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      const type = this.getAttribute("data-type");

      if (!confirm("Xác nhận đã gửi xe vào vị trí đỗ?")) {
        return;
      }

      const originalText = this.innerText;
      this.innerText = "Đang xử lý...";
      this.disabled = true;

      fetch("/activity/park/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, type: type }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "success") {
            notyf.success(data.message || "Đã gửi xe.");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            notyf.error(data.message || "Không thể gửi xe.");
            this.innerText = originalText;
            this.disabled = false;
          }
        })
        .catch((error) => {
          console.error("Lỗi:", error);
          notyf.error("Lỗi kết nối đến server!");
          this.innerText = originalText;
          this.disabled = false;
        });
    });
  });
}

// =========================================================
// LẤY XE RA (parking checkout)
// =========================================================
const checkoutBtns = document.querySelectorAll(".activity-card .btn-checkout");

if (checkoutBtns.length > 0) {
  checkoutBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      const type = this.getAttribute("data-type");

      if (!confirm("Xác nhận lấy xe ra khỏi chỗ đỗ?")) {
        return;
      }

      const originalText = this.innerText;
      this.innerText = "Đang xử lý...";
      this.disabled = true;

      fetch("/activity/park/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, type: type }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "success") {
            notyf.success(data.message || "Đã lấy xe ra.");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            notyf.error(data.message || "Không thể lấy xe ra.");
            this.innerText = originalText;
            this.disabled = false;
          }
        })
        .catch((error) => {
          console.error("Lỗi:", error);
          notyf.error("Lỗi kết nối đến server!");
          this.innerText = originalText;
          this.disabled = false;
        });
    });
  });
}