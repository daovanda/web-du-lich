import { useMemo } from "react";

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
  serviceType?: string | null;
  serviceId?: string;
};

const MOCK_REVIEWS = {
  stay: [
    { rating: 5, comment: "Phòng sạch sẽ, view đẹp. Chủ nhà rất thân thiện và nhiệt tình!", username: "Minh Anh" },
    { rating: 5, comment: "Vị trí thuận tiện, gần trung tâm. Giá cả hợp lý, sẽ quay lại lần sau.", username: "Tuấn Khải" },
    { rating: 4, comment: "Không gian thoáng mát, yên tĩnh. Phù hợp cho gia đình nghỉ dưỡng.", username: "Thu Hà" },
    { rating: 5, comment: "Homestay rất đẹp, decor xinh xắn. Chủ nhà chu đáo, nhiệt tình.", username: "Hoàng Long" },
    { rating: 4, comment: "Giá tốt, phòng ốc sạch sẽ. View nhìn ra núi rất đẹp.", username: "Lan Phương" },
    { rating: 5, comment: "Trải nghiệm tuyệt vời! Mọi thứ đều hoàn hảo, sẽ giới thiệu bạn bè.", username: "Đức Anh" },
    { rating: 4, comment: "Phòng rộng rãi, tiện nghi đầy đủ. Khu vực yên tĩnh, thích hợp nghỉ ngơi.", username: "Mai Linh" },
    { rating: 5, comment: "Chủ nhà rất dễ thương, nhiệt tình hướng dẫn. Chỗ ở sạch đẹp.", username: "Văn Hùng" },
    { rating: 5, comment: "Không gian đẹp, chill, giá hợp lý. Highly recommended!", username: "Bích Ngọc" },
    { rating: 4, comment: "Phòng đẹp, view đỉnh. Chủ cho mượn xe miễn phí nữa. Tuyệt vời!", username: "Quang Minh" },
  ],
  car: [
    { rating: 5, comment: "Xe mới, chạy êm. Chủ xe nhiệt tình, giao xe đúng giờ.", username: "Anh Tuấn" },
    { rating: 5, comment: "Xe đẹp, máy lạnh mát. Thủ tục thuê xe nhanh gọn, tiện lợi.", username: "Hồng Nhung" },
    { rating: 4, comment: "Xe khá tốt, giá cả hợp lý. Chủ xe dễ tính, nhiệt tình.", username: "Minh Quân" },
    { rating: 5, comment: "Xe chạy tốt, nhiên liệu tiết kiệm. Chủ xe tư vấn tận tình.", username: "Thảo Vy" },
    { rating: 5, comment: "Thuê xe rất dễ dàng, xe sạch sẽ. Chủ cho thuê lâu dài giá tốt.", username: "Hải Đăng" },
    { rating: 4, comment: "Xe ổn, phù hợp đi du lịch gia đình. Sẽ thuê lại lần sau.", username: "Phương Anh" },
    { rating: 5, comment: "Xe 7 chỗ rộng rãi, phù hợp đi xa. Chủ xe nhiệt tình hướng dẫn.", username: "Đình Nam" },
    { rating: 5, comment: "Giá tốt, xe đẹp, chủ dễ thương. Trải nghiệm tuyệt vời!", username: "Khánh Linh" },
    { rating: 4, comment: "Xe mới, máy móc hoạt động tốt. Giao xe nhanh chóng.", username: "Trung Kiên" },
    { rating: 5, comment: "Thuê xe lần đầu rất hài lòng. Xe đẹp, chủ tận tâm.", username: "Như Quỳnh" },
  ],
  motorbike: [
    { rating: 5, comment: "Xe máy mới, chạy êm ru. Thuê xe dễ dàng, giá rẻ.", username: "Bảo Long" },
    { rating: 4, comment: "Xe ổn, phù hợp di chuyển trong thành phố. Chủ thân thiện.", username: "Thanh Hương" },
    { rating: 5, comment: "Xe SH rất đẹp, chạy tốt. Giá thuê hợp lý, sẽ quay lại.", username: "Công Phượng" },
    { rating: 5, comment: "Xe máy mới tinh, chủ giao xe tận nơi. Rất tiện lợi!", username: "Mỹ Duyên" },
    { rating: 4, comment: "Xe khá mới, máy móc tốt. Thủ tục đơn giản, nhanh gọn.", username: "Tấn Đạt" },
    { rating: 5, comment: "Thuê xe rất dễ, giá sinh viên. Xe chạy ngon lành.", username: "Hạnh Nguyên" },
    { rating: 5, comment: "Xe đẹp, phanh tốt, đèn sáng. An toàn khi đi đường xa.", username: "Quốc Huy" },
    { rating: 4, comment: "Xe máy tốt, giá cả phải chăng. Chủ nhiệt tình.", username: "Diệu Linh" },
    { rating: 5, comment: "Xe Vision mới, chạy êm. Rất hài lòng với dịch vụ.", username: "Tiến Dũng" },
    { rating: 5, comment: "Xe đẹp long lanh, chủ dễ thương. Sẽ giới thiệu bạn bè.", username: "Ngọc Anh" },
  ],
  tour: [
    { rating: 5, comment: "Tour tuyệt vời! HDV nhiệt tình, lịch trình hợp lý. Rất đáng tiền.", username: "Gia Bảo" },
    { rating: 5, comment: "Trải nghiệm tuyệt vời, được thăm nhiều điểm đẹp. HDV vui tính.", username: "Kim Ngân" },
    { rating: 4, comment: "Tour ổn, giá hợp lý. Ăn uống ngon, khách sạn đẹp.", username: "Minh Tâm" },
    { rating: 5, comment: "Lịch trình đa dạng, thời gian hợp lý. HDV giải thích dễ hiểu.", username: "Phú Thịnh" },
    { rating: 5, comment: "Tour rất chuyên nghiệp, tổ chức chu đáo. Sẽ tham gia tour khác.", username: "Bích Trâm" },
    { rating: 4, comment: "Các điểm tham quan đẹp, HDV nhiệt tình. Giá cả hợp lý.", username: "Hoàng Khang" },
    { rating: 5, comment: "Tour family rất vui, con nhỏ rất thích. Sẽ quay lại.", username: "Xuân Mai" },
    { rating: 5, comment: "Mọi thứ đều tuyệt, từ lịch trình đến hướng dẫn viên. Rất hài lòng!", username: "Việt Anh" },
    { rating: 4, comment: "Tour tốt, được trải nghiệm nhiều thứ mới. HDV vui vẻ.", username: "Thiên Kim" },
    { rating: 5, comment: "Lần đầu đi tour nhóm rất thú vị. Mọi người thân thiện, vui vẻ.", username: "Duy Khánh" },
  ],
  trekking: [
    { rating: 5, comment: "Cung đường đẹp, HDV am hiểu địa hình. Trải nghiệm tuyệt vời!", username: "Mạnh Hùng" },
    { rating: 5, comment: "Trekking route thách thức nhưng rất đáng. View đỉnh đẹp mê hồn.", username: "Thanh Thảo" },
    { rating: 4, comment: "Đường đi khá khó nhưng được hướng dẫn kỹ. An toàn, thú vị.", username: "Quang Hải" },
    { rating: 5, comment: "HDV dẫn đường tốt, cung cấp đầy đủ thiết bị. Rất chuyên nghiệp.", username: "Yến Nhi" },
    { rating: 5, comment: "Trải nghiệm trekking tuyệt vời! Cảnh đẹp, không khí trong lành.", username: "Đức Thắng" },
    { rating: 4, comment: "Cung đường đẹp, được trải nghiệm thiên nhiên hoang sơ. Thích!", username: "Mai Anh" },
    { rating: 5, comment: "Trekking đầu tiên rất thành công nhờ HDV tận tâm. Sẽ thử cung khác.", username: "Tuấn Anh" },
    { rating: 5, comment: "Đội ngũ hỗ trợ tốt, đường đi được chuẩn bị kỹ. An toàn tuyệt đối.", username: "Thùy Linh" },
    { rating: 4, comment: "Cung trekking thử thách, nhưng rất đáng. View từ đỉnh tuyệt đẹp.", username: "Bảo Ngọc" },
    { rating: 5, comment: "Trải nghiệm khó quên! HDV nhiệt tình, kiến thức phong phú.", username: "Hữu Thành" },
  ],
};

