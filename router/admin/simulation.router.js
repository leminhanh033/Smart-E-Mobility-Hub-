const router=require("express").Router();
const MOBILITY_HUB_NETWORK_DATA = {
  "HUB_BK_CS2": { name: "HUB_BK_CS2 (ĐH Bách Khoa CS2)", totalPorts: 8, activeCharging: 6, currentDemand: 6, availableSlots: 5, distanceFrom: "1.2 km" },
  "HUB_METRO": { name: "HUB_METRO (Ga Metro ĐHQG)", totalPorts: 10, activeCharging: 8, currentDemand: 8, availableSlots: 2, distanceFrom: "3.0 km" },
  "HUB_UIT_IU": { name: "HUB_UIT_IU (ĐH CNTT - Quốc Tế)", totalPorts: 8, activeCharging: 7, currentDemand: 7, availableSlots: 4, distanceFrom: "2.5 km" },
  "HUB_KTX_B": { name: "HUB_KTX_B (Ký túc xá B)", totalPorts: 12, activeCharging: 4, currentDemand: 4, availableSlots: 8, distanceFrom: "1.5 km" }
};


router.get("/demand/surging",(req,res)=>{
  res.render("pages/admin/simulation-demand-surging",{
    title:"Trang mô phỏng",
    activePage:"simulation",
  })
})

router.get("/full/parking",(req,res)=>{
  res.render("pages/admin/simulation-full-parking",{
    title:"Trang mô phỏng",
    activePage:"simulation",
  })
})

router.get("/charging/surge",(req,res)=>{
  res.render("pages/admin/simulation-charging-surge",{
    title:"Trang mô phỏng",
    activePage:"simulation",
    data: MOBILITY_HUB_NETWORK_DATA,
  })
})

router.get("/charging/point/failure",(req,res)=>{
  res.render("pages/admin/simulation-charging-failure",{
    title:"Trang mô phỏng",
    activePage:"simulation",
  })
})

router.get("/vehicle/concentration",(req,res)=>{
  res.render("pages/admin/simulation-concentration",{
    title:"Trang mô phỏng",
    activePage:"simulation",
  })
})

router.post('/charging/point/failure', (req, res) => {
  const { hubId, brokenPorts, currentDemand } = req.body;

  // 1. Dữ liệu nền: Sức chứa và vị trí của TẤT CẢ các Hub
  const hubsDB = {
    "HUB_UIT_IU": { totalPorts: 8, availableSlots: 4, distanceFrom: "2.5 km" },
    "HUB_BK_CS2": { totalPorts: 12, availableSlots: 5, distanceFrom: "1.2 km" },
    "HUB_METRO": { totalPorts: 10, availableSlots: 2, distanceFrom: "3.0 km" },
    "HUB_KTX_B": { totalPorts: 8, availableSlots: 8, distanceFrom: "1.5 km" }
  };

  const currentHub = hubsDB[hubId] || hubsDB["HUB_UIT_IU"];
  const totalPorts = currentHub.totalPorts;
  
  const broken = parseInt(brokenPorts) || 0;
  const demand = parseInt(currentDemand) || 0;

  // 2. Tính toán
  const remainingPorts = Math.max(0, totalPorts - broken);
  const unservedVehicles = Math.max(0, demand - remainingPorts);

  // 3. Xử lý giải pháp
  let recTitle = "Hệ thống ổn định";
  let recContent = `Các cổng sạc còn lại (${remainingPorts} cổng) đáp ứng đủ nhu cầu (${demand} xe). Không cần điều phối.`;
  let ticket = null;
  let status = "success";
  let actionPlan = [];

  if (unservedVehicles > 0) {
    status = "warning";
    recTitle = "Tái phân bổ Lịch sạc & Tối ưu hóa hàng đợi";
    recContent = `Phát hiện ${unservedVehicles} xe vượt quá công suất. Đề xuất phân bổ lại luồng xe.`;
    ticket = `#MT-2026-${Math.floor(100 + Math.random() * 900)}`;

    let remainingToHandle = unservedVehicles;
    
    // Giải pháp 1: Cho phép xếp hàng chờ (Tối đa 3 xe)
    const maxQueueCapacity = 3;
    const waitingCount = Math.min(remainingToHandle, maxQueueCapacity);
    
    if (waitingCount > 0) {
      actionPlan.push({
        type: 'wait',
        amount: waitingCount,
        note: `Xếp hàng chờ sạc (Ước tính: ~${waitingCount * 20} phút)`
      });
      remainingToHandle -= waitingCount;
    }

    // Giải pháp 2: Điều chuyển sang trạm khác (LỌC BỎ TRẠM HIỆN TẠI)
    if (remainingToHandle > 0) {
      // Lấy danh sách các Hub khác, BỎ QUA hubId hiện tại
      const targetHubs = Object.keys(hubsDB)
        .filter(id => id !== hubId) // <-- Dòng quan trọng nhất để sửa lỗi
        .map(id => ({
          id: id,
          availableSlots: hubsDB[id].availableSlots,
          distance: hubsDB[id].distanceFrom
        }));

      for (let hub of targetHubs) {
        if (remainingToHandle <= 0) break;
        if (hub.availableSlots <= 0) continue; // Bỏ qua nếu Hub đó đã đầy

        const moveCount = Math.min(remainingToHandle, hub.availableSlots);
        
        actionPlan.push({
          type: 'dispatch',
          targetHub: hub.id,
          amount: moveCount,
          distance: hub.distance // Có thể đổi tên distance thành distanceFromCurrent nếu muốn chuẩn xác hơn
        });
        
        remainingToHandle -= moveCount;
        
        // Cập nhật lại số slot trống của Hub đó (mô phỏng)
        hubsDB[hub.id].availableSlots -= moveCount; 
      }
    }
    
    if (remainingToHandle > 0) {
        actionPlan.push({
            type: 'dispatch',
            targetHub: "Trung tâm điều hành",
            amount: remainingToHandle,
            distance: "N/A",
            note: "Các Hub lân cận đều đã đầy"
        });
    }
  }

  // 4. Trả kết quả
  res.json({
    code: "success",
    data: {
      current: {
        totalPorts: `${totalPorts} cổng`,
        demand: `${demand} xe cần sạc`
      },
      simulated: {
        brokenPorts: `-${broken} cổng (Ngoại tuyến)`,
        remainingPorts: `${remainingPorts} / ${totalPorts} cổng`,
        warning: broken > 0 ? "Sụt giảm công suất sạc" : "Bình thường"
      },
      evaluation: {
        activePorts: `${remainingPorts} / ${totalPorts} cổng`,
        lostCapacity: broken > 0 ? `${broken} cổng mất khả năng phục vụ` : "Không mất cổng nào",
        demand: `${demand} xe`,
        unserved: `${unservedVehicles} xe`,
        unservedSub: unservedVehicles > 0 ? "Cần xử lý (Chờ/Điều chuyển)" : "Đáp ứng đủ"
      },
      recommendation: {
        title: recTitle,
        content: recContent,
        ticket: ticket,
        status: status,
        actionPlan: actionPlan
      }
    }
  });
});


