# --- index.html ---
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Framing Study</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./src/main.jsx"></script>
  </body>
</html>

# --- package.json ---
{
  "name": "framing-study",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.7.2"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}

# --- vite.config.js ---
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
});

# --- src/main.jsx ---
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

# --- src/App.jsx ---
// COPY YOUR FULL REACT APP CODE FROM THE CANVAS HERE
// (The existing component FramingStudyApp must be exported as default)


# --- folder structure (do NOT create these as files) ---
/
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx
   └─ App.jsx
