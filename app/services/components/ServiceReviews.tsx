type Review = {
  id: string;
  rating: number;
  comment: string | null;
  user: {
    full_name?: string | null;
    username?: string | null;
  } | null;
};

type Props = {
  reviews: Review[];
};

export default function ServiceReviews({ reviews }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Đánh giá từ khách</h3>
        <button className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10">
          Xem thêm
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {reviews.length > 0 ? (
          reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-white/10 bg-black/20 p-3"
            >
              <div className="text-sm text-gray-300">
                {r.user?.full_name || r.user?.username || "Khách"} •{" "}
                <span className="font-semibold">{r.rating}/5</span>
              </div>
              <p className="mt-1 text-gray-200">
                {r.comment || "Không có bình luận."}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-sm text-gray-300">
              Chưa có đánh giá • <span className="font-semibold">0/5</span>
            </div>
            <p className="mt-1 text-gray-200">Chưa có bình luận.</p>
          </div>
        )}
      </div>
    </div>
  );
}
