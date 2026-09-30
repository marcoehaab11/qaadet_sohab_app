import fs from 'node:fs';
import { Buffer } from 'node:buffer';
fs.mkdirSync('assets/sounds', { recursive: true });
for (const [name, hz, duration] of [
  ['tick', 660, 0.06],
  ['end', 880, 0.35],
]) {
  const rate = 22050,
    count = Math.floor(rate * duration);
  const buffer = Buffer.alloc(44 + count * 2);
  buffer.write('RIFF');
  buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++)
    buffer.writeInt16LE(
      Math.round(Math.sin((2 * Math.PI * hz * i) / rate) * 5000 * Math.sin((Math.PI * i) / count)),
      44 + i * 2,
    );
  fs.writeFileSync(`assets/sounds/${name}.wav`, buffer);
}
