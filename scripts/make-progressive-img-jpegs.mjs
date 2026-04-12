import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** Каталоги с JPEG: слайды сторис и корень `img` (ава и др.). */
const REL_DIRS = [['public', 'img', 'stories']];

async function processDir(relParts) {
	const dir = path.join(root, ...relParts);
	let entries;
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch {
		return;
	}

	for (const ent of entries) {
		if (!ent.isFile() || !/\.jpe?g$/i.test(ent.name)) {
			continue;
		}
		const input = path.join(dir, ent.name);
		const rel = path.relative(root, input);
		const buf = await sharp(input)
			.jpeg({ progressive: true, quality: 88, mozjpeg: true })
			.toBuffer();
		await writeFile(input, buf);
		console.log('progressive:', rel);
	}
}

for (const parts of REL_DIRS) {
	await processDir(parts);
}
