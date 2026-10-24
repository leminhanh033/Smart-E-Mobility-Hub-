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


//Nhảy số đồng hồ trong activity-active
const timers = document.querySelectorAll(".activity-card__timer");
if (timers.length > 0) {
  timers.forEach((timer) => {
    const targetTimeStr = timer.getAttribute("data-target-time");
    const mode = timer.getAttribute("data-mode");
    const digitsEl = timer.querySelector(".timer-digits");

    if (!targetTimeStr) return;

    const targetTime = new Date(targetTimeStr).getTime();

    // Hàm cập nhật đồng hồ mỗi giây
    const updateTimer = () => {
      const now = new Date().getTime();
      let distance;

      if (mode === "countdown") {
        // Đếm ngược (Giữ chỗ)
        distance = targetTime - now;
        if (distance < 0) {
          digitsEl.innerText = "Hết hạn";
          digitsEl.style.color = "#ef4444"; // Đổi màu đỏ
          return;
        }
      } else {
        // Đếm tiến (Đang sử dụng)
        distance = now - targetTime;
      }

      // Tính giờ, phút, giây
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Format hiển thị
      if (mode === "countdown") {
        // Format: 14 : 59
        digitsEl.innerText =
          String(minutes).padStart(2, "0") + " : " +
          String(seconds).padStart(2, "0");
      } else {
        // Format: 00 : 08 : 42
        digitsEl.innerText =
          String(hours).padStart(2, "0") + " : " +
          String(minutes).padStart(2, "0") + " : " +
          String(seconds).padStart(2, "0");
      }
    };

    // Chạy lần đầu và lặp lại mỗi giây
    updateTimer();
    setInterval(updateTimer, 1000);
  });
}

//Lấy thông tin hub trong trang đặt chỗ đỗ
const parkingCards = document.querySelectorAll(".book-parking__list .parking-card");
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
// 2. XỬ LÝ CHỌN XE & CẬP NHẬT SUMMARY
// ==========================================
const desiredPinSelect = document.getElementById("desiredPinSelect");
const chargingDate = document.getElementById("chargingDate");
const chargingTime = document.getElementById("chargingTime");
const hubSelect = document.getElementById("hubSelect");
const chargingTypeSelect = document.getElementById("chargingType"); // Lấy thẻ chọn AC/DC
const durationRadios = document.querySelectorAll('input[name="duration"]');

// Set ngày mặc định hôm nay
if (chargingDate) chargingDate.value = new Date().toISOString().split('T')[0];

function updateSummary() {
  const selectedVehicle = document.querySelector(".vehicle-pick--selected");
  if (!selectedVehicle) return; // Chưa chọn xe thì không tính

  const vehicleName = selectedVehicle.getAttribute("data-name");
  const vehiclePlate = selectedVehicle.getAttribute("data-plate");
  const startPin = parseInt(selectedVehicle.getAttribute("data-pin"));

  const desiredPin = parseInt(desiredPinSelect.value);
  const dateVal = chargingDate.value;
  const timeVal = chargingTime.value;
  const hubText = hubSelect.options[hubSelect.selectedIndex].text;

  // Lấy loại cổng sạc đang chọn
  const portType = chargingTypeSelect ? chargingTypeSelect.value : "AC";

  // Lấy thời lượng từ radio button
  const selectedDuration = document.querySelector('.schedule-charging .schedule-section .duration .duration__options .duration-btn.active').getAttribute("time");

  // Cập nhật giao diện cột trái
  document.getElementById("currentPinDisplay").innerText = startPin + "%";

  // Cập nhật cột Summary bên phải
  document.getElementById("summaryVehicleName").innerText = vehicleName;
  document.getElementById("summaryVehiclePlate").innerText = "Biển số: " + vehiclePlate;

  // Tính thời gian kết thúc
  const [hours, minutes] = timeVal.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0);
  const endDate = new Date(startDate.getTime() + parseInt(selectedDuration) * 60000);
  const endTimeStr = String(endDate.getHours()).padStart(2, '0') + ":" + String(endDate.getMinutes()).padStart(2, '0');

  document.getElementById("summaryTimeRange").innerText = `${timeVal} - ${endTimeStr}`;
  document.getElementById("summaryTimeSlot").innerText = `${timeVal} - ${endTimeStr}`;
  document.getElementById("summaryPinRange").innerHTML = `${startPin}% &rarr; ${desiredPin}%`;
  document.getElementById("summaryDuration").innerText = `~${selectedDuration} phút`;
  document.getElementById("summaryHubName").innerText = hubText;
  // document.getElementById("summaryHubSlot").innerText = hubText.split(' - ')[0];

  // Cập nhật hiển thị Loại cổng (AC/DC) và Công suất vào Summary
  const summaryBlockSub = document.querySelector(".summary__block-sub");
  if (summaryBlockSub) {
    if (portType === "DC") {
      summaryBlockSub.innerText = "Công suất: 30 kW (DC Fast Charging)";
    } else {
      summaryBlockSub.innerText = "Công suất: 3.3 kW (AC Standard)";
    }
  }

  // Cập nhật text trong Time Slot
  const timeSlotMeta = document.querySelector(".time-slot__meta span");
  if (timeSlotMeta) {
    timeSlotMeta.innerHTML = `Cổng tự động &bull; Trụ ${portType} Standard`;
  }

  const cost = parseInt(selectedDuration) * 500;
  document.getElementById("summaryCost").innerText = cost.toLocaleString('vi-VN') + " VND";

  const [year, month, day] = dateVal.split("-");
  document.getElementById("summaryDate").innerText = `${day}/${month}/${year}`;
}

