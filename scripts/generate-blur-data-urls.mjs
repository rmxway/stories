import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const OUT = path.join(root, 'src', 'generated', 'blur-map.json');

const EXT = /\.(jpe?g|png|webp)$/i;

/** Рекурсивно обходит каталог, возвращает пути к файлам изображений. */
async function collectImages(relDirParts) {
	const dir = path.join(root, ...relDirParts);
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
			const sub = await collectImages([...relDirParts, ent.name]);
			out.push(...sub);
		} else if (ent.isFile() && EXT.test(ent.name)) {
			out.push(full);
		}
	}
	return out;
}

async function tinyDataUrl(absPath) {
	const buf = await sharp(absPath)
		.rotate()
		.resize(24, 24, { fit: 'cover' })
		.jpeg({ quality: 38, mozjpeg: true })
		.toBuffer();
	return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

const files = await collectImages(['public', 'img']);
const map = Object.create(null);
const publicRoot = path.join(root, 'public');
for (const abs of files) {
	const relFromPublic = path.relative(publicRoot, abs);
	const publicPath = '/' + relFromPublic.split(path.sep).join('/');
	map[publicPath] = await tinyDataUrl(abs);
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(map, null, '\t') + '\n', 'utf8');
console.log(
	`blur-map: ${Object.keys(map).length} images → ${path.relative(root, OUT)}`,
);
