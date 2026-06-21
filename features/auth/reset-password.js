import { navigate } from "../../router/router.js";
import { post } from "../../service/api.js";

const API_URL = "http://localhost:3001/auth";

export function initResetPassword() {
  const form = document.getElementById("reset-form");
  const resetError = document.getElementById("reset-error");
  const resetSuccess = document.getElementById("reset-success");

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    if (resetError) {
      resetError.textContent = "Invalid reset link. Please request a new one.";
      resetError.classList.remove("hidden");
    }
    return;
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    resetError?.classList.add("hidden");
    resetSuccess?.classList.add("hidden");

    const password = document.getElementById("reset-password").value;
    const confirm = document.getElementById("reset-confirm").value;

    if (password !== confirm) {
      if (resetError) {
        resetError.textContent = "Passwords do not match";
        resetError.classList.remove("hidden");
      }
      return;
    }

    if (password.length < 6) {
      if (resetError) {
        resetError.textContent = "Password must be at least 6 characters";
        resetError.classList.remove("hidden");
      }
      return;
    }

    try {
      const res = await post(`${API_URL}/reset-password`, { token, new_password: password });
      if (resetSuccess) {
        resetSuccess.textContent = "Password reset successfully! Redirecting to login...";
        resetSuccess.classList.remove("hidden");
      }
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      if (resetError) {
        resetError.textContent = "Connection error. Please try again.";
        resetError.classList.remove("hidden");
      }
    }
  });

  document.getElementById("back-to-login-from-reset")?.addEventListener("click", () => navigate("/login"));
}
