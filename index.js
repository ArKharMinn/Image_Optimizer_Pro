const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/optimize", upload.single("image"), async (req, res) => {
  try {
    const { quality, width, height, format } = req.body;

    let img = sharp(req.file.buffer);

    if (width || height) {
      img = img.resize({
        width: width ? parseInt(width) : null,
        height: height ? parseInt(height) : null,
        fit: "inside",
      });
    }

    if (format === "webp") img = img.webp({ quality: parseInt(quality) });
    else if (format === "jpeg") img = img.jpeg({ quality: parseInt(quality) });
    else if (format === "png") img = img.png();

    const optimizedBuffer = await img.toBuffer();

    const fileName = `optimized_${Date.now()}.${format || "jpg"}`;
    const filePath = path.join("uploads", fileName);

    fs.writeFileSync(filePath, optimizedBuffer);

    res.json({
      success: true,
      url: `http://localhost:${PORT}/${filePath}`,
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.use("/uploads", express.static("uploads"));

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
