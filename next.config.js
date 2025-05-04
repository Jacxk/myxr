/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */

// ONLY FOR TEST
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      new URL("https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/**"),
      new URL("https://cdn.discordapp.com/emojis/**"),
    ],
  },
};

export default config;
