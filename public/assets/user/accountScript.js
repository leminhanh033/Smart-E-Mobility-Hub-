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

