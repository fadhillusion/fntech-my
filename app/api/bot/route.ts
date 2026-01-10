import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// Function helper untuk balas mesej ke Telegram (Anti-Crash)
async function sendMessage(token: string, chatId: number | string, text: string, replyToMsgId?: number) {
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: text, 
        reply_to_message_id: replyToMsgId 
      }),
    });
  } catch (err) {
    console.error("⚠️ Gagal hantar mesej Telegram:", err);
  }
}

export async function POST(req: Request) {
  // CONFIG: Ubah ini untuk matikan loop jika perlu
  const AUTO_STOP_TELEGRAM_RETRY = true; 

  try {
    // 1. Dapatkan Environment Variables
    const geminiKey = process.env.GEMINI_API_KEY;
    const sbUrl = process.env.SUPABASE_URL;
    const sbKey = process.env.SUPABASE_KEY;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!sbUrl || !sbKey || !geminiKey || !botToken) {
      console.error("❌ ENV VARS MISSING");
      return NextResponse.json({ ok: true }); // Return OK to stop Telegram retry
    }

    // 2. Baca Data dari Telegram
    const body = await req.json();
    
    // LOG PENTING: Kita print semua supaya nampak struktur JSON sebenar
    console.log("📦 DEBUG RAW JSON:", JSON.stringify(body, null, 2));

    // 3. Normalization: Cari mesej kat mana-mana pun dia sorok
    // Telegram boleh hantar: message, edited_message, atau channel_post
    const msg = body.message || body.edited_message || body.channel_post;

    if (!msg) {
      console.log("Isyarat bukan mesej (Mungkin 'my_chat_member' atau status update). Skip.");
      return NextResponse.json({ ok: true });
    }

    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    // 4. Filter: Kita nak GAMBAR sahaja
    if (!msg.photo) {
      console.log("❌ Mesej teks biasa dikesan. Bot hanya terima gambar.");
      // Optional: Boleh reply bagitahu user "Sila hantar gambar sahaja"
      return NextResponse.json({ ok: true });
    }

    // --- MULA PROSES (Hanya jika ada gambar) ---
    
    console.log("📸 Gambar dikesan! Memulakan AI...");
    await sendMessage(botToken, chatId, "🤖 Bot sedang membaca gambar & menulis artikel... (Tunggu ~10 saat)", messageId);

    // 5. Setup Clients
    const genAI = new GoogleGenerativeAI(geminiKey);
    const supabase = createClient(sbUrl, sbKey);

    // 6. Dapatkan File Path dari Telegram
    const photos = msg.photo;
    const fileId = photos[photos.length - 1].file_id; // Ambil saiz paling besar

    const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    const fileData = await fileRes.json();
    
    if (!fileData.ok) throw new Error("Gagal dapatkan info fail dari Telegram");

    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;

    // 7. Download & Convert Image
    const imageRes = await fetch(fileUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // 8. Generate Article guna Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const caption = msg.caption || "Analisis gambar ini untuk blog teknologi";

    const prompt = `
      Anda adalah penulis konten senior untuk blog 'FNDigital'.
      Tulis artikel blog dalam Bahasa Melayu berdasarkan gambar ini.e
      
      Konteks/Caption user: "${caption}"

      Sila berikan output dalam format JSON RAW sahaja (JANGAN letak markdown \`\`\`json):
      {
        "title": "Tajuk Artikel Yang Clickbait & SEO Friendly",
        "slug": "tajuk-artikel-seo-friendly",
        "content": "<p>Tulis perenggan pendahuluan yang menarik...</p><h2>Subtajuk Utama</h2><p>Isi kandungan...</p>"
      }
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
    ]);

    const responseText = result.response.text();
    // Bersihkan markdown jika Gemini degil letak ```json
    const cleanedText = responseText.replace(/```json|```/g, "").trim();
    
    let articleData;
    try {
        articleData = JSON.parse(cleanedText);
    } catch (e) {
        console.error("JSON Parse Error:", responseText);
        await sendMessage(botToken, chatId, "❌ AI bagi format salah. Sila cuba gambar lain.", messageId);
        return NextResponse.json({ ok: true });
    }

    // 9. Simpan ke Supabase
    const { data, error } = await supabase
      .from("posts")
      .insert([{
          title: articleData.title,
          slug: articleData.slug + "-" + Date.now(), // Unique slug
          content: articleData.content,
          is_published: false,
      }])
      .select();

    if (error) {
      console.error("🔥 Supabase Error:", error);
      await sendMessage(botToken, chatId, `❌ Gagal simpan database: ${error.message}`, messageId);
    } else {
      console.log("✅ SUCCESS! Saved ID:", data?.[0]?.id);
      await sendMessage(botToken, chatId, `✅ Siap Boss!\n\n📝 Tajuk: ${articleData.title}\n\nDisimpan dalam Drafts.`, messageId);
    }

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error("🔥 UNHANDLED ERROR:", error);
    
    // PENTING: Return 200 OK walaupun error supaya Telegram TAK retry (elak spam)
    if (AUTO_STOP_TELEGRAM_RETRY) {
        return NextResponse.json({ ok: true, error: error.message });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}