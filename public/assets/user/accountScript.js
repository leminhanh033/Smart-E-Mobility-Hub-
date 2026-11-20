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

// Tính năng đăng ký
const register = document.querySelector(".register");
if (register) {
  const validate = new JustValidate('#register-form');
  validate
    .addField('#fullname', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập họ và tên",
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập số điện thoại",
      },
    ])
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập email",
      },
      {
        rule: 'email',
        errorMessage: "Vui lòng nhập đúng định dạng email",
      },
    ])
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập mật khẩu",
      },
      {
        rule: 'minLength',
        value: 8,
        errorMessage: "Mật khẩu phải có ít nhất 8 ký tự",
      },
    ])
    .addField('#confirm-password', [
      {
        rule: 'required',
        errorMessage: "Vui lòng xác nhận lại mật khẩu",
      },
      {
        rule: 'function',
        validator: (value, fields) => {
          const passwordValue = fields['#password'] && fields['#password'].elem.value;
          return value === passwordValue;
        },
        errorMessage: 'Mật khẩu xác nhận không khớp',
      }
    ])
    .addField('#terms', [
      {
        rule: 'required',
        errorMessage: "Vui lòng đọc điều khoản",
      },
    ])
    .onSuccess((event) => {
      const fullname=event.target.fullname.value;
      const phone=event.target.phone.value;
      const email=event.target.email.value;
      const password=event.target.password.value;

      fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname:fullname,
          phone:phone,
          email:email,
          password:password,
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.code == "success") {
            alertMessage(data);
            window.location.href = "/login";
            // notyf.success(data.message);
          }
          if (data.code == "error") {
            notyf.error(data.message);
          }
        })
    })
}

// Tính năng đăng nhập
const login = document.querySelector(".login");
if (login) {
  const validate = new JustValidate('#login-form');
  validate
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập email",
      },
      {
        rule: 'email',
        errorMessage: "Vui lòng nhập đúng định dạng email",
      },
    ])
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập mật khẩu",
      },
      {
        rule: 'minLength',
        value: 8,
        errorMessage: "Mật khẩu phải có ít nhất 8 ký tự",
      },
    ])
    .onSuccess((event) => {
      const email=event.target.email.value;
      const password=event.target.password.value;

      fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email:email,
          password:password,
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.code == "success") {
            alertMessage(data);
            window.location.href = "/";
          }
          if (data.code == "error") {
            notyf.error(data.message);
          }
        })
    })
}

//Gửi otp
const sendOTP=document.querySelector(".btn-send-otp");
if(sendOTP){
  sendOTP.addEventListener("click",()=>{
    const phoneEmail=document.querySelector("#phoneEmail").value;
    if(!phoneEmail){
      notyf.error("Vui lòng nhập email hoặc số điện thoại");
    }
    else{
      fetch("/send-otp",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneEmail: phoneEmail,
        })
      })
      .then(res=>res.json())
      .then(data=>{
        if(data.code=="success"){
          notyf.success(data.message);
        }
        if(data.code=="error"){
          notyf.error(data.message);
        }
      })
    }
  })
}

const resetPassword = document.querySelector("#change-password");
if (resetPassword) {
  const validate = new JustValidate('#change-password');
  
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

      fetch("/change-password", {
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
            window.location.href = "/login";
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