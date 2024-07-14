import { readdir } from "node:fs/promises";
import { extname } from "node:path";

export async function getMDXFiles(dir: string) {
	return (await readdir(dir)).filter((file) => extname(file) === ".mdx");
}
