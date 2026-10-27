/* =========================================
   MAP - Trang Tìm xe & Hub (Đọc Params từ URL)
   ========================================= */

var map = null;
var markerStart = null;
var markerEnd = null;
var routeLine = null;

// Tọa độ mặc định (Trung tâm ĐHQG HCM) nếu URL không có params
var DEFAULT_CENTER = [10.8806, 106.8053];
var DEFAULT_ZOOM = 15;

var HUBS = {
  start: { name: 'Vị trí xuất phát', lat: null, lng: null, color: '#00d67d' },
  end: { name: 'Vị trí đích', lat: null, lng: null, color: '#f59e0b' }
};

// ----- 1. Hàm đọc tham số từ URL -----
function loadParamsFromURL() {
  var params = new URLSearchParams(window.location.search);
  
  var fromLat = parseFloat(params.get('fromLat'));
  var fromLng = parseFloat(params.get('fromLng'));
  var toLat = parseFloat(params.get('toLat'));
  var toLng = parseFloat(params.get('toLng'));
  
  // Lấy thêm tên (nếu có truyền lên URL)
  var fromName = params.get('fromName');
  var toName = params.get('toName');

  // Cập nhật tọa độ nếu có dữ liệu hợp lệ
  if (!isNaN(fromLat) && !isNaN(fromLng)) {
    HUBS.start.lat = fromLat;
    HUBS.start.lng = fromLng;
    if (fromName) HUBS.start.name = fromName;
  }

  if (!isNaN(toLat) && !isNaN(toLng)) {
    HUBS.end.lat = toLat;
    HUBS.end.lng = toLng;
    if (toName) HUBS.end.name = toName;
  }
}

// ----- 2. Tạo icon marker -----
function createMarkerIcon(color) {
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">' +
      '<path d="M17 0C10.4 0 5 5.4 5 12c0 9 12 22 12 22s12-13 12-22c0-6.6-5.4-12-12-12z" ' +
        'fill="' + color + '" stroke="#ffffff" stroke-width="2"/>' +
      '<circle cx="17" cy="12" r="5" fill="#ffffff"/>' +
    '</svg>';

  return L.divIcon({
    className: 'custom-marker',
    html: svg,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34]
  });
}

// ----- 3. Khởi tạo bản đồ cơ bản -----
function initMap() {
  var mapEl = document.getElementById('map');
  if (!mapEl) return;

  map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  routeLine = L.polyline([], {
    color: '#00d67d',
    weight: 4,
    opacity: 0.8,
    dashArray: '10, 6'
  }).addTo(map);
}

// ----- 4. Vẽ Marker và Đường đi -----
function drawMapData() {
  if (!map) return;

  // 1. Vẽ Marker xuất phát
  if (HUBS.start.lat && HUBS.start.lng) {
    markerStart = L.marker([HUBS.start.lat, HUBS.start.lng], {
      icon: createMarkerIcon(HUBS.start.color)
    }).addTo(map);
    markerStart.bindPopup('<strong>' + HUBS.start.name + '</strong>');
  }

  // 2. Vẽ Marker điểm đến
  if (HUBS.end.lat && HUBS.end.lng) {
    markerEnd = L.marker([HUBS.end.lat, HUBS.end.lng], {
      icon: createMarkerIcon(HUBS.end.color)
    }).addTo(map);
    markerEnd.bindPopup('<strong>' + HUBS.end.name + '</strong>');
  }

  // 3. Nếu có đủ 2 tọa độ thì vẽ đường
  if (HUBS.start.lat && HUBS.start.lng && HUBS.end.lat && HUBS.end.lng) {
    drawRoute();
  } else if (HUBS.start.lat) {
    // Nếu chỉ có điểm xuất phát, zoom tới điểm đó
    map.setView([HUBS.start.lat, HUBS.start.lng], 16);
  } else if (HUBS.end.lat) {
    // Nếu chỉ có điểm đến, zoom tới điểm đó
    map.setView([HUBS.end.lat, HUBS.end.lng], 16);
  }
}

// ----- 5. Vẽ đường đi (OSRM) -----
function drawRoute() {
  var url = 'https://router.project-osrm.org/route/v1/driving/' +
    HUBS.start.lng + ',' + HUBS.start.lat + ';' +
    HUBS.end.lng + ',' + HUBS.end.lat +
    '?overview=full&geometries=geojson';

  fetch(url)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data.routes || data.routes.length === 0) throw new Error('Không có route');

      var route = data.routes[0];
      var coords = [];
      for (var i = 0; i < route.geometry.coordinates.length; i++) {
        var c = route.geometry.coordinates[i];
        coords.push([c[1], c[0]]);
      }

      routeLine.setLatLngs(coords);
      updateRouteInfo(route.distance, route.duration);
      
      // Tự động zoom vừa vặn với đường đi
      map.fitBounds(routeLine.getBounds(), { padding: [60, 60] });
    })
    .catch(function (err) {
      console.warn('OSRM lỗi, vẽ đường thẳng:', err);
      // Fallback: Vẽ đường thẳng nếu API lỗi
      routeLine.setLatLngs([
        [HUBS.start.lat, HUBS.start.lng],
        [HUBS.end.lat, HUBS.end.lng]
      ]);
      map.fitBounds(routeLine.getBounds(), { padding: [60, 60] });
    });
}

// ----- 6. Cập nhật Text Khoảng cách + Thời gian -----
function updateRouteInfo(distanceMeters, durationSeconds) {
  var elDist = document.querySelector('.book-shared-vehicle .route-info__distance');
  var elTime = document.querySelector('.book-shared-vehicle .route-info__time');
  if (!elDist || !elTime) return;

  var distText = distanceMeters < 1000 
    ? Math.round(distanceMeters) + ' m' 
    : (distanceMeters / 1000).toFixed(1) + ' km';

  var minutes = Math.max(1, Math.round(durationSeconds / 60));
  
  elDist.textContent = distText;
  elTime.innerHTML = '<i class="fa-solid fa-clock"></i> ~ ' + minutes + ' phút đi xe';
}

// ----- 7. Nút zoom (+ / -) -----
function bindZoomButtons() {
  var buttons = document.querySelectorAll('.book-shared-vehicle .map-zoom__btn');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function (e) {
      e.preventDefault();
      var type = this.getAttribute('data-zoom');
      if (type === 'in') map.zoomIn();
      if (type === 'out') map.zoomOut();
    });
  }
}

// ----- 8. Hàm chạy chính -----
function main() {

  // 1. Đọc tọa độ từ URL trước khi làm bất cứ việc gì
  loadParamsFromURL();

  // 2. Khởi tạo bản đồ
  initMap();
  if (!map) return;

  // 3. Vẽ dữ liệu (Marker & Route)
  drawMapData(); 
  bindZoomButtons();

  // 4. Fix lỗi kích thước bản đồ
  setTimeout(function () { 
    map.invalidateSize(); 
  }, 500);

  window.addEventListener('resize', function () { map.invalidateSize(); });
}

// Khởi chạy
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}