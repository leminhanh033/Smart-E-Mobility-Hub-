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
      event.preventDefault(); 
        window.location.href="/admin";
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