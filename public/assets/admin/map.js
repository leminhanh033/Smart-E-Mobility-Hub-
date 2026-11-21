// ==========================================
// MAP PICKER — CHỌN TỌA ĐỘ TRÊN BẢN ĐỒ
// ==========================================

(function () {
  "use strict";

  // ---------- Cấu hình ----------
  const SHOW_LAYER_SWITCHER = false;
  const MAX_TILE_ERRORS = 6;
  const DEFAULT_LAT = 10.8806;
  const DEFAULT_LNG = 106.8053;
  const DEFAULT_ZOOM = 15;

  // ---------- State ----------
  const mapInstances = {};
  const markerInstances = {};
  const selectedCoords = {};

  // ---------- Tiện ích ----------
  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Gắn tile layer + tự động fallback khi lỗi
  function attachTileLayer(map) {
    const baseLayers = {
      OpenStreetMap: L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 19, attribution: "&copy; OpenStreetMap" }
      ),
      "OSM France": L.tileLayer(
        "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
        {
          maxZoom: 20,
          subdomains: "abc",
          attribution: "&copy; OpenStreetMap France",
        }
      ),
      "OSM HOT": L.tileLayer(
        "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          subdomains: "abc",
          attribution: "&copy; OpenStreetMap | HOT",
        }
      ),
      "Esri - Đường phố": L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, attribution: "Tiles &copy; Esri" }
      ),
    };

    const layerNames = Object.keys(baseLayers);
    let currentName = layerNames[0];
    let currentLayer = baseLayers[currentName];
    currentLayer.addTo(map);

    if (SHOW_LAYER_SWITCHER) {
      L.control.layers(baseLayers, null, { position: "topright" }).addTo(map);
    }

    let errorCount = 0;
    const tried = new Set();

    map.on("baselayerchange", (e) => {
      currentName = e.name;
      currentLayer = e.layer;
      errorCount = 0;
    });

    layerNames.forEach((name) => {
      const layer = baseLayers[name];

      layer.on("tileload", () => {
        if (currentLayer === layer) errorCount = 0;
      });

      layer.on("tileerror", () => {
        if (currentLayer !== layer) return;
        errorCount++;
        if (errorCount < MAX_TILE_ERRORS) return;

        tried.add(currentName);
        const next = layerNames.find((n) => !tried.has(n));
        if (!next) {
          console.error("[map-picker] Tất cả nguồn tile đều lỗi.");
          return;
        }
        console.warn(`[map-picker] "${currentName}" lỗi, chuyển sang "${next}".`);
        map.removeLayer(currentLayer);
        currentName = next;
        currentLayer = baseLayers[next];
        currentLayer.addTo(map);
        errorCount = 0;
      });
    });
  }

  // Tạo map mới cho một target ('add' | 'edit')
  function createMapForTarget(target, containerId, gpsInput) {
    let startLat = DEFAULT_LAT;
    let startLng = DEFAULT_LNG;
    let zoom = DEFAULT_ZOOM;

    // Đọc tọa độ có sẵn trong input
    if (gpsInput && gpsInput.value) {
      const parts = gpsInput.value.split(",");
      if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          startLat = lat;
          startLng = lng;
          zoom = 16;
          selectedCoords[target] = gpsInput.value;
        }
      }
    }

    const map = L.map(containerId).setView([startLat, startLng], zoom);
    attachTileLayer(map);

    // Marker ban đầu (nếu có tọa độ sẵn)
    if (selectedCoords[target]) {
      markerInstances[target] = L.marker([startLat, startLng])
        .addTo(map)
        .bindPopup("Vị trí hiện tại")
        .openPopup();
    }

    // Click chọn tọa độ mới
    map.on("click", (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      selectedCoords[target] = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      if (markerInstances[target]) {
        map.removeLayer(markerInstances[target]);
      }
      markerInstances[target] = L.marker([lat, lng])
        .addTo(map)
        .bindPopup("Vị trí mới")
        .openPopup();
    });

    return map;
  }

  // Mở modal map
  function openMapModal(btn) {
    const target = btn.getAttribute("data-target"); // 'add' | 'edit'

    const ids =
      target === "add"
        ? {
            modal: "mapModalOverlay",
            container: "mapPicker",
            input: "gpsInput",
            close: "btnCloseMap",
            confirm: "btnConfirmMap",
          }
        : {
            modal: "mapModalOverlay-edit",
            container: "mapPickerEdit",
            input: "gpsInputEdit",
            close: "btnCloseMapEdit",
            confirm: "btnConfirmMapEdit",
          };

    const modal = document.getElementById(ids.modal);
    const gpsInput = document.getElementById(ids.input);
    if (!modal) return;

    modal.classList.add("is-open");

    // Nếu là edit và đã có map cũ → hủy để tạo lại (vì div có thể bị render lại)
    if (target === "edit" && mapInstances[target]) {
      mapInstances[target].remove();
      mapInstances[target] = null;
      markerInstances[target] = null;
    }

    // Tạo map nếu chưa có
    if (!mapInstances[target]) {
      mapInstances[target] = createMapForTarget(target, ids.container, gpsInput);
    }

    // Fix kích thước sau khi modal hiện
    setTimeout(() => {
      if (mapInstances[target]) mapInstances[target].invalidateSize();
    }, 200);

    // Bind nút Đóng
    const btnClose = document.getElementById(ids.close);
    if (btnClose && !btnClose.dataset.bound) {
      btnClose.addEventListener("click", () => modal.classList.remove("is-open"));
      btnClose.dataset.bound = "true";
    }

    // Bind nút Xác nhận
    const btnConfirm = document.getElementById(ids.confirm);
    if (btnConfirm && !btnConfirm.dataset.bound) {
      btnConfirm.addEventListener("click", () => {
        if (selectedCoords[target] && gpsInput) {
          gpsInput.value = selectedCoords[target];
          modal.classList.remove("is-open");
        } else {
          alert("Vui lòng click chọn một vị trí trên bản đồ trước khi xác nhận!");
        }
      });
      btnConfirm.dataset.bound = "true";
    }

    // Click nền mờ để đóng
    if (!modal.dataset.bound) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("is-open");
      });
      modal.dataset.bound = "true";
    }
  }

  // ---------- Event delegation ----------
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".js-open-map");
    if (!btn) return;
    openMapModal(btn);
  });
})();