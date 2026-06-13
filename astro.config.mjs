import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://deratservis.cz",
  trailingSlash: "always",
  integrations: [tailwind()],
  output: "static"
});
