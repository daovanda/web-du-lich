export const PrivacyContent = [
  {
    id: "privacy-intro",
    title: "Giới thiệu",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          Chính sách Bảo mật này mô tả cách <span className="text-white font-medium">chagmihaydi</span> (sau đây gọi là <span className="text-white">"Chúng tôi"</span>) 
          thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của người dùng (sau đây gọi là <span className="text-white">"Khách hàng"</span>) khi sử dụng Website và 
          các dịch vụ đi kèm.
        </p>
        <p className="bg-amber-400/5 border border-amber-400/20 rounded-lg p-3">
          Việc truy cập và sử dụng Website đồng nghĩa với việc Khách hàng <span className="text-white font-medium">đồng ý với các nội dung</span> trong Chính sách này.
        </p>
      </div>
    ),
  },
  {
    id: "privacy-1",
    title: "1. Phạm vi và Mục đích Thu thập Thông tin",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p className="text-white font-medium">Chúng tôi thu thập thông tin nhằm:</p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Cung cấp dịch vụ đúng theo yêu cầu của Khách hàng</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Liên hệ hỗ trợ khi cần (ví dụ: xác nhận đặt chỗ, thay đổi, hủy)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Cải thiện trải nghiệm người dùng và chất lượng dịch vụ</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Đảm bảo an toàn giao dịch và ngăn ngừa gian lận</span>
          </li>
        </ul>

        <p className="text-white font-medium mt-6">Các loại thông tin thu thập có thể bao gồm:</p>
        
        <div className="space-y-3 mt-4">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">1. Thông tin cá nhân:</p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">→</span>
                <span>Họ tên, số điện thoại, email, ngày sinh (nếu cần)</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">2. Thông tin đặt dịch vụ:</p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">→</span>
                <span>Dịch vụ đặt, thời gian, địa điểm, yêu cầu đặc biệt</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">3. Thông tin thanh toán:</p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">→</span>
                <span>Phương thức thanh toán, trạng thái thanh toán</span>
              </li>
            </ul>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-3">
              <p className="text-xs text-blue-400">
                <span className="font-medium">Lưu ý:</span> Chúng tôi <span className="text-white font-medium">không lưu trữ số thẻ ngân hàng</span> hoặc dữ liệu bảo mật thanh toán.
              </p>
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">4. Thông tin kỹ thuật:</p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">→</span>
                <span>Địa chỉ IP, loại thiết bị, trình duyệt, cookies phục vụ phân tích và cải thiện website</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "privacy-2",
    title: "2. Cách Chúng Tôi Sử Dụng Thông Tin",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>Thông tin sẽ được sử dụng cho các mục đích:</p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Xác nhận và thực hiện đơn đặt dịch vụ giữa Khách hàng và Nhà cung cấp</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Liên hệ thông báo thay đổi, hỗ trợ, chăm sóc khách hàng</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Cải thiện chất lượng giao diện và dịch vụ trên website</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Gửi thông tin khuyến mãi, thông báo (nếu Khách hàng đồng ý)</span>
          </li>
        </ul>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mt-4">
          <p className="text-emerald-400">
            Chúng tôi <span className="text-white font-medium">cam kết không bán hoặc trao đổi thông tin cá nhân</span> cho bên thứ ba vì mục đích thương mại.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "privacy-3",
    title: "3. Chia Sẻ Thông Tin Với Bên Thứ Ba",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>Thông tin có thể được chia sẻ trong các trường hợp sau:</p>
        <div className="space-y-3 mt-4">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">Với Nhà cung cấp Dịch vụ:</p>
            <p className="text-xs">Để hoàn thành yêu cầu đặt dịch vụ của Khách hàng.</p>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">Theo yêu cầu của cơ quan nhà nước có thẩm quyền:</p>
            <p className="text-xs">Theo đúng quy định pháp luật.</p>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">Với đơn vị trung gian thanh toán:</p>
            <p className="text-xs">Khi Khách hàng thực hiện thanh toán online.</p>
          </div>
        </div>
        <p className="text-xs bg-amber-400/5 border border-amber-400/20 rounded-lg p-3 mt-4">
          Tất cả bên thứ ba liên quan đều phải cam kết bảo mật thông tin theo tiêu chuẩn phù hợp.
        </p>
      </div>
    ),
  },
  {
    id: "privacy-4",
    title: "4. Lưu Trữ và Bảo Vệ Thông Tin",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Thông tin cá nhân được lưu trữ trên hệ thống bảo mật của chúng tôi.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Chúng tôi sử dụng các biện pháp kỹ thuật để bảo vệ dữ liệu: mã hóa, kiểm soát truy cập, tường lửa server.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Chỉ nhân sự có thẩm quyền mới được truy cập thông tin người dùng.</span>
          </li>
        </ul>
        <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg p-4 mt-4">
          <p className="text-amber-400 text-xs">
            ⚠️ Tuy nhiên, không có hệ thống nào an toàn tuyệt đối. Khách hàng cần chủ động bảo vệ tài khoản và thiết bị.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "privacy-5",
    title: "5. Quyền của Khách hàng",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p className="text-white font-medium">Khách hàng có quyền:</p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Yêu cầu xem lại thông tin cá nhân của mình</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Yêu cầu chỉnh sửa thông tin nếu không chính xác</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Yêu cầu ngừng sử dụng hoặc xóa thông tin (trong phạm vi pháp luật cho phép)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Từ chối nhận các thông báo tiếp thị bất cứ lúc nào</span>
          </li>
        </ul>
        <p className="text-xs mt-4 bg-neutral-900/50 border border-neutral-800 rounded-lg p-3">
          Yêu cầu hỗ trợ qua email/hotline hỗ trợ (xem phần thông tin liên hệ).
        </p>
      </div>
    ),
  },
  {
    id: "privacy-6",
    title: "6. Sử Dụng Cookies",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>Website có thể sử dụng Cookies hoặc công nghệ tương tự để:</p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Ghi nhớ tùy chọn người dùng</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Phân tích hành vi truy cập nhằm cải thiện trải nghiệm</span>
          </li>
        </ul>
        <p className="text-xs mt-4 bg-neutral-900/50 border border-neutral-800 rounded-lg p-3">
          Khách hàng có thể tắt Cookies trong trình duyệt --- tuy nhiên một số chức năng có thể bị hạn chế.
        </p>
      </div>
    ),
  },
  {
    id: "privacy-7",
    title: "7. Thay Đổi Chính Sách Bảo Mật",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          Chúng tôi có quyền điều chỉnh Chính sách này khi cần thiết.
        </p>
        <p>
          Phiên bản mới sẽ được cập nhật trực tiếp trên Website.
        </p>
        <p className="bg-amber-400/5 border border-amber-400/20 rounded-lg p-3">
          Việc Khách hàng tiếp tục sử dụng Website sau khi cập nhật được xem là <span className="text-white font-medium">đồng ý với thay đổi</span>.
        </p>
      </div>
    ),
  },
  {
    id: "privacy-8",
    title: "8. Thông Tin Liên Hệ",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-neutral-500 text-xs mb-1">Hộ kinh doanh</p>
            <p className="text-white font-medium">Đào Văn Đà</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">Thương hiệu vận hành</p>
            <p className="text-white">chagmihaydi</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">Email hỗ trợ</p>
            <p className="text-blue-400">support@chagmihaydi.vn</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">Hotline</p>
            <p className="text-emerald-400">1900 1234</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">Địa chỉ đăng ký kinh doanh</p>
            <p className="text-white">[Đang cập nhật]</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "privacy-9",
    title: "9. Thời Hạn Lưu Trữ & Xóa Dữ Liệu",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Dữ liệu cá nhân được lưu trữ <span className="text-white font-medium">tối đa 10 năm</span> kể từ giao dịch cuối cùng.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Khách hàng có quyền yêu cầu xóa dữ liệu bất kỳ lúc nào (trừ dữ liệu cần lưu theo pháp luật).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Yêu cầu xóa sẽ được xử lý trong vòng <span className="text-white font-medium">72 giờ làm việc</span> kể từ khi nhận được yêu cầu hợp lệ qua email/hotline.</span>
          </li>
        </ul>
      </div>
    ),
  },
];