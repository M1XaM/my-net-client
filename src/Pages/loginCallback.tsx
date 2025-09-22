import { useEffect, useState } from "react";

export default function GoogleCallback() {
  const [message, setMessage] = useState("");

  const [userName, setUserName] = useState("");
  const [picUrl, setPicUrl] = useState("");
  const [fileNames, setFileNames] = useState([]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");
    const state = queryParams.get("state");
    console.log(state)
    console.log(code)
    if (code && state) {
      fetch("http://localhost:8000/auth/google/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, state }),
      })
        .then(res => {
          if (!res.ok) throw new Error("Ошибка сервера");
          return res.json();
        })
        .then(data => {
          console.log(data)
          setPicUrl(data.user.picture);
          setFileNames(data.files);

          setUserName(data.user.name);
        })
        .catch(err => setMessage(err.message));
    } else {
      setMessage("⚠️ Нет параметра code");
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {!userName && !message && <h1>Обработка авторизации...</h1>}
      {message && <div style={{ color: "red" }}>{message}</div>}
      {userName && (
        <div>
          <h2>Добро пожаловать, <strong>{userName}</strong>!</h2>
        </div>
      )}
      {picUrl && (
        <div>
          <img
            src={picUrl}
            alt="avatar"
            style={{ width: "120px", borderRadius: "50%", marginTop: "20px" }}
          />
        </div>
      )}
      {fileNames.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Ваши файлы в Google Drive:</h3>
          <ul>
            {fileNames.map(file => (
              <li key={file}>{file}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
