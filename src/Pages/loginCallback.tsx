import { useEffect } from "react";

export default function GoogleCallback() {
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");
    const state = queryParams.get("state");

    if (code && state) {
      fetch("https://localhost/api/auth/google/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, state }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Server error");
          return res.json();
        })
        .then((data) => {
          localStorage.setItem("user", JSON.stringify(data.user));

          window.location.href = "/";
        })
        .catch((err) => {
          console.error("Google login failed:", err);
          alert("Google login failed: " + err.message);
        });
    }
  }, []);

  return <h1>Processing Google authentication...</h1>;
}

