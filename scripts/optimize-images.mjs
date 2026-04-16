import { readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const EXT = /\.(jpe?g|png|webp)$/i;
const DEFAULT_DIRS = [path.join(root, 'public', 'img', 'stories')];
const argDirs = process.argv.slice(2);
const targetDirs = argDirs.length
	? argDirs.map((dir) => path.resolve(root, dir))
	: DEFAULT_DIRS;

/** Рекурсивно собирает пути к поддерживаемым изображениям. */
async function collectImages(dir) {
	const out = [];
	let entries;
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch {
		return out;
	}

	for (const ent of entries) {
		const full = path.join(dir, ent.name);
		if (ent.isDirectory()) {
			const sub = await collectImages(full);
			out.push(...sub);
		} else if (ent.isFile() && EXT.test(ent.name)) {
			out.push(full);
		}
	}
	return out;
}

function formatKb(bytes) {
	return `${(bytes / 1024).toFixed(1)} KB`;
}

async function optimizeImage(absPath) {
	const original = await stat(absPath);
	const image = sharp(absPath).rotate();
	const { format } = await image.metadata();

	let buf;
	if (format === 'jpeg' || format === 'jpg') {
		buf = await image
			.jpeg({ quality: 80, mozjpeg: true, progressive: true })
			.toBuffer();
	} else if (format === 'png') {
		buf = await image
			.png({ compressionLevel: 9, quality: 80, effort: 7 })
			.toBuffer();
	} else if (format === 'webp') {
		buf = await image.webp({ quality: 80, effort: 5 }).toBuffer();
	} else {
		return { status: 'skip', reason: 'unsupported', before: original.size };
	}

	if (buf.length >= original.size) {
		return { status: 'skip', reason: 'not-smaller', before: original.size };
	}

	await writeFile(absPath, buf);
	return { status: 'ok', before: original.size, after: buf.length };
}

const allFiles = [];
for (const dir of targetDirs) {
	const files = await collectImages(dir);
	allFiles.push(...files);
}

let optimized = 0;
let skipped = 0;
let savedBytes = 0;

if (!allFiles.length) {
	const dirsText = targetDirs
		.map((dir) => path.relative(root, dir))
		.join(', ');
	console.log(`optimize-images: no files in ${dirsText}`);
	process.exit(0);
}

for (const abs of allFiles) {
	const rel = path.relative(root, abs);
	const res = await optimizeImage(abs);
	if (res.status === 'ok') {
		optimized += 1;
		const saved = res.before - res.after;
		savedBytes += saved;
		const percent = ((saved / res.before) * 100).toFixed(1);
		console.log(
			`optimized: ${rel} (${formatKb(res.before)} -> ${formatKb(res.after)}, -${percent}%)`,
		);
	} else {
		skipped += 1;
		console.log(`skipped: ${rel} (${res.reason})`);
	}
}

console.log(
	`optimize-images: optimized files ${optimized}, skipped files ${skipped}, saved KB ${formatKb(savedBytes)}`,
);
