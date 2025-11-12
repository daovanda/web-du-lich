export const PaymentContent = [
  {
    id: "payment-1",
    title: "1. Nguyên tắc chung",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Website <span className="text-white font-medium">chagmihaydi</span> đóng vai trò trung gian thu hộ và đối soát thanh toán giữa Khách hàng và Nhà cung cấp dịch vụ.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Mục tiêu là đảm bảo minh bạch, an toàn và thuận tiện cho cả Khách hàng và Nhà cung cấp.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "payment-2",
    title: "2. Cơ chế thu hộ",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          <span className="text-white font-medium">2.1.</span> Khách hàng thực hiện thanh toán trực tiếp qua Website bằng các hình thức: chuyển khoản ngân hàng, thẻ tín dụng, ví điện tử, hoặc các phương thức thanh toán hợp pháp khác.
        </p>
        <p>
          <span className="text-white font-medium">2.2.</span> Website thu tiền từ Khách hàng và giữ tạm thời trong tài khoản trung gian.
        </p>
        <p>
          <span className="text-white font-medium">2.3.</span> Sau khi dịch vụ được xác nhận hoàn tất hoặc theo quy định hủy/hoàn tiền, Website sẽ chuyển tiền cho Nhà cung cấp trừ đi các khoản phí và hoa hồng.
        </p>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-white font-medium text-xs mb-1">Quy trình thu hộ</p>
              <p className="text-xs text-blue-400">Khách hàng thanh toán → Website giữ tạm → Dịch vụ hoàn tất → Chuyển cho Nhà cung cấp (trừ phí)</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "payment-3",
    title: "3. Hoa hồng & Phí dịch vụ",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Mỗi giao dịch sẽ áp dụng <span className="text-white font-medium">hoa hồng</span> do Website quy định - đã được thỏa thuận với đối tác (ví dụ: 5-15% giá trị dịch vụ).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Các khoản phí khác (phí thanh toán, phí xử lý đối soát) sẽ được thông báo rõ ràng trước khi Nhà cung cấp đồng ý hợp tác.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Hoa hồng và phí dịch vụ sẽ được trừ trực tiếp từ số tiền thanh toán trước khi chuyển cho Nhà cung cấp.</span>
          </li>
        </ul>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-white font-medium text-xs mb-1">Lưu ý quan trọng</p>
              <p className="text-xs text-amber-400">Tất cả phí được trừ trực tiếp trước khi chuyển tiền cho Nhà cung cấp</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "payment-4",
    title: "4. Thời gian đối soát & chuyển tiền",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">•</span>
            <span>Đối soát được thực hiện <span className="text-white font-medium">theo chu kỳ định kỳ</span>: hàng tuần hoặc hàng tháng tùy thỏa thuận.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">•</span>
            <span>Thời gian chuyển tiền cho Nhà cung cấp: <span className="text-white font-medium">3-7 ngày làm việc</span> kể từ khi đối soát xác nhận.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">•</span>
            <span>Website sẽ cung cấp báo cáo chi tiết về giao dịch, hoa hồng, phí và số tiền cuối cùng Nhà cung cấp nhận được.</span>
          </li>
        </ul>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-white font-medium text-xs mb-1">Báo cáo chi tiết</p>
              <p className="text-xs text-purple-400">Website cung cấp báo cáo chi tiết về giao dịch, hoa hồng, phí và số tiền cuối cùng</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "payment-5",
    title: "5. Xử lý lỗi thanh toán",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          <span className="text-white font-medium">5.1.</span> Nếu xảy ra sự cố trong quá trình thanh toán (sai số tiền, chậm trễ, nhầm lẫn...), Nhà cung cấp cần thông báo cho Website qua kênh chính thức (Email/Hotline).
        </p>
        <p>
          <span className="text-white font-medium">5.2.</span> Website sẽ xác nhận giao dịch và phối hợp với Khách hàng hoặc ngân hàng để điều chỉnh và xử lý trong thời gian sớm nhất.
        </p>
        <p>
          <span className="text-white font-medium">5.3.</span> Trong trường hợp tranh chấp về thanh toán, quyết định cuối cùng sẽ dựa trên báo cáo giao dịch và bằng chứng xác thực từ cả hai bên.
        </p>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <p className="text-white font-medium text-xs mb-1">Giải quyết tranh chấp</p>
              <p className="text-xs text-blue-400">Quyết định cuối cùng dựa trên báo cáo giao dịch và bằng chứng từ cả hai bên</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "payment-6",
    title: "6. Quyền và nghĩa vụ bổ sung của Nhà cung cấp",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Nhà cung cấp phải cung cấp thông tin tài khoản ngân hàng chính xác, hợp pháp để nhận thanh toán.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Nhà cung cấp chịu trách nhiệm kiểm tra số tiền, đối soát và thông báo ngay khi phát hiện bất thường.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Không được thay đổi thông tin thanh toán mà không thông báo trước cho Website.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "payment-7",
    title: "7. Giới hạn trách nhiệm của Website",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Website không chịu trách nhiệm về việc Khách hàng thanh toán sai hoặc không thanh toán.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Website không chịu trách nhiệm về sự chậm trễ phát sinh từ ngân hàng, ví điện tử hoặc các bên trung gian thanh toán.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Trách nhiệm của Website giới hạn ở việc thu hộ, đối soát, thông báo minh bạch và chuyển tiền theo đúng thông tin do Nhà cung cấp cung cấp.</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "payment-8",
    title: "8. Hiệu lực và sửa đổi",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Chính sách có hiệu lực từ ngày công bố trên Website.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Website có quyền điều chỉnh nội dung chính sách và sẽ thông báo trực tiếp cho Nhà cung cấp.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Mọi thay đổi sẽ áp dụng cho các giao dịch tiếp theo và không ảnh hưởng đến các giao dịch đã hoàn tất, trừ khi có thỏa thuận khác.</span>
          </li>
        </ul>
      </div>
    ),
  },
];