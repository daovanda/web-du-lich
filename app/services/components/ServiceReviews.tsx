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

// Mock reviews cho từng loại dịch vụ
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
  // Generate mock reviews dựa trên serviceId để giữ consistency
  const displayReviews = useMemo(() => {
    // Luôn kiểm tra reviews.length mới nhất
    if (reviews && reviews.length > 0) {
      return reviews; // Nếu có review thật thì dùng
    }

    // Debug: log serviceType để kiểm tra
    console.log('ServiceReviews - serviceType:', serviceType);
    console.log('ServiceReviews - serviceId:', serviceId);

    // Lấy mock reviews theo loại dịch vụ với fallback an toàn
    let mockPool = MOCK_REVIEWS.stay; // Default
    
    if (serviceType) {
      const normalizedType = serviceType.toLowerCase().trim();
      if (normalizedType in MOCK_REVIEWS) {
        mockPool = MOCK_REVIEWS[normalizedType as keyof typeof MOCK_REVIEWS];
        console.log('Using mockPool for type:', normalizedType);
      } else {
        console.warn('Unknown service type:', serviceType, '- using stay as fallback');
      }
    }
    
    if (!serviceId) {
      // Fallback: random từ 1-3 reviews
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

    // Tạo seed từ serviceId để consistent
    const seed = serviceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Random số lượng reviews từ 1-3
    const reviewCount = (seed % 3) + 1;
    
    // Random vị trí bắt đầu trong mockPool
    const startIndex = seed % (mockPool.length - reviewCount);
    
    // Lấy reviews
    const selectedReviews = mockPool.slice(startIndex, startIndex + reviewCount);
    
    console.log('Selected reviews count:', selectedReviews.length, 'from pool:', mockPool.length);
    
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Đánh giá từ khách</h3>
        <button className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10">
          Xem thêm
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {displayReviews.length > 0 ? (
          displayReviews.map((r) => (
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