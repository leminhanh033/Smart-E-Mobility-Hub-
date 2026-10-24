module.exports.errorList = [
  
  {
    id: "ERR-EV-001",
    name: "Lỗi quá nhiệt pin",
    severity: "critical",
    description: "Nhiệt độ pin vượt ngưỡng an toàn. Xe tự động ngắt nguồn."
  },
  {
    id: "ERR-EV-002",
    name: "Lỗi không nhận sạc",
    severity: "high",
    description: "Cắm sạc nhưng không vào điện. Hỏng cổng sạc hoặc lỗi mạch BMS."
  },
  {
    id: "ERR-EV-003",
    name: "Mất kết nối định vị (GPS/IoT)",
    severity: "medium",
    description: "Xe mất tín hiệu với hệ thống. Không thể khóa/mở bằng App."
  },
  {
    id: "ERR-EV-004",
    name: "Lỗi động cơ / Tay ga",
    severity: "critical",
    description: "Cảm biến Hall bị lỗi hoặc tay ga kẹt. Xe bị giật hoặc không lên ga."
  },
  {
    id: "ERR-EV-005",
    name: "Lỗi hệ thống phanh",
    severity: "critical",
    description: "Cảm biến phanh không hoạt động. Xe không tự ngắt động cơ khi bóp phanh."
  },
  {
    id: "ERR-EV-000",
    name: "Lỗi khác",
  },
];