router.post("/charging/demand/surge", (req, res) => {
  const { hubId, totalPorts, currentCharging, simulatedDemand, scenario, timeFrame } = req.body;

  const userTotalPorts = parseInt(totalPorts) || 0;
  const currentCharge = parseInt(currentCharging) || 0;
  const waitingDemand = parseInt(simulatedDemand) || 0;

  // TÍNH TOÁN CỐT LÕI THEO ĐÚNG YÊU CẦU:
  const availablePorts = Math.max(0, userTotalPorts - currentCharge);
  const overloadVehicles = Math.max(0, waitingDemand - availablePorts);

  let scenarioName = "";
  let maxQueueCapacity = 3; 
  let recTitle = "Hệ thống ổn định";
  let recContent = `Có ${availablePorts} cổng trống, đáp ứng đủ cho ${waitingDemand} xe đang chờ. Không cần điều phối.`;
  let status = "success";
  let actionPlan = [];

  if (scenario === "peak-hours") {
    scenarioName = "Cao điểm";
    maxQueueCapacity = 2;
  } else if (scenario === "event-surge") {
    scenarioName = "Sự kiện Đột xuất";
    maxQueueCapacity = 1;
  } else if (scenario === "night-charging") {
    scenarioName = "Sạc Qua đêm";
    maxQueueCapacity = 10;
  }

  if (overloadVehicles > 0) {
    status = "warning";
    recTitle = "Điều phối Khẩn cấp (" + scenarioName + ")";
    recContent = `Chỉ còn ${availablePorts} cổng trống, không thể đáp ứng ${overloadVehicles} xe đang chờ trong khung giờ ${timeFrame}.`;

    let remainingToHandle = overloadVehicles;

    const waitingCount = Math.min(remainingToHandle, maxQueueCapacity);
    if (waitingCount > 0) {
      actionPlan.push({
        type: 'wait',
        amount: waitingCount,
        note: `Xếp lịch sạc nội tiếp (Chờ ~${waitingCount * 25} phút)`
      });
      remainingToHandle -= waitingCount;
    }

    if (remainingToHandle > 0) {
      const targetHubs = Object.keys(MOBILITY_HUB_NETWORK_DATA)
        .filter(id => id !== hubId && MOBILITY_HUB_NETWORK_DATA[id].availableSlots > 0)
        .map(id => ({
          id: id,
          availableSlots: MOBILITY_HUB_NETWORK_DATA[id].availableSlots,
          distance: MOBILITY_HUB_NETWORK_DATA[id].distanceFrom
        }));

      for (let hub of targetHubs) {
        if (remainingToHandle <= 0) break;
        const moveCount = Math.min(remainingToHandle, hub.availableSlots);
        
        actionPlan.push({
          type: 'dispatch',
          targetHub: hub.id,
          amount: moveCount,
          distance: hub.distance
        });
        remainingToHandle -= moveCount;
      }
    }
  }

  res.json({
    code: "success",
    data: {
      current: {
        totalPorts: `${userTotalPorts} cổng`,
        currentDemand: `${currentCharge} xe`,
        timeFrame: timeFrame
      },
      simulated: {
        newDemand: `${waitingDemand} xe`,
        overload: `${overloadVehicles} xe`,
        scenarioName: scenarioName
      },
      evaluation: {
        totalPorts: `${userTotalPorts} cổng`,
        newDemand: `${waitingDemand} xe`,
        unserved: `${overloadVehicles} xe`,
        unservedSub: overloadVehicles > 0 ? "Cần xếp lịch / Điều hướng" : "Đáp ứng đủ"
      },
      recommendation: {
        title: recTitle,
        content: recContent,
        status: status,
        actionPlan: actionPlan
      }
    }
  });
});

module.exports=router;