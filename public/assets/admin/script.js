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

document.addEventListener("DOMContentLoaded", function () {
  // 1. Tìm các element cần thiết
  var menuToggleBtn = document.getElementById("menuToggle");
  var headerElement = document.querySelector(".dashboard-header");
  var sidebarElement = document.getElementById("adminSidebar");
  var overlayElement = document.getElementById("sidebarOverlay");

  // 2. Nếu có nút menu thì bắt đầu gắn sự kiện
  if (menuToggleBtn) {
    menuToggleBtn.addEventListener("click", function () {
      // Thêm hoặc xoá class "active" cho header (theo yêu cầu)
      if (headerElement) {
        headerElement.classList.toggle("active");
      }

      // Đồng thời mở/đóng sidebar và lớp overlay (để menu trượt ra)
      if (sidebarElement) {
        sidebarElement.classList.toggle("is-open");
      }
      if (overlayElement) {
        overlayElement.classList.toggle("is-open");
      }
    });
  }

  if (overlayElement) {
    overlayElement.addEventListener("click", function () {
      if (headerElement) {
        headerElement.classList.remove("active");
      }

      if (sidebarElement) {
        sidebarElement.classList.remove("is-open");
      }
      overlayElement.classList.remove("is-open");
    });
  }
});


const addHubBtns = document.querySelector(".btn-add-hub");
const createModalOverlay = document.querySelector("#addHubModal");
if (addHubBtns) {
  addHubBtns.addEventListener("click", () => {
    createModalOverlay.classList.add("is-open");
  });

  // 2. Xử lý sự kiện Đóng Modal (Click nút X hoặc nút Hủy)
  const closeModalBtns = document.querySelectorAll("#closeModalBtn, #cancelModalBtn");

  if (closeModalBtns.length > 0 && createModalOverlay) {
    closeModalBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        createModalOverlay.classList.remove("is-open");
      });
    });
  }

  // 3. Đóng Modal khi click ra ngoài vùng trắng (Click vào lớp overlay)
  createModalOverlay.addEventListener("click", (e) => {
    if (e.target === createModalOverlay) {
      createModalOverlay.classList.remove("is-open");
    }
  });
}

//Tạo hub mới
const createHub = document.querySelector(".app-container .modal-overlay .modal-container .modal-footer #hubCreateButton");
if (createHub) {
  const validate = new JustValidate('#create-hub');
  validate
    .addField('#hubID', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập ID",
      },
    ])
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập tên hub",
      },
    ])
    .addField('#gpsInput', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập toạ độ GPS",
      },
    ])
    .onSuccess((event) => {
      const hubID = event.target.hubID.value;
      const name = event.target.name.value;
      const address = event.target.address.value;
      const gps = event.target.gpsInput.value;
      const parkingNumber = event.target.parkingNumber.value;
      const ACNumber = event.target.ACNumber.value;
      const DCNumber = event.target.DCNumber.value;

      fetch("/admin/hub/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hubID: hubID,
          name: name,
          address: address,
          gps: gps,
          parkingNumber: parkingNumber,
          ACNumber: ACNumber,
          DCNumber: DCNumber,
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.code == "success") {
            createModalOverlay.classList.remove("is-open");
            alertMessage(data);
            window.location.href = "/admin/hub/list";
          }
          if (data.code == "error") {
            notyf.error(data.message);
          }
        })
    })
}

//Bật tắt chỉnh sửa hub

