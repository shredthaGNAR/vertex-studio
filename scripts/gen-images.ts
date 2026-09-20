import { writeFileSync, mkdirSync } from "node:fs";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
const baseUrl = (process.env.GOOGLE_GENERATIVE_AI_BASE_URL || process.env.GEMINI_BASE_URL || "").replace(/\/$/, "");

const images: Array<{ name: string; prompt: string }> = [
  {
    name: "founder",
    prompt:
      "Professional editorial studio portrait photograph of a confident tech founder in his early 30s wearing a black turtleneck, arms crossed, dark charcoal background with subtle lime-green rim lighting on one side, cinematic moody lighting, sharp focus, high-end magazine photography style",
  },
  {
    name: "work-dashboard",
    prompt:
      "Photograph of a sleek dark-mode analytics dashboard on a large computer monitor, glowing lime green and white growth charts and revenue graphs on a black UI, dark modern office bokeh in the background, cinematic lighting, photorealistic",
  },
  {
    name: "work-code",
    prompt:
      "Ultra-modern developer workspace at night, dual monitors displaying colorful code, mechanical backlit keyboard, dark room illuminated by screen glow and subtle neon green ambient LED lighting, cinematic depth of field, photorealistic",
  },
  {
    name: "work-team",
    prompt:
      "Creative team collaborating around a table with laptops in a dark modern studio office at night, dramatic cinematic lighting with subtle green accent lights, glass whiteboard with website wireframe sketches in background, photorealistic editorial photography",
  },
  {
    name: "work-phone",
    prompt:
      "Smartphone floating at a dynamic angle displaying a sleek e-commerce app with dark mode UI and lime green accent buttons, dramatic studio lighting on pure black background, soft green glow reflection below, premium product photography, photorealistic",
  },
];

async function generate(name: string, prompt: string): Promise<boolean> {
  const url = `${baseUrl}/models/gemini-2.5-flash-image:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Generate a photorealistic image: ${prompt}` }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });
  if (!res.ok) {
    console.error(`${name}: HTTP ${res.status}`, (await res.text()).slice(0, 300));
    return false;
  }
  const data = (await res.json()) as any;
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p: any) => p.inlineData?.data);
  if (!img) {
    console.error(`${name}: no image data`, JSON.stringify(data).slice(0, 300));
    return false;
  }
  const mime = img.inlineData.mimeType || "image/png";
  const ext = mime.includes("jpeg") ? "jpg" : "png";
  writeFileSync(`src/assets/${name}.${ext}`, Buffer.from(img.inlineData.data, "base64"));
  console.log(`${name}: OK -> src/assets/${name}.${ext}`);
  return true;
}

mkdirSync("src/assets", { recursive: true });
let ok = 0;
for (const { name, prompt } of images) {
  if (await generate(name, prompt)) ok++;
}
console.log(`Done. ${ok}/${images.length} images generated.`);
