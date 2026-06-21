import { navigate } from "../../router/router.js";
import { post } from "../../service/api.js";

const API_URL = "https://cb-back-prueba-c2e1a4ci8-sebitasdowns-projects.vercel.app/auth";

export function LoginUser() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const forgotForm = document.getElementById("forgot-form");
  const otpForm = document.getElementById("otp-form");
  const newPassForm = document.getElementById("new-password-form");
  const switchText = document.getElementById("switch-text");
  const switchLink = document.getElementById("switch-link");
  const switchQuestion = document.getElementById("switch-question");
  const logoutBtn = document.getElementById("logout-btn");

  const user = JSON.parse(localStorage.getItem("user"));
  if (user) return navigate("/home");

  let currentEmail = "";
  let otpCode = "";

  function hideAll() {
    [loginForm, registerForm, forgotForm, otpForm, newPassForm].forEach(f => f?.classList.add("hidden"));
  }

  function showForm(form) {
    hideAll();
    form?.classList.remove("hidden");
  }

  function showLogin() {
    showForm(loginForm);
    switchText.classList.remove("hidden");
    switchLink.textContent = "Register";
    switchQuestion.textContent = "Don't have an account?";
    switchLink.onclick = (e) => { e.preventDefault(); showRegister(); };
  }

  function showRegister() {
    showForm(registerForm);
    switchText.classList.remove("hidden");
    switchLink.textContent = "Login";
    switchQuestion.textContent = "Already have an account?";
    switchLink.onclick = (e) => { e.preventDefault(); showLogin(); };
  }

  function hideSwitch() {
    switchText.classList.add("hidden");
  }

  function maskEmail(email) {
    const [name, domain] = email.split("@");
    if (name.length <= 2) return `${name[0]}*****@${domain}`;
    return `${name[0]}${name[1]}*****@${domain}`;
  }

  // --- LOGIN ---
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = document.getElementById("login-error");
    err?.classList.add("hidden");
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await post(API_URL, { email, user_password: password });
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/home");
      } else if (res.needsVerification) {
        currentEmail = res.email;
        showOtp(currentEmail, "verify");
      } else if (err) {
        err.textContent = res.message || "Invalid credentials";
        err.classList.remove("hidden");
      }
    } catch {
      if (err) { err.textContent = "Connection error"; err.classList.remove("hidden"); }
    }
  });

  // --- REGISTER ---
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = document.getElementById("register-error");
    err?.classList.add("hidden");
    const full_name = document.getElementById("reg-fullname").value;
    const nickname = document.getElementById("reg-nickname").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    try {
      const res = await post(`${API_URL}/register`, {
        full_name,
        nickname: nickname || full_name.split(" ")[0],
        email,
        user_password: password
      });
      if (res.needsVerification) {
        currentEmail = res.email;
        showOtp(currentEmail, "verify");
      } else if (err) {
        err.textContent = res.message || "Registration failed";
        err.classList.remove("hidden");
      }
    } catch {
      if (err) { err.textContent = "Connection error"; err.classList.remove("hidden"); }
    }
  });

  // --- FORGOT PASSWORD ---
  document.getElementById("forgot-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    showForm(forgotForm);
    hideSwitch();
  });

  document.getElementById("back-to-login-from-forgot")?.addEventListener("click", (e) => {
    e.preventDefault();
    showLogin();
  });

  document.getElementById("forgot-btn")?.addEventListener("click", async () => {
    const err = document.getElementById("forgot-error");
    err?.classList.add("hidden");
    const email = document.getElementById("forgot-email").value;

    try {
      const res = await post(`${API_URL}/forgot-password`, { email });
      currentEmail = email;
      showOtp(currentEmail, "reset");
    } catch {
      if (err) { err.textContent = "Connection error"; err.classList.remove("hidden"); }
    }
  });

  // --- OTP ---
  function showOtp(email, mode) {
    showForm(otpForm);
    hideSwitch();
    document.getElementById("otp-email-display").textContent = maskEmail(email);
    document.getElementById("otp-email-display").dataset.email = email;
    document.getElementById("otp-email-display").dataset.mode = mode || "verify";
    resetOtpInputs();
    startOtpTimer();
  }

  function resetOtpInputs() {
    document.querySelectorAll(".otp-input").forEach((inp, i) => {
      inp.value = "";
      inp.classList.remove("filled");
      if (i === 0) inp.focus();
    });
  }

  let otpTimerInterval = null;

  function startOtpTimer() {
    const timerText = document.getElementById("otp-timer-text");
    let seconds = 45;
    clearInterval(otpTimerInterval);
    timerText.innerHTML = `Resend code in 00:45`;

    otpTimerInterval = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(otpTimerInterval);
        timerText.innerHTML = `<a href="#" id="resend-otp">Resend code</a>`;
        document.getElementById("resend-otp")?.addEventListener("click", (e) => {
          e.preventDefault();
          resendOtp();
        });
      } else {
        const m = String(Math.floor(seconds / 60)).padStart(2, "0");
        const s = String(seconds % 60).padStart(2, "0");
        timerText.textContent = `Resend code in ${m}:${s}`;
      }
    }, 1000);
  }

  async function resendOtp() {
    const email = document.getElementById("otp-email-display").dataset.email;
    await post(`${API_URL}/forgot-password`, { email });
    startOtpTimer();
  }

  // OTP input handling
  document.querySelectorAll(".otp-input").forEach((input, idx) => {
    input.addEventListener("input", (e) => {
      const val = e.target.value.replace(/[^0-9]/g, "");
      e.target.value = val;
      if (val) e.target.classList.add("filled");
      else e.target.classList.remove("filled");
      if (val && idx < 5) {
        document.querySelectorAll(".otp-input")[idx + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && idx > 0) {
        document.querySelectorAll(".otp-input")[idx - 1].focus();
      }
    });

    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData("text").replace(/[^0-9]/g, "");
      const inputs = document.querySelectorAll(".otp-input");
      for (let i = 0; i < Math.min(paste.length, 6); i++) {
        if (idx + i < 6) {
          inputs[idx + i].value = paste[i];
          inputs[idx + i].classList.add("filled");
        }
      }
      const nextIdx = Math.min(idx + paste.length, 5);
      inputs[nextIdx]?.focus();
    });
  });

  document.getElementById("otp-btn")?.addEventListener("click", async () => {
    const err = document.getElementById("otp-error");
    const success = document.getElementById("otp-success");
    err?.classList.add("hidden");
    success?.classList.add("hidden");

    const code = Array.from(document.querySelectorAll(".otp-input")).map(i => i.value).join("");
    if (code.length !== 6) {
      if (err) { err.textContent = "Please enter the 6-digit code"; err.classList.remove("hidden"); }
      return;
    }

    const email = document.getElementById("otp-email-display").dataset.email;
    const mode = document.getElementById("otp-email-display").dataset.mode;

    try {
      if (mode === "reset") {
        // Verify OTP for password reset - using verify-email endpoint
        const res = await post(`${API_URL}/verify-email`, { email, code });
        if (res.verified) {
          showForm(newPassForm);
          hideSwitch();
          document.getElementById("new-password-success")?.classList.add("hidden");
        } else if (err) {
          err.textContent = res.message || "Invalid code";
          err.classList.remove("hidden");
        }
      } else {
        // Verify email
        const res = await post(`${API_URL}/verify-email`, { email, code });
        if (res.verified) {
          if (success) {
            success.textContent = "Email verified! Redirecting to login...";
            success.classList.remove("hidden");
          }
          clearInterval(otpTimerInterval);
          setTimeout(() => showLogin(), 2000);
        } else if (err) {
          err.textContent = res.message || "Invalid code";
          err.classList.remove("hidden");
        }
      }
    } catch {
      if (err) { err.textContent = "Connection error"; err.classList.remove("hidden"); }
    }
  });

  document.getElementById("otp-wrong-email")?.addEventListener("click", (e) => {
    e.preventDefault();
    clearInterval(otpTimerInterval);
    showLogin();
  });

  // --- NEW PASSWORD ---
  document.getElementById("new-password-btn")?.addEventListener("click", async () => {
    const err = document.getElementById("new-password-error");
    const success = document.getElementById("new-password-success");
    err?.classList.add("hidden");
    success?.classList.add("hidden");

    const password = document.getElementById("new-password").value;
    const confirm = document.getElementById("new-password-confirm").value;

    if (password !== confirm) {
      if (err) { err.textContent = "Passwords do not match"; err.classList.remove("hidden"); }
      return;
    }
    if (password.length < 6) {
      if (err) { err.textContent = "Password must be at least 6 characters"; err.classList.remove("hidden"); }
      return;
    }

    const email = document.getElementById("otp-email-display").dataset.email;

    try {
      const res = await post(`${API_URL}/reset-password`, { new_password: password, email });
      // Note: we use a simple approach - the verify-email already confirmed identity
      if (success) {
        success.textContent = "Password updated! Redirecting to login...";
        success.classList.remove("hidden");
      }
      setTimeout(() => showLogin(), 2000);
    } catch {
      if (err) { err.textContent = "Connection error"; err.classList.remove("hidden"); }
    }
  });

  document.getElementById("back-to-login-from-newpass")?.addEventListener("click", (e) => {
    e.preventDefault();
    showLogin();
  });

  // --- LOGOUT ---
  logoutBtn?.addEventListener("click", () => handleLogout());

  // Init
  showLogin();
}

// --- GLOBAL LOGOUT (funciona desde cualquier página) ---
window.handleLogout = function () {
  localStorage.removeItem("user");
  import("../../router/router.js").then(mod => mod.navigate("/login"));
};
