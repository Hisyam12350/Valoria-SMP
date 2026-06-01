const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ICONS = {
  gopay:     "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/320px-Gopay_logo.svg.png",
  qris:      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/320px-Logo_QRIS.svg.png",
  shopeepay: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/ShopeePay_Logo.svg/320px-ShopeePay_Logo.svg.png",
  dana:      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/320px-Logo_dana_blue.svg.png",
  ovo:       "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/320px-Logo_ovo_purple.svg.png",
  bca:       "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/320px-Bank_Central_Asia.svg.png",
  bni:       "https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/320px-BNI_logo.svg.png",
  bri:       "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/BANK_BRI_logo.svg/320px-BANK_BRI_logo.svg.png",
  mandiri:   "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/320px-Bank_Mandiri_logo_2016.svg.png",
  permata:   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Logo_PermataBank.svg/320px-Logo_PermataBank.svg.png",
  cimb:      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/CIMB_Niaga.svg/320px-CIMB_Niaga.svg.png",
  indomaret: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Indomaret_logo.svg/320px-Indomaret_logo.svg.png",
  alfamart:  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Alfamart_logo.svg/320px-Alfamart_logo.svg.png",
  akulaku:   "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Akulaku.svg/320px-Akulaku.svg.png",
  kredivo:   "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Kredivo_Logo.svg/320px-Kredivo_Logo.svg.png",
};

const outDir = path.join("public", "icons", "payment");
fs.mkdirSync(outDir, { recursive: true });

let success = 0, fail = 0, done = 0;
const entries = Object.entries(ICONS);
console.log("Downloading payment icons...\n");

function checkDone() {
  done++;
  if (done === entries.length) {
    console.log(`\nSelesai! ${success} berhasil, ${fail} gagal`);
  }
}

function download(name, url) {
  const dest = path.join(outDir, `${name}.png`);
  const file = fs.createWriteStream(dest);
  const client = url.startsWith("https") ? https : http;
  client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      file.close();
      download(name, res.headers.location);
      return;
    }
    if (res.statusCode !== 200) {
      file.close(); if (fs.existsSync(dest)) fs.unlinkSync(dest);
      console.log(`  GAGAL: ${name} (${res.statusCode})`);
      fail++; checkDone(); return;
    }
    res.pipe(file);
    file.on("finish", () => { file.close(); console.log(`  OK: ${name}`); success++; checkDone(); });
  }).on("error", (err) => {
    file.close(); if (fs.existsSync(dest)) fs.unlinkSync(dest);
    console.log(`  GAGAL: ${name} (${err.message})`);
    fail++; checkDone();
  });
}

for (const [name, url] of entries) download(name, url);
