export const PartnerContent = [
  {
    id: "partner-1",
    title: "1. Định nghĩa",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <div className="space-y-3">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">Đối tác / Nhà cung cấp:</p>
            <p className="text-xs">
              Cá nhân, tổ chức cung cấp dịch vụ như homestay, tour du lịch, xe khách, thuê xe máy... trên Website <span className="text-white font-medium">chagmihaydi</span>.
            </p>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">Khách hàng:</p>
            <p className="text-xs">
              Người sử dụng dịch vụ qua Website.
            </p>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">Website / chagmihaydi:</p>
            <p className="text-xs">
              Nền tảng trung gian kết nối Khách hàng và Nhà cung cấp dịch vụ.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "partner-2",
    title: "2. Quyền và nghĩa vụ của Đối tác",
    content: (
      <div className="space-y-4 text-sm text-neutral-400">
        {/* 2.1 Quyền của Đối tác */}
        <div>
          <p className="text-white font-medium mb-3">2.1. Quyền của Đối tác</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1 flex-shrink-0">✓</span>
              <span>Niêm yết dịch vụ, mức giá, hình ảnh, mô tả chi tiết trên Website.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1 flex-shrink-0">✓</span>
              <span>Nhận thanh toán qua Website sau khi Website hoàn tất đối soát và thu hộ.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1 flex-shrink-0">✓</span>
              <span>Yêu cầu Website hỗ trợ trong việc giải quyết khiếu nại hoặc tranh chấp với Khách hàng.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1 flex-shrink-0">✓</span>
              <span>Thay đổi thông tin dịch vụ, hình ảnh, giá cả theo chính sách của Website, miễn sao không gây hiểu lầm cho Khách hàng.</span>
            </li>
          </ul>
        </div>

        {/* 2.2 Nghĩa vụ của Đối tác */}
        <div>
          <p className="text-white font-medium mb-3">2.2. Nghĩa vụ của Đối tác</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
              <span>Cung cấp thông tin dịch vụ chính xác, đầy đủ, minh bạch và cập nhật.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
              <span>Đảm bảo chất lượng dịch vụ đúng mô tả, sẵn sàng phục vụ Khách hàng theo lịch đặt.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
              <span>Xử lý các yêu cầu thay đổi, hủy hoặc khiếu nại từ Khách hàng một cách chuyên nghiệp và hợp pháp.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
              <span>Tuân thủ quy định pháp luật liên quan đến dịch vụ cung cấp (ví dụ: giấy phép kinh doanh, bảo hiểm, an toàn...).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
              <span>Chịu trách nhiệm pháp lý đối với dịch vụ do mình cung cấp; Website không chịu trách nhiệm thay cho Nhà cung cấp.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
              <span>Thanh toán các khoản phí dịch vụ, hoa hồng hoặc chi phí phát sinh theo thỏa thuận với Website.</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "partner-3",
    title: "3. Quy trình hợp tác với Website",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <div className="space-y-3">
          {[
            { text: "Đăng ký tài khoản đối tác và cung cấp giấy tờ pháp lý, thông tin liên hệ chính xác." },
            { text: "Niêm yết dịch vụ trên Website sau khi được phê duyệt." },
            { text: "Thực hiện các đơn đặt dịch vụ từ Khách hàng qua Website và đảm bảo thực hiện đúng chất lượng." },
            { text: "Thực hiện đối soát và nhận thanh toán theo chu kỳ do Website quy định." }
          ].map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <span className="text-xs text-purple-400 font-medium">{index + 1}</span>
              </div>
              <span>{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "partner-4",
    title: "4. Giới hạn trách nhiệm của Website",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1 flex-shrink-0">•</span>
              <span>Website chỉ đóng vai trò trung gian, không trực tiếp cung cấp dịch vụ.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1 flex-shrink-0">•</span>
              <span>Không chịu trách nhiệm về chất lượng dịch vụ thực tế, hành vi của nhân viên Nhà cung cấp, hoặc thiệt hại phát sinh từ việc sử dụng dịch vụ.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1 flex-shrink-0">•</span>
              <span>Trách nhiệm của Website giới hạn ở việc cung cấp thông tin chính xác, hỗ trợ Khách hàng liên hệ Nhà cung cấp để giải quyết khiếu nại hoặc tranh chấp.</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "partner-5",
    title: "5. Khiếu nại và giải quyết tranh chấp",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1 flex-shrink-0">•</span>
            <span>Mọi tranh chấp liên quan đến Khách hàng sẽ được Website tiếp nhận và hỗ trợ Đối tác phối hợp giải quyết.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1 flex-shrink-0">•</span>
            <span>Trong trường hợp các bên không thể tự giải quyết, tranh chấp sẽ được giải quyết theo pháp luật Việt Nam tại Tòa án có thẩm quyền.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "partner-6",
    title: "6. Hiệu lực và sửa đổi",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1 flex-shrink-0">•</span>
            <span>Điều khoản này có hiệu lực từ ngày công bố trên Website.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1 flex-shrink-0">•</span>
            <span>Website có quyền điều chỉnh nội dung và thông báo bằng cách cập nhật trực tiếp trên Website.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1 flex-shrink-0">•</span>
            <span>Mọi thay đổi áp dụng cho các giao dịch tiếp theo, không ảnh hưởng đến các giao dịch đã hoàn tất, trừ khi có thỏa thuận khác.</span>
          </li>
        </ul>
      </div>
    ),
  },
];