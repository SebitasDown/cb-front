import { navigate } from "../../router/router.js";
import { post } from "../../service/api.js";

const API_URL = "https://cb-back-prueba.vercel.app/auth";

export function LoginUser() {
  const form = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");

  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    console.log(`Active session: ${user.email}`);
    navigate("/home");
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await post(API_URL, { email, user_password: password });
        if (res.user) {
          localStorage.setItem("user", JSON.stringify(res.user));
          console.log(`Login successful. Welcome, ${res.user.email}`);
          navigate("/home"); 
        } else {
          console.log(`Login failed: ${res.message || "Invalid credentials"}`);
        }
      } catch (error) {
        console.error("Error during login:", error);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      console.log("Session closed.");
      navigate("/login");
    });
  }
}
