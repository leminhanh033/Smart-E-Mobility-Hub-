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

//đăng nhập
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");

  if (!loginForm) return;

  const validator = new JustValidate('#login-form', {
    errorFieldCssClass: 'is-invalid',
    errorLabelCssClass: 'is-invalid-label',
  });

  validator
    .addField('#loginIdentifier', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập Số điện thoại hoặc Email',
      },
      {
        validator: (value) => {
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          const isPhone = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(value);

          return isEmail || isPhone;
        },
        errorMessage: 'Sai định dạng Email hoặc Số điện thoại',
      }
    ])
    .addField('#loginPassword', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu',
      },
      {
        rule: 'minLength',
        value: 6,
        errorMessage: 'Mật khẩu phải có ít nhất 6 ký tự',
      }
    ])
    .onSuccess((event) => {
      const phoneEmail = document.querySelector("#loginIdentifier").value
      const password = document.querySelector("#loginPassword").value;
      fetch("/admin/account/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneEmail,
          password: password,
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.code == "success") {
            alertMessage(data);
            window.location.href = "/admin";
          }
          if (data.code == "error") {
            notyf.error(data.message);
          }
        })
    });

  // ==========================================
  // 3. HIỆU ỨNG ẨN/HIỆN MẬT KHẨU (Icon con mắt)
  // ==========================================
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("loginPassword");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      // Kiểm tra type hiện tại
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      // Đổi icon
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }
});


//Gửi otp
const sendOTP = document.querySelector(".btn-send-otp");
if (sendOTP) {
  sendOTP.addEventListener("click", () => {
    const phoneEmail = document.querySelector("#phoneEmail").value;
    if (!phoneEmail) {
      notyf.error("Vui lòng nhập email hoặc số điện thoại");
    }
    else {
      fetch("/admin/account/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneEmail: phoneEmail,
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.code == "success") {
            notyf.success(data.message);
          }
          if (data.code == "error") {
            notyf.error(data.message);
          }
        })
    }
  })
}

//quên mật khẩu
const resetPassword = document.querySelector("#change-password-admin");
if (resetPassword) {
  const validate = new JustValidate('#change-password-admin');

  validate
    .addField('#phoneEmail', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập số điện thoại hoặc email",
      },
      {
        validator: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/; // Hoặc dùng /^[0-9]{10,11}$/ cho linh hoạt
          return emailRegex.test(value) || phoneRegex.test(value);
        },
        errorMessage: "Vui lòng nhập đúng định dạng số điện thoại hoặc email",
      },
    ])
    .addField('#otp', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập mã xác thực OTP",
      }
    ])
    .addField('#new-password', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập mật khẩu mới",
      }
    ])
    .addField('#check-password', [
      {
        rule: 'required',
        errorMessage: "Vui lòng xác nhận lại mật khẩu mới",
      },
      {
        validator: (value) => {
          const passwordValue = document.querySelector('#new-password').value;
          return value === passwordValue;
        },
        errorMessage: "Mật khẩu xác nhận không khớp",
      },
    ])
    .onSuccess((event) => {
      const phoneEmail = event.target.phoneEmail.value;
      const otp = event.target.otp.value;
      const newPassword = event.target['new-password'].value;

      fetch("/admin/account/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneEmail: phoneEmail,
          otp: otp,
          newPassword: newPassword,
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.code == "success") {
            alertMessage(data);
            window.location.href = "/admin/account/login";
          }
          if (data.code == "error") {
            notyf.error(data.message);
          }
        })
        .catch(err => {
          console.error("Lỗi kết nối:", err);
        });
    });
}