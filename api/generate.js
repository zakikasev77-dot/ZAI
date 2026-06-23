// api/generate.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { backgroundUrl, productUrl } = req.body;

    try {
        // 1. Setup API Gemini untuk generate PROMPT TEKS VIDEO
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Membuat prompt instruksi video
        const textPrompt = `
            Saya memiliki gambar produk yang berada di latar belakang baru, dipegang oleh satu atau dua tangan.
            Buatkan saya prompt perintah video untuk AI Video Generator (seperti Sora atau Runway) dalam Bahasa Indonesia.
            Kriteria video:
            - Durasi: 15 detik
            - Jenis: Video review produk untuk TikTok (Rasio 9:16 potret).
            - Wajib masukkan instruksi gerakan berikut: goyangkan produk, putar produk 360 derajat, visual kamera zoom in perlahan, kamera zoom out, dan geser (panning) memperlihatkan detail produk.
            Buat prompt-nya padat, jelas, dan sinematik.
        `;

        const textResult = await model.generateContent(textPrompt);
        const videoPromptResult = textResult.response.text();

        // 2. GENERATE GAMBAR (Logika Integrasi)
        // PERHATIAN: Google Gemini (generative-ai) standar mengembalikan TEKS. 
        // Untuk menghasilkan GAMBAR, Anda harus menembak endpoint Imagen di Google Cloud Vertex AI, 
        // atau layanan pihak ketiga. Berikut adalah simulasi bentuk prompt yang dikirim ke AI Gambar:
        
        const imageGenerationPrompt = `A product from this image URL: ${productUrl}, being held by one or two realistic hands. The background must be exactly matching the environment of this image URL: ${backgroundUrl}. Portrait orientation 9:16 aspect ratio, highly detailed, photorealistic.`;

        /* Contoh pemanggilan API AI Pembuat Gambar (Misal: menggunakan Vertex AI Imagen / DALL-E)
        const imageResponse = await fetch('URL_API_IMAGE_GENERATOR', {
             method: 'POST',
             body: JSON.stringify({ prompt: imageGenerationPrompt, aspect_ratio: "9:16" })
        });
        const generatedImageUrl = imageResponse.data.url;
        */

        // Placeholder: Karena skrip tidak mengeksekusi model image generator sungguhan di sini,
        // kita kembalikan URL sementara sebagai contoh berhasilnya jalur data.
        const mockGeneratedImageUrl = "https://via.placeholder.com/540x960.png?text=Hasil+Generate+AI+9:16";

        // 3. Kembalikan Response ke Frontend
        res.status(200).json({
            imageUrl: mockGeneratedImageUrl, // Ganti dengan URL hasil Image Generator
            videoPrompt: videoPromptResult
        });

    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ error: 'Gagal memproses AI' });
    }
}
