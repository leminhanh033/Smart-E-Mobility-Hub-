document.addEventListener("DOMContentLoaded", function () {
  const mapContainer = document.getElementById('hubMap');

  if (mapContainer) {
    // ==========================================
    // 1. KHỞI TẠO BẢN ĐỒ (Khởi tạo trước)
    // ==========================================
    const map = L.map('hubMap').setView([10.8806, 106.8053], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const panel = document.getElementById('hubDetailPanel');
    const btnClosePanel = document.getElementById('btnClosePanel');

    if (btnClosePanel) {
      btnClosePanel.addEventListener('click', function () {
        panel.style.display = 'none';
      });
    }
    map.on('click', function () {
      panel.style.display = 'none';
    });

    // ==========================================
    // 2. TẢI DỮ LIỆU VÀ VẼ MARKER
    // ==========================================
    let hubsData = [];

    async function loadHubs() {
      try {
        const res = await fetch("/admin/hubs/get", { method: "PATCH" });
        const data = await res.json();
        hubsData = data.hubList;

        hubsData.forEach(hub => {
          const isOverload = hub.status === 'QUÁ TẢI' || hub.status === 'overload';
          const color = isOverload ? '#f59e0b' : '#00d67d';

          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: white; border: 2px solid ${color}; padding: 4px 8px; border-radius: 20px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                   <span style="color: ${color}; margin-right: 4px;">●</span> ${hub.name}
                 </div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          });

          // Backend của bạn trả về lat, lng chuẩn
          const marker = L.marker([hub.lat, hub.lng], { icon: customIcon }).addTo(map);

          marker.on('click', function () {
            showHubPanel(hub);
            map.panTo([hub.lat, hub.lng]);
          });
        });

      } catch (error) {
        console.error("Lỗi khi tải hoặc vẽ hub:", error);
      }
    }

    // ==========================================
    // 3. HIỂN THỊ PANEL 
    // ==========================================
    // Hàm hiển thị Panel thông tin
    function showHubPanel(hub) {
      const panel = document.getElementById('hubDetailPanel');
      if (!panel) return;

      // 1. Thông tin cơ bản
      document.getElementById('panelHubName').textContent = hub.name;
      // Xử lý địa chỉ (nếu rỗng thì hiện dòng chữ mặc định)
      document.getElementById('panelAddress').textContent = hub.address || "Chưa cập nhật địa chỉ";

      // 2. Badge Trạng thái
      const badge = document.getElementById('panelStatusBadge');
      if (hub.status === 'inactive') {
        badge.textContent = "TẠM DỪNG";
        badge.className = 'panel-badge panel-badge--danger';
      } else {
        badge.textContent = "HOẠT ĐỘNG";
        badge.className = 'panel-badge panel-badge--success';
      }

      // 3. Tính toán số liệu
      const parkingTotal = hub.parkingNumber || 0;
      const parkingUsed = hub.parkingUsed || 0;
      const parkingEmpty = parkingTotal - parkingUsed;

      // 4. Đắp số liệu vào Panel
      // Giả sử cột 'vehicles' của bạn là tổng số xe đang đỗ + đang sạc
      const totalVehicles = parkingUsed + (hub.chargingUsed || 0);
      document.getElementById('panelVehicles').textContent = totalVehicles;

      document.getElementById('panelParkingUsed').textContent = `${parkingUsed} / ${parkingTotal}`;
      document.getElementById('panelParkingEmpty').textContent = parkingEmpty;

      document.getElementById('panelAC').textContent = hub.ACNumber || 0;
      document.getElementById('panelDC').textContent = hub.DCNumber || 0;

      // Tạm thời để 0 vì DB của bạn chưa có trường này (hoặc bạn tự viết API đếm)
      document.getElementById('panelLowBat').textContent = "0";

      // 5. Hiển thị Panel lên
      panel.style.display = 'flex';
    }

    // Gọi hàm load dữ liệu
    loadHubs();
  }
});


