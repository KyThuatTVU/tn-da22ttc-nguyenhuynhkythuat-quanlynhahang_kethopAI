const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const SIGNATURES = [
    {
        ext: '.jpg',
        mimetype: 'image/jpeg',
        matches: (b) => b.length >= 3 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF
    },
    {
        ext: '.png',
        mimetype: 'image/png',
        matches: (b) => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))
    },
    {
        ext: '.gif',
        mimetype: 'image/gif',
        matches: (b) => b.length >= 6 && ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString('ascii'))
    },
    {
        ext: '.webp',
        mimetype: 'image/webp',
        matches: (b) => b.length >= 12 && b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP'
    }
];

function detectImageType(buffer) {
    return SIGNATURES.find((signature) => signature.matches(buffer)) || null;
}

function readHeader(filePath) {
    return new Promise((resolve, reject) => {
        fs.open(filePath, 'r', (openError, fd) => {
            if (openError) return reject(openError);

            const buffer = Buffer.alloc(16);
            fs.read(fd, buffer, 0, buffer.length, 0, (readError, bytesRead) => {
                fs.close(fd, () => {});
                if (readError) return reject(readError);
                resolve(buffer.subarray(0, bytesRead));
            });
        });
    });
}

/**
 * Kiểm tra nội dung file thực sự là ảnh, đổi tên ngẫu nhiên và đuôi theo
 * định dạng phát hiện được để tránh upload file HTML/SVG gây stored XSS.
 */
async function verifyAndRenameImage(file, prefix = 'img') {
    if (!file || !file.path) {
        return null;
    }

    const header = await readHeader(file.path);
    const detected = detectImageType(header);

    if (!detected) {
        await fsp.unlink(file.path).catch(() => {});
        return null;
    }

    const newFilename = `${prefix}-${crypto.randomUUID()}${detected.ext}`;
    const newPath = path.join(path.dirname(file.path), newFilename);

    await fsp.rename(file.path, newPath);

    file.filename = newFilename;
    file.path = newPath;
    file.mimetype = detected.mimetype;

    return file;
}

module.exports = {
    detectImageType,
    verifyAndRenameImage
};