export default function ServiceReviews({ reviews, serviceType, serviceId }: Props) {
  const displayReviews = useMemo(() => {
    if (reviews && reviews.length > 0) {
      return reviews;
    }

    let mockPool = MOCK_REVIEWS.stay;
    
    if (serviceType) {
      const normalizedType = serviceType.toLowerCase().trim();
      if (normalizedType in MOCK_REVIEWS) {
        mockPool = MOCK_REVIEWS[normalizedType as keyof typeof MOCK_REVIEWS];
      }
    }
    
    if (!serviceId) {
      const count = Math.floor(Math.random() * 3) + 1;
      return mockPool.slice(0, count).map((review, index) => ({
        id: `mock-${index}`,
        rating: review.rating,
        comment: review.comment,
        user: {
          full_name: review.username,
          username: review.username,
        },
      }));
    }

    const seed = serviceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const reviewCount = (seed % 3) + 1;
    const startIndex = seed % (mockPool.length - reviewCount);
    const selectedReviews = mockPool.slice(startIndex, startIndex + reviewCount);
    
    return selectedReviews.map((review, index) => ({
      id: `mock-${serviceId}-${index}`,
      rating: review.rating,
      comment: review.comment,
      user: {
        full_name: review.username,
        username: review.username,
      },
    }));
  }, [reviews, serviceType, serviceId]);

  return (
    <div className="rounded-xl border border-neutral-800 bg-black p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Đánh giá từ khách</h3>
        <button className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-neutral-400 hover:bg-neutral-900 hover:border-neutral-700 hover:text-white transition-all">
          Xem thêm
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {displayReviews.length > 0 ? (
          displayReviews.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                  <span className="text-xs font-semibold text-neutral-400">
                    {(r.user?.full_name || r.user?.username || "K")[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {r.user?.full_name || r.user?.username || "Khách"}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-semibold text-white">{r.rating}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {r.comment || "Không có bình luận."}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="text-sm text-neutral-500 mb-2">
              Chưa có đánh giá
            </div>
            <p className="text-sm text-neutral-600">Chưa có bình luận.</p>
          </div>
        )}
      </div>
    </div>
  );
}