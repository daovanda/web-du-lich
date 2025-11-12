export const RefundContent = [
  {
    id: "refund-1",
    title: "1. Nguyên tắc chung",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          <span className="text-white font-medium">1.1.</span> Website <span className="text-white font-medium">chagmihaydi</span> hoạt động như nền tảng trung gian, giúp kết nối Khách hàng với Nhà cung cấp dịch vụ.
        </p>
        <p>
          <span className="text-white font-medium">1.2.</span> Quy trình hủy, đổi, hoàn tiền được thực hiện dựa trên thỏa thuận giữa Khách hàng và Nhà cung cấp, đồng thời tuân thủ các điều khoản của Website.
        </p>
        <p>
          <span className="text-white font-medium">1.3.</span> Khách hàng cần thực hiện yêu cầu hủy hoặc đổi dịch vụ qua Website trước thời hạn quy định để được xem xét hoàn tiền hoặc chuyển đổi dịch vụ.
        </p>
      </div>
    ),
  },
  {
    id: "refund-2",
    title: "2. Chính sách Hủy - Đổi theo loại dịch vụ",
    content: (
      <div className="space-y-6 text-sm text-neutral-400">
        {/* Homestay & Khách sạn */}
        <div>
          <h4 className="text-white font-medium mb-3">2.1. Homestay & Khách sạn</h4>
          <div className="space-y-2">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center justify-between">
              <span>Hủy trước <span className="text-white font-medium">7 ngày</span></span>
              <span className="text-emerald-400 font-bold text-lg">100%</span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center justify-between">
              <span>Hủy từ <span className="text-white font-medium">3-6 ngày</span></span>
              <span className="text-amber-400 font-bold text-lg">50%</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center justify-between">
              <span>Hủy dưới <span className="text-white font-medium">3 ngày</span> hoặc không đến</span>
              <span className="text-red-400 font-bold text-lg">0%</span>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 mt-3">
            <p className="text-xs">
              <span className="text-white font-medium">Đổi ngày đặt:</span> Yêu cầu được chấp nhận tùy theo tình trạng phòng còn trống và phải thông báo trước ít nhất 3 ngày.
            </p>
          </div>
        </div>

        {/* Tour du lịch / Trekking */}
        <div>
          <h4 className="text-white font-medium mb-3">2.2. Tour du lịch / Trekking</h4>
          <div className="space-y-2">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center justify-between">
              <span>Hủy trước <span className="text-white font-medium">14 ngày</span></span>
              <span className="text-emerald-400 font-bold text-lg">100%</span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center justify-between">
              <span>Hủy từ <span className="text-white font-medium">7-13 ngày</span></span>
              <span className="text-amber-400 font-bold text-lg">50%</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center justify-between">
              <span>Hủy dưới <span className="text-white font-medium">7 ngày</span></span>
              <span className="text-red-400 font-bold text-lg">0%</span>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 mt-3">
            <p className="text-xs">
              <span className="text-white font-medium">Thay đổi lịch trình tour:</span> Phụ thuộc vào khả năng sắp xếp của Nhà cung cấp, chi phí phát sinh do thay đổi sẽ do Khách hàng chịu.
            </p>
          </div>
        </div>

        {/* Thuê xe máy / Xe khách */}
        <div>
          <h4 className="text-white font-medium mb-3">2.3. Thuê xe máy / Xe khách</h4>
          <div className="space-y-2">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center justify-between">
              <span>Hủy trước <span className="text-white font-medium">3 ngày</span></span>
              <span className="text-emerald-400 font-bold text-lg">100%</span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center justify-between">
              <span>Hủy từ <span className="text-white font-medium">1-2 ngày</span></span>
              <span className="text-amber-400 font-bold text-lg">50%</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center justify-between">
              <span>Hủy trong ngày hoặc không sử dụng dịch vụ</span>
              <span className="text-red-400 font-bold text-lg">0%</span>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 mt-3">
            <p className="text-xs">
              <span className="text-white font-medium">Thay đổi thời gian hoặc loại xe:</span> Yêu cầu được chấp nhận theo tình trạng xe còn trống và chi phí phát sinh (nếu có).
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "refund-3",
    title: "3. Quy trình Hủy - Đổi - Hoàn tiền",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <div className="space-y-3">
          {[
            { step: "3.1.", text: "Khách hàng gửi yêu cầu hủy hoặc đổi dịch vụ qua Website (Email, Hotline, hoặc tính năng trên ứng dụng)." },
            { step: "3.2.", text: "Website xác nhận yêu cầu và thông báo cho Nhà cung cấp để xử lý." },
            { step: "3.3.", text: "Nhà cung cấp thực hiện đối soát và thông báo kết quả hủy/đổi/hoàn tiền cho Khách hàng." },
            { step: "3.4.", text: "Thời gian hoàn tiền: từ 3-7 ngày làm việc kể từ khi Nhà cung cấp xác nhận." },
            { step: "3.5.", text: "Các khoản phí giao dịch ngân hàng hoặc chi phí xử lý (nếu có) sẽ được trừ trước khi hoàn tiền." }
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <span className="text-xs text-blue-400 font-medium">{index + 1}</span>
              </div>
              <div>
                <span className="text-white font-medium">{item.step}</span> {item.text}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-4">
          <p className="text-xs text-amber-400">⚠️ Các khoản phí giao dịch ngân hàng hoặc chi phí xử lý (nếu có) sẽ được trừ trước khi hoàn tiền.</p>
        </div>
      </div>
    ),
  },
  {
    id: "refund-4",
    title: "4. Trường hợp đặc biệt",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
          <p className="text-white font-medium mb-2">Trường hợp bất khả kháng:</p>
          <p className="text-xs">
            Thiên tai, bão lũ, dịch bệnh, đình trệ giao thông, Website và Nhà cung cấp sẽ thông báo ngay và phối hợp tìm giải pháp thay thế hoặc hoàn tiền phù hợp.
          </p>
        </div>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
          <p className="text-white font-medium mb-2">Thỏa thuận riêng:</p>
          <p className="text-xs">
            Khách hàng và Nhà cung cấp có thể thỏa thuận riêng cho các trường hợp đặc biệt nhưng phải được Website xác nhận để đảm bảo minh bạch.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "refund-5",
    title: "5. Điều khoản bổ sung & Trách nhiệm của Website",
    content: (
      <div className="space-y-4 text-sm text-neutral-400">
        {/* 5.1 Vai trò của Website */}
        <div>
          <p className="text-white font-medium mb-2">5.1. Vai trò của Website</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Website chỉ đóng vai trò trung gian kết nối Khách hàng và Nhà cung cấp.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Mọi quyết định cuối cùng về việc hủy, đổi, hoàn tiền đều dựa trên chính sách của Nhà cung cấp và thỏa thuận giữa các bên.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Website có trách nhiệm hỗ trợ Khách hàng liên hệ, cung cấp thông tin và hướng dẫn thực hiện yêu cầu hủy/đổi/hoàn tiền.</span>
            </li>
          </ul>
        </div>

        {/* 5.2 Trách nhiệm của Website */}
        <div>
          <p className="text-white font-medium mb-2">5.2. Trách nhiệm của Website</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Cung cấp thông tin chính xác về điều kiện hủy, đổi, hoàn tiền theo từng dịch vụ.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Giúp Khách hàng và Nhà cung cấp giải quyết tranh chấp liên quan đến việc hủy/đổi/hoàn tiền.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Không chịu trách nhiệm thay cho Nhà cung cấp nếu dịch vụ không thể thực hiện đúng chất lượng hoặc không hủy/hoàn tiền ngoài quy định của Nhà cung cấp.</span>
            </li>
          </ul>
        </div>

        {/* 5.3 Giới hạn trách nhiệm */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
          <p className="text-white font-medium mb-2">5.3. Giới hạn trách nhiệm</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Website không chịu trách nhiệm pháp lý với thiệt hại phát sinh từ việc Khách hàng hủy muộn, thay đổi thông tin sai hoặc vi phạm điều kiện của Nhà cung cấp.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Trong trường hợp bất khả kháng (thiên tai, dịch bệnh, sự cố kỹ thuật ngoài tầm kiểm soát), Website sẽ hỗ trợ Khách hàng và Nhà cung cấp trong khả năng cho phép nhưng không chịu trách nhiệm pháp lý.</span>
            </li>
          </ul>
        </div>

        {/* 5.4 Khiếu nại & Giải quyết tranh chấp */}
        <div>
          <p className="text-white font-medium mb-2">5.4. Khiếu nại & Giải quyết tranh chấp</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1">•</span>
              <span>Mọi khiếu nại về hủy, đổi, hoàn tiền cần được gửi qua kênh chính thức của Website (Email/Hotline).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1">•</span>
              <span>Website sẽ tiếp nhận, hỗ trợ trao đổi giữa Khách hàng và Nhà cung cấp trên tinh thần hợp tác, minh bạch và tôn trọng quyền lợi các bên.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1">•</span>
              <span>Nếu không thể giải quyết, các tranh chấp sẽ được xử lý theo pháp luật Việt Nam tại Tòa án có thẩm quyền.</span>
            </li>
          </ul>
        </div>

        {/* 5.5 Hiệu lực & Sửa đổi */}
        <div>
          <p className="text-white font-medium mb-2">5.5. Hiệu lực & Sửa đổi</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Chính sách này có hiệu lực từ ngày công bố trên Website.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Website có quyền điều chỉnh nội dung chính sách, việc sửa đổi sẽ được cập nhật trực tiếp trên Website.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Mọi thay đổi sẽ áp dụng cho các giao dịch tiếp theo, không ảnh hưởng đến các giao dịch đã hoàn tất trừ khi có thỏa thuận khác.</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
];