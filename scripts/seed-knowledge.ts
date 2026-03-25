/**
 * scripts/seed-knowledge.ts
 * 
 * Upsert tài liệu vào Cloudflare Vectorize (knowledge namespace)
 * 
 * Cách dùng:
 *   npx tsx scripts/seed-knowledge.ts
 * 
 * Env cần có trong .env.local:
 *   CLOUDFLARE_WORKER_URL=https://your-worker.workers.dev
 *   CLOUDFLARE_WORKER_SECRET=your-secret
 */

const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL;
const WORKER_SECRET = process.env.CLOUDFLARE_WORKER_SECRET;

if (!WORKER_URL || !WORKER_SECRET) {
  console.error("❌ Thiếu CLOUDFLARE_WORKER_URL hoặc CLOUDFLARE_WORKER_SECRET trong .env.local");
  process.exit(1);
}

// ─── Định nghĩa tài liệu knowledge base ───
// Mỗi document nên <= 500 từ để embedding hiệu quả
// Nếu tài liệu dài hơn, hãy chunk trước khi upsert
interface KnowledgeDoc {
  id: string;      // unique slug
  content: string; // nội dung văn bản
  source: string;  // tên nguồn (hiển thị trong RAG citation)
}

const KNOWLEDGE_DOCS: KnowledgeDoc[] = [
  // ── Thêm tài liệu của bạn vào đây ──
  {
    id: "faq-shipping",
    source: "FAQ - Vận chuyển",
    content: `Thời gian giao hàng:
- Nội thành: 1-2 ngày làm việc
- Ngoại thành: 3-5 ngày làm việc  
- Miễn phí vận chuyển cho đơn hàng trên 500.000đ
- Đơn hàng được đóng gói cẩn thận, có thể theo dõi qua mã vận đơn`,
  },
  {
    id: "faq-return",
    source: "FAQ - Đổi trả",
    content: `Chính sách đổi trả:
- Đổi trả trong vòng 7 ngày kể từ ngày nhận hàng
- Sản phẩm phải còn nguyên tem, nhãn, chưa qua sử dụng
- Liên hệ hotline 1800-xxxx hoặc email support@example.com để được hỗ trợ
- Hoàn tiền trong 3-5 ngày làm việc sau khi nhận lại hàng`,
  },
  {
    id: "faq-payment",
    source: "FAQ - Thanh toán",
    content: `Phương thức thanh toán được hỗ trợ:
- Thanh toán khi nhận hàng (COD)
- Chuyển khoản ngân hàng
- Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB)
- Ví điện tử: MoMo, ZaloPay, VNPay
- Mua trước trả sau: Kredivo, Momo Pay Later`,
  },
  // Thêm nhiều tài liệu khác...
];

// ─── Chunk văn bản dài thành các đoạn nhỏ hơn ───
function chunkText(text: string, maxWords = 300): string[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const wordCount = (current + " " + para).split(/\s+/).length;
    if (wordCount > maxWords && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text];
}

// ─── Upsert một document ───
async function upsertDoc(doc: KnowledgeDoc): Promise<void> {
  const chunks = chunkText(doc.content);

  for (let i = 0; i < chunks.length; i++) {
    const id = chunks.length === 1 ? doc.id : `${doc.id}-chunk${i}`;
    const res = await fetch(`${WORKER_URL}/embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-worker-secret": WORKER_SECRET!,
      },
      body: JSON.stringify({
        id,
        content: chunks[i],
        source: doc.source,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to upsert ${id}: ${err}`);
    }

    const data = (await res.json()) as { ok: boolean; id: string };
    console.log(`  ✅ ${data.id}`);
  }
}

// ─── Main ───
async function main() {
  console.log(`🚀 Seeding ${KNOWLEDGE_DOCS.length} documents vào Vectorize...\n`);

  let success = 0;
  let failed = 0;

  for (const doc of KNOWLEDGE_DOCS) {
    try {
      console.log(`📄 ${doc.id} (${doc.source})`);
      await upsertDoc(doc);
      success++;
    } catch (err) {
      console.error(`  ❌ Lỗi:`, err);
      failed++;
    }

    // Rate limit: 100ms giữa mỗi request
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n✨ Xong! ${success} thành công, ${failed} thất bại`);
}

main().catch(console.error);