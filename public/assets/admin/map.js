// ==========================================
// LOGIC CHỌN TỌA ĐỘ TRÊN BẢN ĐỒ (BẢN TỐI ƯU)
// ==========================================

const mapInstances = {}; 
const markerInstances = {}; 
const selectedCoords = {}; 

// Gắn sự kiện click cho toàn bộ document (Event Delegation)
document.addEventListener("click", function(e) {
  // Kiểm tra xem thẻ bị click có class 'js-open-map' hoặc nằm trong nút đó không
  const btn = e.target.closest(".js-open-map");
  if (!btn) return;

  const target = btn.getAttribute("data-target"); // 'add' hoặc 'edit'
  
  // Ánh xạ ID
  let mapModalId, mapContainerId, gpsInputId, btnCloseId, btnConfirmId;
  if (target === 'add') {
    mapModalId = 'mapModalOverlay'; mapContainerId = 'mapPicker';
    gpsInputId = 'gpsInput'; btnCloseId = 'btnCloseMap'; btnConfirmId = 'btnConfirmMap';
  } else {
    mapModalId = 'mapModalOverlay-edit'; mapContainerId = 'mapPickerEdit';
    gpsInputId = 'gpsInputEdit'; btnCloseId = 'btnCloseMapEdit'; btnConfirmId = 'btnConfirmMapEdit';
  }

  const mapModal = document.getElementById(mapModalId);
  const gpsInput = document.getElementById(gpsInputId);
  
  if (!mapModal) return;
  
  mapModal.classList.add("is-open");

  // Nếu là Edit, và đã từng mở map rồi, thì phải hủy map cũ đi tạo map mới
  // (Vì khi render lại form, cái thẻ div chứa map đã bị xóa và tạo lại)
  if (target === 'edit' && mapInstances[target]) {
    mapInstances[target].remove();
    mapInstances[target] = null;
  }

  if (!mapInstances[target]) {
    let startLat = 10.8806; 
    let startLng = 106.8053;
    let zoomLevel = 15;

    if (gpsInput && gpsInput.value) {
      const coords = gpsInput.value.split(",");
      if (coords.length === 2) {
        const parsedLat = parseFloat(coords[0].trim());
        const parsedLng = parseFloat(coords[1].trim());
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          startLat = parsedLat;
          startLng = parsedLng;
          zoomLevel = 16;
          selectedCoords[target] = gpsInput.value;
        }
      }
    }

    mapInstances[target] = L.map(mapContainerId).setView([startLat, startLng], zoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap'
    }).addTo(mapInstances[target]);

    if (selectedCoords[target]) {
      markerInstances[target] = L.marker([startLat, startLng]).addTo(mapInstances[target])
        .bindPopup("Vị trí hiện tại").openPopup();
    }

    mapInstances[target].on('click', function (e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      selectedCoords[target] = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      if (markerInstances[target]) {
        mapInstances[target].removeLayer(markerInstances[target]);
      }
      markerInstances[target] = L.marker([lat, lng]).addTo(mapInstances[target])
        .bindPopup("Vị trí mới").openPopup();
    });
  }

  setTimeout(() => {
    if (mapInstances[target]) mapInstances[target].invalidateSize();
  }, 200);

  // Xử lý nút Đóng & Xác nhận
  const btnClose = document.getElementById(btnCloseId);
  const btnConfirm = document.getElementById(btnConfirmId);

  if (btnClose && !btnClose.dataset.bound) {
    btnClose.addEventListener("click", () => mapModal.classList.remove("is-open"));
    btnClose.dataset.bound = "true";
  }

  if (btnConfirm && !btnConfirm.dataset.bound) {
    btnConfirm.addEventListener("click", () => {
      if (selectedCoords[target]) {
        gpsInput.value = selectedCoords[target];
        mapModal.classList.remove("is-open");
      } else {
        alert("Vui lòng click chọn một vị trí trên bản đồ trước khi xác nhận!");
      }
    });
    btnConfirm.dataset.bound = "true";
  }

  if (!mapModal.dataset.bound) {
    mapModal.addEventListener("click", (e) => {
      if (e.target === mapModal) mapModal.classList.remove("is-open");
    });
    mapModal.dataset.bound = "true";
  }
});