const editHubBtnsList = document.querySelectorAll(".app-container .dashboard .hub-list .hub-table .btn-edit");
const editModalOverlay = document.querySelector("#editHubModal");
if (editHubBtnsList.length > 0) {
  editHubBtnsList.forEach(editHubBtns => {
    editHubBtns.addEventListener("click", () => {
      const id = editHubBtns.getAttribute("data-id");
      fetch(`/admin/hub/get/${id}`, {
        method: "PATCH",
      })
        .then(res => res.json())
        .then(data => {
          // const editForm = document.querySelector("#edit-hub");
          const hub = data.hub;
          document.getElementById("dataID").value = hub._id || hub.id;
          document.getElementById("hubIDEdit").value = hub.hubID || "";
          document.getElementById("nameEdit").value = hub.name || "";
          document.getElementById("addressEdit").value = hub.address || "";
          document.getElementById("gpsInputEdit").value = hub.gps || "";

          document.getElementById("parkingNumberEdit").value = hub.parkingNumber || 0;
          document.getElementById("ACNumberEdit").value = hub.ACNumber || 0;
          document.getElementById("DCNumberEdit").value = hub.DCNumber || 0;

          // Chọn đúng option Trạng thái
          const statusSelect = document.getElementById("statusEdit");
          if (statusSelect) {
            statusSelect.value = hub.status || "active";
          }

        })
      editModalOverlay.classList.add("is-open");
    });

    // 2. Xử lý sự kiện Đóng Modal (Click nút X hoặc nút Hủy)
    const closeModalBtns = document.querySelectorAll("#closeModalBtnEdit, #cancelModalBtnEdit");

    if (closeModalBtns.length > 0 && editModalOverlay) {
      closeModalBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          editModalOverlay.classList.remove("is-open");
        });
      });
    }

    // 3. Đóng Modal khi click ra ngoài vùng trắng (Click vào lớp overlay)
    editModalOverlay.addEventListener("click", (e) => {
      if (e.target === editModalOverlay) {
        editModalOverlay.classList.remove("is-open");
      }
    });
  })
}

//Chỉnh sửa hub
const editHub = document.querySelector(".app-container .modal-overlay .modal-container .modal-footer #hubEditButton");
if (editHub) {
  const validate = new JustValidate('#edit-hub');
  validate
    .addField('#hubIDEdit', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập ID",
      },
    ])
    .addField('#nameEdit', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập tên hub",
      },
    ])
    .addField('#gpsInputEdit', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập toạ độ GPS",
      },
    ])
    .onSuccess((event) => {
      const id = event.target.dataID.value;
      const hubID = event.target.hubIDEdit.value;
      const name = event.target.nameEdit.value;
      const address = event.target.addressEdit.value;
      const gps = event.target.gpsInputEdit.value;
      const status = event.target.statusEdit.value;
      const parkingNumber = event.target.parkingNumberEdit.value;
      const ACNumber = event.target.ACNumberEdit.value;
      const DCNumber = event.target.DCNumberEdit.value;

      fetch("/admin/hub/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          hubID: hubID,
          name: name,
          address: address,
          gps: gps,
          status: status,
          parkingNumber: parkingNumber,
          ACNumber: ACNumber,
          DCNumber: DCNumber,
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.code == "success") {
            editModalOverlay.classList.remove("is-open");
            alertMessage(data);
            window.location.href = "/admin/hub/list";
          }
          if (data.code == "error") {
            notyf.error(data.message);
          }
        })
    })
}

const toggleSwitchList = document.querySelectorAll(".app-container .dashboard .hub-list .hub-table .toggle-switch input");
if (toggleSwitchList.length > 0) {
  toggleSwitchList.forEach(button => {
    button.addEventListener("change", () => {
      const id = button.getAttribute("id");
      fetch("/admin/hub/turn", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
        })
      })
        .then(res => res.json())
        .then(data => {
        })
    })

  })
}

// Đóng mở form thêm xe
const modalOverlay = document.getElementById("addVehicleModal");
const btnOpenModal = document.querySelector(".vehicle-list .add-vehicle button");
const btnCloseModal = document.querySelector("#addVehicleModal .modal-close");
const btnCancelModal = document.querySelector("#addVehicleModal .btn-cancel");
// Mở modal khi click "Thêm xe mới"
if (btnOpenModal && modalOverlay) {
  btnOpenModal.addEventListener("click", () => {
    modalOverlay.classList.add("is-open");
  });
}
// Đóng modal khi click nút X
if (btnCloseModal) {
  btnCloseModal.addEventListener("click", () => {
    modalOverlay.classList.remove("is-open");
  });
}
// Đóng modal khi click nút "Hủy"
if (btnCancelModal) {
  btnCancelModal.addEventListener("click", () => {
    modalOverlay.classList.remove("is-open");
  });
}
// Đóng modal khi click ra ngoài (vào overlay)
if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove("is-open");
    }
  });
}
// Đóng modal khi nhấn ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay?.classList.contains("is-open")) {
    modalOverlay.classList.remove("is-open");
  }
});


