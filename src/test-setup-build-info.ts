import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const buildInfoPath = resolve(fileURLToPath(new URL("./build-info.json", import.meta.url)));

if (!existsSync(buildInfoPath)) {
	mkdirSync(dirname(buildInfoPath), { recursive: true });
	writeFileSync(
		buildInfoPath,
		JSON.stringify(
			{
				commit: "test",
				timestamp: "1970-01-01T00:00:00.000Z",
				version: "test",
			},
			null,
			2,
		),
	);
}
