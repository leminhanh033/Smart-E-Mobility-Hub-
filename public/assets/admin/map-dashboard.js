document.addEventListener("DOMContentLoaded", function () {
  const mapContainer = document.getElementById("hubMapDashboard");

  // 1. Kiểm tra thẻ div có tồn tại không
  if (!mapContainer) return;

  if (typeof L === "undefined") {
    console.error("Leaflet chưa được tải.");
    return;
  }

  // ==========================================
  // 2. KHỞI TẠO BẢN ĐỒ
  // ==========================================
  let map = window.nocMapInstance;

  if (map && map.getContainer() === mapContainer) {
    map.invalidateSize();
  } else {
    if (map) {
      map.remove();
      window.nocMapInstance = null;
    }

    // Kiểm tra xem thẻ này đã bị script khác khởi tạo chưa
    if (mapContainer._leaflet_id) {
      console.error("hubMapDashboard đã được khởi tạo bởi script khác.");
      return;
    }

    // Khởi tạo bản đồ
    map = L.map("hubMapDashboard", {
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      zoomControl: true,
      tap: false
    }).setView([10.8806, 106.8053], 15);

    window.nocMapInstance = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
  }

  // setTimeout(() => { 
  //   map.invalidateSize(); 
  //   map.dragging.enable();
  // }, 300);
    map.invalidateSize(); 
    map.dragging.enable();

  // ==========================================
  // 3. XỬ LÝ PANEL CHI TIẾT
  // ==========================================
  const panel = document.getElementById("hubDetailPanel");
  const btnClosePanel = document.getElementById("btnClosePanel");

  function closePanel() {
    if (panel) panel.style.display = "none";
  }

  if (btnClosePanel) {
    btnClosePanel.addEventListener("click", closePanel);
  }

  map.off("click", closePanel);
  map.on("click", closePanel);

  function showHubPanel(hub, isOverload) {
    if (!panel) return;

    const setText = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };

    setText("panelHubName", hub.name);
    setText("panelAddress", hub.address || "Chưa cập nhật địa chỉ");
    setText("panelParking", `${hub.parkingUsed || 0} / ${hub.parkingNumber || 0}`);
    setText("panelAC", hub.ACNumber || 0);
    setText("panelDC", hub.DCNumber || 0);

    const badge = document.getElementById("panelStatusBadge");
    if (badge) {
      badge.textContent = isOverload ? "QUÁ TẢI" : "HOẠT ĐỘNG";
      badge.className = isOverload
        ? "panel-badge panel-badge--warning"
        : "panel-badge panel-badge--success";
    }

    panel.style.display = "flex";
  }

  // ==========================================
  // 4. LAYER CHỨA MARKER (Chống vẽ trùng)
  // ==========================================
  let markerLayer = window.nocHubMarkerLayer;

  if (markerLayer && map.hasLayer(markerLayer)) {
    markerLayer.clearLayers();
  } else {
    markerLayer = L.layerGroup().addTo(map);
    window.nocHubMarkerLayer = markerLayer;
  }

  // ==========================================
  // 5. GỌI API BACKEND LẤY DỮ LIỆU
  // ==========================================
  async function fetchHubs() {
    try {
      const response = await fetch("/admin/hubs/get", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.hubList)) {
        return data.hubList;
      }
      
      throw new Error("Dữ liệu trả về không chứa mảng hubList.");
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu HUB:", error);
      return []; // Trả về mảng rỗng nếu lỗi để không sập code
    }
  }

  // ==========================================
  // 6. VẼ MARKER LÊN BẢN ĐỒ
  // ==========================================
  function renderHubs(hubs) {
    if (!hubs || hubs.length === 0) {
      console.warn("Không có HUB nào để vẽ.");
      return;
    }

    markerLayer.clearLayers();

    hubs.forEach(hub => {
      // Backend đã ép kiểu số (parseFloat, parseInt) nên có thể dùng trực tiếp
      const lat = hub.lat;
      const lng = hub.lng;

      if (isNaN(lat) || isNaN(lng)) return;

      // Tính toán xem Hub có bị quá tải không
      const totalPorts = (hub.ACNumber || 0) + (hub.DCNumber || 0);
      const usedPorts = hub.chargingUsed || 0;
      const isOverload = totalPorts > 0 && usedPorts >= totalPorts;
      const color = isOverload ? "#f59e0b" : "#00d67d";

      // Tạo nhãn Marker
      const customIcon = L.divIcon({
        className: "custom-marker-wrapper",
        html: `<div class="custom-marker-label" style="border-color: ${color};">
                 <span style="width: 10px; height: 10px; background-color: ${color}; border-radius: 50%; display: inline-block;"></span> 
                 ${hub.name}
               </div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      // Thêm Marker vào layer
      const marker = L.marker([lat, lng], {
        icon: customIcon,
        riseOnHover: true,
        draggable: false
      }).addTo(markerLayer);

      // Bắt sự kiện Click vào Marker
      marker.on("click", event => {
        L.DomEvent.stopPropagation(event); // Ngăn click lan ra map
        showHubPanel(hub, isOverload);
        map.panTo(marker.getLatLng());
      });
    });

  }

  // ==========================================
  // 7. CHẠY CHƯƠNG TRÌNH
  // ==========================================
  (async function init() {
    const hubs = await fetchHubs();
    renderHubs(hubs);
  })();
});