//  TẠO VEHICLE (THÊM MỚI)
const createVehicle = document.querySelector(".app-container .modal-overlay .modal-container .modal-body form");
if (createVehicle) {
  const validate = new JustValidate('#create-vehicle');
  validate
    .addField('#vehicleCode', [
      { rule: 'required', errorMessage: "Vui lòng nhập mã xe" }
    ])
    .addField('#license', [
      { rule: 'required', errorMessage: "Vui lòng nhập biển số xe" }
    ])
    .addField('#VIN', [
      { rule: 'required', errorMessage: "Vui lòng nhập VIN / Số khung" }
    ])
    .addField('#batteryCapacity', [
      { rule: 'required', errorMessage: "Vui lòng nhập dung lượng pin" },
      { rule: 'minNumber', value: 0, errorMessage: "Dung lượng pin phải lớn hơn 0" },
    ])
    .onSuccess((event) => {
      const vehicleCode = event.target.vehicleCode.value;
      const license = event.target.license.value; // Lấy biển số
      const VIN = event.target.VIN.value;
      const type = event.target.type.value;
      const model = event.target.model.value;
      const batteryCapacity = event.target.batteryCapacity.value;
      const hubID = event.target.hubID.value;
      const status = event.target.status.value;
      
      fetch("/admin/vehicle/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleCode,
          license, // Gửi biển số lên backend
          VIN,
          type: type,
          model: model,
          batteryCapacity: parseFloat(batteryCapacity),
          hubID,
          status: status,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.code == "success") {
            createModalOverlay.classList.remove("is-open");
            alertMessage(data);
            window.location.href = "/admin/vehicle/list";
          }
          if (data.code == "error") {
            notyf.error(data.message);
          }
        });
    });
}


//  CHỈNH SỬA VEHICLE (SUBMIT FORM)
const editVehicle = document.querySelector("#edit-vehicle");
if (editVehicle) {
  const validate = new JustValidate('#edit-vehicle');
  validate
    .addField('#vehicleCode', [
      { rule: 'required', errorMessage: "Vui lòng nhập mã xe" }
    ])
    .addField('#license', [
      { rule: 'required', errorMessage: "Vui lòng nhập biển số xe" }
    ])
    .addField('#VIN', [
      { rule: 'required', errorMessage: "Vui lòng nhập VIN / Số khung" }
    ])
    .addField('#batteryCapacity', [
      { rule: 'required', errorMessage: "Vui lòng nhập dung lượng pin" },
      { rule: 'minNumber', value: 0, errorMessage: "Dung lượng pin phải lớn hơn 0" },
    ])
    .onSuccess((event) => {
      const button = document.querySelector(".vehicle-list .modal-overlay#editVehicleModal .modal-footer .btn-submit");
      const id = button.getAttribute("data-id");
      
      const vehicleCode = event.target.vehicleCode.value;
      const license = event.target.license.value; // Lấy biển số
      const VIN = event.target.VIN.value;
      const type = event.target.type.value;
      const model = event.target.model.value;
      const batteryCapacity = event.target.batteryCapacity.value;
      const hubID = event.target.hubID.value;
      const status = event.target.status.value;
      
      
      fetch("/admin/vehicle/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          vehicleCode,
          license, // Gửi biển số lên backend
          VIN,
          type: type,
          model: model,
          batteryCapacity: parseFloat(batteryCapacity),
          hubID,
          status: status,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.code == "success") {
            const editModalOverlay = document.querySelector("#editVehicleModal");
            if (editModalOverlay) editModalOverlay.classList.remove("is-open");
            
            alertMessage(data);
            window.location.href = "/admin/vehicle/list";
          }
          if (data.code == "error") {
            notyf.error(data.message);
          }
        })
        .catch(err => {
          console.error(err);
          notyf.error("Có lỗi xảy ra khi cập nhật!");
        });
    });
}


