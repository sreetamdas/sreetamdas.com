import { execSync } from "node:child_process";

const branch = process.env.WORKERS_CI_BRANCH ?? "";

if (branch === "dev") {
  execSync("CLOUDFLARE_ENV=staging wrangler deploy -e staging", { stdio: "inherit" });
} else {
  execSync("wrangler versions upload", { stdio: "inherit" });
}
