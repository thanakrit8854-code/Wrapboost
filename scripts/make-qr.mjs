import QRCode from 'qrcode';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.env.SITE_URL ?? 'https://wrapboost.vercel.app';
const STORE = 'cei-domestic';

const POINTS = [
  { file: 'qr-checkin', channel: 'QR_CHECKIN', label: 'จุดเช็คอิน' },
  { file: 'qr-gate', channel: 'QR_GATE', label: 'หน้าประตูขึ้นเครื่อง' },
  { file: 'qr-counter', channel: 'QR_COUNTER', label: 'หน้าเคาน์เตอร์' },
];

async function main() {
  await mkdir('public/qr', { recursive: true });

  for (const point of POINTS) {
    const url = `${BASE}/s/${STORE}?c=${point.channel}`;

    await QRCode.toFile(`public/qr/${point.file}.png`, url, {
      width: 1200,
      margin: 2,
      color: { dark: '#2d6127', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    });

    const svg = await QRCode.toString(url, {
      type: 'svg',
      margin: 2,
      color: { dark: '#2d6127', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    });
    await writeFile(`public/qr/${point.file}.svg`, svg);

    console.log(`${point.label}  ->  ${url}`);
  }

  console.log('\nไฟล์อยู่ใน public/qr/ — ใช้ .svg สำหรับพิมพ์ .png สำหรับสไลด์');
}

main();