// 3. ĐÓNG, MỞ FORM CHỈNH SỬA XE & ĐẮP DỮ LIỆU
const vehicleEditModalOverlay = document.getElementById("editVehicleModal");
const btnOpenVehicleEditModals = document.querySelectorAll(".vehicle-list .btn-edit-vehicle");
const btnCloseVehicleEditModal = document.querySelector("#editVehicleModal .modal-close");
const btnCancelVehicleEditModal = document.querySelector("#editVehicleModal .btn-cancel");
// Mở modal khi click "Sửa" 
if (btnOpenVehicleEditModals.length > 0 && vehicleEditModalOverlay) {
  btnOpenVehicleEditModals.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      fetch("/admin/vehicle/edit/get", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json", // Sửa lại JSON viết thường
        },
        body: JSON.stringify({
          id: id,
        })
      })
        .then(res => res.json())
        .then((data) => {
          const vehicleData = data.vehicle;
          const editVehicleForm = document.getElementById("edit-vehicle");
          const buttonEditVehicle = document.querySelector(".vehicle-list .modal-overlay#editVehicleModal .modal-footer .btn-submit");

          // Gắn ID vào nút Submit
          if (buttonEditVehicle) {
            buttonEditVehicle.setAttribute("data-id", vehicleData._id);
          }

          // Đắp dữ liệu vào Form
          if (editVehicleForm) {
            editVehicleForm.elements["vehicleCode"].value = vehicleData.vehicleCode;
            editVehicleForm.elements["license"].value = vehicleData.license; // Đắp biển số vào
            editVehicleForm.elements["VIN"].value = vehicleData.VIN;
            editVehicleForm.elements["type"].value = vehicleData.type; 
            editVehicleForm.elements["model"].value = vehicleData.model;
            editVehicleForm.elements["batteryCapacity"].value = vehicleData.batteryCapacity;
            editVehicleForm.elements["hubID"].value = vehicleData.hubID;
            editVehicleForm.elements["status"].value = vehicleData.status;
          }
        })
      vehicleEditModalOverlay.classList.add("is-open");
    });
  });
}
// Đóng modal khi click nút X
if (btnCloseVehicleEditModal && vehicleEditModalOverlay) {
  btnCloseVehicleEditModal.addEventListener("click", () => {
    vehicleEditModalOverlay.classList.remove("is-open");
  });
}
// Đóng modal khi click nút "Hủy"
if (btnCancelVehicleEditModal && vehicleEditModalOverlay) {
  btnCancelVehicleEditModal.addEventListener("click", () => {
    vehicleEditModalOverlay.classList.remove("is-open");
  });
}
// Đóng modal khi click ra ngoài (vào overlay)
if (vehicleEditModalOverlay) {
  vehicleEditModalOverlay.addEventListener("click", (e) => {
    if (e.target === vehicleEditModalOverlay) {
      vehicleEditModalOverlay.classList.remove("is-open");
    }
  });
}
// Đóng modal khi nhấn ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && vehicleEditModalOverlay?.classList.contains("is-open")) {
    vehicleEditModalOverlay.classList.remove("is-open");
  }
});

// ĐÓNG MỞ FORM THÊM CỔNG SẠC (ADD PORT)
const portAddModalOverlay = document.getElementById("addPortModal");
const btnOpenPortAddModal = document.querySelector(".charging-port-list .btn-add-port");
const btnClosePortAddModal = document.querySelector("#addPortModal .modal-close");
const btnCancelPortAddModal = document.querySelector("#addPortModal .btn-cancel");
// Mở modal khi click "Thêm cổng sạc"
if (btnOpenPortAddModal && portAddModalOverlay) {
  btnOpenPortAddModal.addEventListener("click", () => {
    portAddModalOverlay.classList.add("is-open");
  });
}
// Đóng modal khi click nút X
if (btnClosePortAddModal && portAddModalOverlay) {
  btnClosePortAddModal.addEventListener("click", () => {
    portAddModalOverlay.classList.remove("is-open");
  });
}
// Đóng modal khi click nút "Hủy"
if (btnCancelPortAddModal && portAddModalOverlay) {
  btnCancelPortAddModal.addEventListener("click", () => {
    portAddModalOverlay.classList.remove("is-open");
  });
}
// Đóng modal khi click ra ngoài (vào overlay)
if (portAddModalOverlay) {
  portAddModalOverlay.addEventListener("click", (e) => {
    if (e.target === portAddModalOverlay) {
      portAddModalOverlay.classList.remove("is-open");
    }
  });
}


