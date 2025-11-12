export const ComplaintsContent = [
  {
    id: "complaints-1",
    title: "1. Nguyên Tắc Chung",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          Website <span className="text-white font-medium">chagmihaydi</span> (sau đây gọi là "Website" hoặc "Chúng tôi") hoạt động với vai trò là <span className="text-white font-medium">nền tảng trung gian kết nối</span> Khách hàng và Nhà cung cấp Dịch vụ.
        </p>
        <p>
          Chúng tôi cam kết tiếp nhận và hỗ trợ Khách hàng giải quyết mọi khiếu nại phát sinh trong quá trình giao dịch và sử dụng dịch vụ trên tinh thần <span className="text-white font-medium">hợp tác, minh bạch</span> và <span className="text-white font-medium">tôn trọng quyền lợi hợp pháp</span> của tất cả các bên.
        </p>
        <p>
          Mọi khiếu nại sẽ được xử lý dựa trên các Điều khoản Sử dụng, Chính sách Hủy - Đổi - Hoàn tiền và các quy định pháp luật hiện hành của Việt Nam.
        </p>
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mt-4">
          <p className="text-red-400 text-xs">
            ⚠️ Website <span className="text-white font-medium">không trực tiếp chịu trách nhiệm</span> về chất lượng dịch vụ thực tế, hành vi của nhân viên Nhà cung cấp hoặc các tranh chấp nằm ngoài phạm vi trách nhiệm trung gian đã được định rõ.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "complaints-2",
    title: "2. Phạm Vi Khiếu Nại",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p className="text-white font-medium">Website tiếp nhận và hỗ trợ giải quyết các khiếu nại liên quan đến:</p>
        <div className="space-y-3 mt-4">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">📋</span>
              <div>
                <h4 className="text-white font-medium mb-2">Thông tin dịch vụ:</h4>
                <p className="text-xs">
                  Dịch vụ thực tế (homestay, tour, thuê xe,...) khác biệt đáng kể hoặc không đúng với mô tả, hình ảnh, thông tin niêm yết trên Website.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🎫</span>
              <div>
                <h4 className="text-white font-medium mb-2">Thực hiện đặt dịch vụ:</h4>
                <p className="text-xs">
                  Vấn đề liên quan đến việc xác nhận đặt chỗ, thay đổi, hủy, hoàn tiền hoặc việc Nhà cung cấp từ chối thực hiện dịch vụ đã đặt thành công.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💳</span>
              <div>
                <h4 className="text-white font-medium mb-2">Vấn đề thanh toán:</h4>
                <p className="text-xs">
                  Các lỗi kỹ thuật trong quá trình giao dịch, sai số tiền, hoặc chậm trễ hoàn tiền (trong phạm vi kiểm soát của Website và đơn vị trung gian thanh toán).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "complaints-3",
    title: "3. Quy Trình Xử Lý Khiếu Nại",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p className="text-white font-medium">Khách hàng cần thực hiện khiếu nại theo trình tự sau:</p>
        
        {/* Bước 1 */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 mt-4">
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-white font-medium">3.1. Bước 1: Tiếp nhận Khiếu nại</h4>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap">
              24 giờ
            </span>
          </div>
          <p className="text-xs mb-3">
            Khách hàng gửi khiếu nại kèm theo bằng chứng xác thực (ảnh, video, xác nhận đặt dịch vụ, email,...) qua kênh liên hệ chính thức của Website:
          </p>
          <div className="space-y-2 ml-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">•</span>
              <span className="text-xs"><span className="text-white font-medium">Email hỗ trợ:</span> support@chagmihaydi.vn</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">•</span>
              <span className="text-xs"><span className="text-white font-medium">Hotline:</span> 1900 1234</span>
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-400">
              Website cam kết phản hồi xác nhận đã nhận được khiếu nại của Khách hàng trong vòng <span className="text-white font-medium">24 giờ làm việc</span> kể từ thời điểm tiếp nhận.
            </p>
          </div>
        </div>

        {/* Bước 2 */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-white font-medium">3.2. Bước 2: Phân loại và Chuyển giao</h4>
            <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 whitespace-nowrap">
              24 giờ
            </span>
          </div>
          <p className="text-xs">
            Website tiến hành phân loại mức độ phức tạp của khiếu nại và chuyển yêu cầu, bằng chứng liên quan đến Nhà cung cấp Dịch vụ có liên quan trong vòng <span className="text-white font-medium">24 giờ làm việc</span> sau khi xác nhận.
          </p>
        </div>

        {/* Bước 3 */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-white font-medium">3.3. Bước 3: Xử lý nội bộ</h4>
            <span className="text-xs bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30 whitespace-nowrap">
              48 giờ
            </span>
          </div>
          <p className="text-xs">
            Nhà cung cấp Dịch vụ có trách nhiệm tiến hành xác minh, làm rõ nội dung khiếu nại và đề xuất phương án giải quyết (bao gồm việc hoàn tiền, bồi thường, hoặc thay thế dịch vụ nếu có) và phản hồi lại cho Website trong vòng <span className="text-white font-medium">48 giờ làm việc</span> kể từ khi nhận được thông báo chuyển giao.
          </p>
        </div>

        {/* Bước 4 */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-white font-medium">3.4. Bước 4: Thông báo và Hoàn tất</h4>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap">
              12 giờ
            </span>
          </div>
          <p className="text-xs mb-3">
            Website thông báo kết quả xử lý và phương án giải quyết cuối cùng của Nhà cung cấp cho Khách hàng trong vòng <span className="text-white font-medium">12 giờ làm việc</span> sau khi nhận được phản hồi.
          </p>
          <ul className="space-y-2 ml-4 text-xs">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Nếu Khách hàng đồng ý, các thủ tục hoàn tiền hoặc bồi thường sẽ được tiến hành. Thời gian hoàn tiền sẽ tuân theo Chính sách Hủy - Đổi - Hoàn tiền (thường là <span className="text-white font-medium">3-7 ngày làm việc</span> kể từ khi hai bên xác nhận).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Tổng thời gian giải quyết khiếu nại (từ Bước 1 đến Bước 4) <span className="text-white font-medium">không quá 7 ngày làm việc</span> đối với các trường hợp thông thường.</span>
            </li>
          </ul>
        </div>

        {/* Tổng kết */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <p className="text-white font-medium text-sm mb-1">Tổng thời gian xử lý</p>
              <p className="text-xs text-blue-400">Không quá <span className="text-white font-medium">7 ngày làm việc</span> cho các trường hợp thông thường</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "complaints-4",
    title: "4. Giải Quyết Tranh Chấp và Pháp Lý",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          Trong trường hợp Khách hàng không đồng ý với phương án giải quyết của Nhà cung cấp, Website sẽ tiếp tục đóng vai trò là bên trung gian hỗ trợ trao đổi, hòa giải và tìm kiếm giải pháp tối ưu cho cả hai bên.
        </p>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
          <p className="text-xs text-amber-400">
            Nếu sau quá trình hòa giải, các bên vẫn không đạt được thỏa thuận, tranh chấp sẽ được giải quyết theo quy định của <span className="text-white font-medium">Pháp luật Việt Nam</span> tại <span className="text-white font-medium">Tòa án có thẩm quyền</span>.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "complaints-5",
    title: "Thông tin Liên hệ",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p className="text-white font-medium mb-4">Kênh tiếp nhận khiếu nại chính thức:</p>
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📧</span>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm mb-1">Email hỗ trợ</h4>
                <p className="text-blue-400 text-xs">support@chagmihaydi.vn</p>
                <p className="text-neutral-500 text-xs mt-1">Gửi khiếu nại kèm bằng chứng chi tiết</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📞</span>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm mb-1">Hotline hỗ trợ</h4>
                <p className="text-emerald-400 text-xs">1900 1234</p>
                <p className="text-neutral-500 text-xs mt-1">Phản hồi trong 24 giờ làm việc</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm mb-1">Hộ kinh doanh</h4>
                <p className="text-purple-400 text-xs">Đào Văn Đà</p>
                <p className="text-neutral-500 text-xs mt-1">Website: chagmihaydi.vn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];