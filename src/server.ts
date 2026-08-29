import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Directory to store output video files
const OUT_DIR = path.join("/tmp", "renders");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Serve rendered videos statically
app.use("/videos", express.static(OUT_DIR));

let bundlePromise: Promise<string> | null = null;

function getBundleLocation() {
  if (!bundlePromise) {
    bundlePromise = bundle({
      entryPoint: path.resolve(__dirname, "./remotion/index.ts"),
    });
  }
  return bundlePromise;
}

// Pre-bundle template on startup
getBundleLocation()
  .then(() => console.log("✅ Remotion template pre-bundled successfully."))
  .catch((err) => console.error("❌ Bundling error:", err));

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.post("/render", async (req, res) => {
  try {
    const { inputProps } = req.body;
    if (!inputProps) {
      return res.status(400).json({ error: "Missing inputProps in request body" });
    }

    const bundleLocation = await getBundleLocation();
    console.log("🎬 Initiating video render on headless Chromium...");

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "MainVideo",
      inputProps,
      chromiumOptions: {
        executablePath: process.env.CHROMIUM_PATH || undefined,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      },
    });

    const videoFileName = `video-${Date.now()}.mp4`;
    const outputPath = path.join(OUT_DIR, videoFileName);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      chromiumOptions: {
        executablePath: process.env.CHROMIUM_PATH || undefined,
        enableMultiProcessOnLinux: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      },
    });

    console.log(`✅ Render completed: ${videoFileName}`);

    // Compute public accessible URL
    const host = req.get("x-forwarded-host") || req.get("host");
    const protocol = req.get("x-forwarded-proto") || req.protocol;
    const publicUrl = `${protocol}://${host}/videos/${videoFileName}`;

    return res.json({
      success: true,
      videoUrl: publicUrl,
    });
  } catch (error: any) {
    console.error("❌ Render failed:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Remotion Render Worker running on port ${PORT}`);
});