//  ĐÓNG MỞ FORM SỬA CỔNG SẠC (EDIT PORT)
const portEditModalOverlay = document.getElementById("editPortModal");
const btnOpenPortEditModals = document.querySelectorAll(".charging-port-list .btn-edit-port");
const btnClosePortEditModal = document.querySelector("#editPortModal .modal-close");
const btnCancelPortEditModal = document.querySelector("#editPortModal .btn-cancel");
// Mở modal khi click "Sửa"
if (btnOpenPortEditModals.length > 0 && portEditModalOverlay) {
  btnOpenPortEditModals.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      fetch("/admin/charging/port/edit/get", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/JSON",
        },
        body: JSON.stringify({
          id: id,
        })
      })
        .then(res => res.json())
        .then((data) => {
          const portData = data.port;
          const editPortForm = document.getElementById("edit-port");
          const buttonEdit = document.querySelector(" .charging-port-list .modal-overlay#editPortModal .modal-footer .btn-submit")
          if (buttonEdit) {
            buttonEdit.setAttribute("data-id", portData._id)
          }
          if (editPortForm) {
            // Gọi trực tiếp tên thông qua elements (Cực kỳ ngắn gọn)
            editPortForm.elements["portCode"].value = portData.portCode;
            editPortForm.elements["power"].value = portData.power;
            editPortForm.elements["status"].value = portData.status;
            editPortForm.elements["hubID"].value = portData.hubID;
            editPortForm.elements["type"].value = portData.type;
          }
        })
      portEditModalOverlay.classList.add("is-open");
    });
  });
}
// Đóng modal khi click nút X
if (btnClosePortEditModal && portEditModalOverlay) {
  btnClosePortEditModal.addEventListener("click", () => {
    portEditModalOverlay.classList.remove("is-open");
  });
}
// Đóng modal khi click nút "Hủy"
if (btnCancelPortEditModal && portEditModalOverlay) {
  btnCancelPortEditModal.addEventListener("click", () => {
    portEditModalOverlay.classList.remove("is-open");
  });
}
// Đóng modal khi click ra ngoài (vào overlay)
if (portEditModalOverlay) {
  portEditModalOverlay.addEventListener("click", (e) => {
    if (e.target === portEditModalOverlay) {
      portEditModalOverlay.classList.remove("is-open");
    }
  });
}

// TẠO CỔNG SẠC MỚI
const createPort = document.querySelector(".charging-port-list .modal-overlay#addPortModal .modal-footer .btn-submit");
if (createPort) {
  const validate = new JustValidate('#create-port');
  validate
    .addField('#portCode', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập mã cổng sạc",
      }
    ])
    .addField('#power', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập công suất",
      }
    ])

    .onSuccess((event) => {
      const hubID = event.target.hubID.value;
      const portCode = event.target.portCode.value;
      const type = event.target.type.value;
      const power = event.target.power.value;
      const status = event.target.status.value;
      fetch("/admin/charging/port/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hubID: hubID,
          portCode,
          type,
          power,
          status,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.code == "success") {
            portAddModalOverlay.classList.remove("is-open");
            alertMessage(data);
            window.location.href = "/admin/charging/port/list";
          }
          if (data.code == "error") {
            notyf.error(data.message);
          }
        });
    });
}

// CHỈNH SỬA CỔNG SẠC MỚI
const editPort = document.querySelector(" .charging-port-list .modal-overlay#editPortModal .modal-footer .btn-submit");
if (createPort) {
  const validate = new JustValidate('#edit-port');
  validate
    .addField('#portCode', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập mã cổng sạc",
      }
    ])
    .addField('#power', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập công suất",
      }
    ])

    .onSuccess((event) => {
      const hubID = event.target.hubID.value;
      const portCode = event.target.portCode.value;
      const type = event.target.type.value;
      const power = event.target.power.value;
      const status = event.target.status.value;
      const id = editPort.getAttribute("data-id");
      fetch("/admin/charging/port/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          hubID: hubID,
          portCode,
          type,
          power,
          status,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.code == "success") {
            portAddModalOverlay.classList.remove("is-open");
            alertMessage(data);
            window.location.href = "/admin/charging/port/list";
          }
          if (data.code == "error") {
            notyf.error(data.message);
          }
        });
    });
}






