import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works on GitHub Pages or any static host subpath.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