// Gắn sự kiện cho các lựa chọn
document.querySelectorAll(".vehicle-pick:not(.vehicle-pick--add)").forEach(pick => {
  pick.addEventListener("click", () => {
    document.querySelectorAll(".vehicle-pick").forEach(p => p.classList.remove("vehicle-pick--selected"));
    pick.classList.add("vehicle-pick--selected");
    updateSummary();
  });
});

if (desiredPinSelect) desiredPinSelect.addEventListener("change", updateSummary);
if (chargingDate) chargingDate.addEventListener("change", updateSummary);
if (chargingTime) chargingTime.addEventListener("change", updateSummary);
if (hubSelect) hubSelect.addEventListener("change", updateSummary);
if (chargingTypeSelect) chargingTypeSelect.addEventListener("change", updateSummary); // Lắng nghe sự kiện đổi AC/DC

if (durationRadios) {
  durationRadios.forEach(radio => {
    radio.addEventListener("change", function () {
      document.querySelectorAll(".duration-btn").forEach(btn => btn.classList.remove("active"));
      this.nextElementSibling.classList.add("active");
      updateSummary();
    });
  });
}

// Chạy lần đầu
updateSummary();


// ==========================================
// 3. XỬ LÝ NÚT XÁC NHẬN ĐẶT LỊCH
// ==========================================
const btnConfirmCharging = document.getElementById("btnConfirmCharging");
if (btnConfirmCharging) {
  btnConfirmCharging.addEventListener("click", function () {
    const selectedVehicle = document.querySelector(".vehicle-pick--selected");
    if (!selectedVehicle) {
      notyf.error("Vui lòng chọn xe cần sạc!");
      return;
    }

    const vehicleId = selectedVehicle.getAttribute("data-id");
    const hubId = hubSelect.value;
    const desiredPin = desiredPinSelect.value;
    const date = chargingDate.value;
    const time = chargingTime.value;
    const duration = document.querySelector('input[name="duration"]:checked').value;

    // Lấy loại cổng sạc
    const portType = chargingTypeSelect ? chargingTypeSelect.value : "AC";

    this.innerText = "Đang xử lý...";
    this.disabled = true;

    fetch("/book/charging/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Thêm portType vào body gửi đi
      body: JSON.stringify({
        vehicleOwnerID:vehicleId,
        hubId,
        desiredPin,
        date,
        time,
        duration,
        portType,
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.code === "success") {
          notyf.success(data.message);
          setTimeout(() => { window.location.href = "/activity/active"; }, 1500);
        } else {
          notyf.error(data.message);
          this.innerText = "Xác nhận";
          this.disabled = false;
        }
      })
      .catch(() => {
        notyf.error("Lỗi kết nối!");
        this.innerText = "Xác nhận";
        this.disabled = false;
      });
  });
}

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