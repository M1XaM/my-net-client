import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-okaidia.css';

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'katex/dist/katex.min.css';
import App from "./Components/App";
import GoogleCallback from "./Pages/loginCallback";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="auth/google" element={<GoogleCallback />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
