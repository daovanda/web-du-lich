export const TermsContent = [
  {
    id: "terms-1",
    title: "1. Giới thiệu và Chấp nhận Điều khoản",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          Chào mừng Quý khách đến với <span className="text-white font-medium">chagmihaydi</span> (sau đây gọi là <span className="text-white">"Website"</span>). 
          Website được vận hành bởi <span className="text-white font-medium">Hộ kinh doanh Đào Văn Đà</span> (sau đây gọi là <span className="text-white">"Chúng tôi"</span>).
        </p>
        <p>
          Bằng việc truy cập, sử dụng Website và/hoặc thực hiện đặt dịch vụ thông qua Website, Quý khách được hiểu là đã <span className="text-white">đọc, hiểu và đồng ý</span> chịu sự 
          ràng buộc của <span className="text-white">Điều khoản Sử dụng này</span>, cũng như <span className="text-white">Chính sách Bảo mật</span>, <span className="text-white">Chính sách Hủy & Hoàn tiền</span>, 
          cùng các quy định liên quan khác được công bố trên Website.
        </p>
        <p className="text-amber-400/90 bg-amber-400/5 border border-amber-400/20 rounded-lg p-3">
          Nếu Quý khách <span className="font-medium">không đồng ý</span> với bất kỳ nội dung nào trong Điều khoản này, <span className="font-medium">vui lòng ngừng sử dụng Website</span>.
        </p>
        <p>
          Chúng tôi có quyền sửa đổi nội dung Điều khoản này <span className="text-white">bất kỳ lúc nào</span> và sẽ thông báo bằng cách cập nhật trên Website. 
          Việc Quý khách <span className="text-white">tiếp tục sử dụng</span> sau thời điểm cập nhật được hiểu là đồng ý với các sửa đổi đó.
        </p>
      </div>
    ),
  },
  {
    id: "terms-2",
    title: "2. Giải thích Thuật ngữ",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>Trong phạm vi Điều khoản này, các thuật ngữ được hiểu như sau:</p>
        <div className="space-y-3 mt-4">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">Khách hàng</p>
            <p>Cá nhân hoặc tổ chức sử dụng Website để xem thông tin và đặt dịch vụ.</p>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">Nhà cung cấp dịch vụ</p>
            <p>Chủ homestay, đơn vị cho thuê phương tiện, nhà xe, đơn vị tổ chức tour... có dịch vụ được đăng trên Website.</p>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">Dịch vụ trung gian</p>
            <p>Việc Website kết nối Khách hàng với Nhà cung cấp dịch vụ và hỗ trợ quy trình đặt dịch vụ. Website <span className="text-white">không trực tiếp vận hành, sở hữu hay chịu trách nhiệm chất lượng dịch vụ</span>.</p>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">Đặt dịch vụ</p>
            <p>Hành vi Khách hàng xác nhận yêu cầu sử dụng dịch vụ thông qua Website.</p>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">Phí dịch vụ / Hoa hồng</p>
            <p>Khoản phí Website thu theo thỏa thuận giữa Website và Nhà cung cấp dịch vụ.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "terms-3",
    title: "3. Phạm vi Dịch vụ của Website",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          Website <span className="text-white font-medium">chagmihaydi</span> hoạt động dưới vai trò <span className="text-white">trung gian kết nối</span>, 
          hỗ trợ Khách hàng đặt các dịch vụ bao gồm:
        </p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">1.</span>
            <span><span className="text-white font-medium">Dịch vụ lưu trú:</span> Homestay, nhà nghỉ, khách sạn, farmstay,...</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">2.</span>
            <span><span className="text-white font-medium">Dịch vụ vận chuyển:</span> Đặt vé xe khách, xe trung chuyển liên tỉnh,...</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">3.</span>
            <span><span className="text-white font-medium">Dịch vụ tour du lịch & trekking:</span> Chúng tôi chỉ kết nối Khách hàng với đơn vị tổ chức tour và <span className="text-white">không trực tiếp tổ chức</span> các hoạt động này.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">4.</span>
            <span><span className="text-white font-medium">Dịch vụ thuê xe máy và phương tiện cá nhân.</span></span>
          </li>
        </ul>
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mt-4 space-y-2">
          <p className="text-white font-medium">Chúng tôi:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span><span className="text-white">Không sở hữu</span>, <span className="text-white">không điều hành</span> và <span className="text-white">không trực tiếp cung cấp</span> các dịch vụ trên.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span><span className="text-white">Không chịu trách nhiệm</span> về chất lượng dịch vụ, trải nghiệm thực tế, giá cả hoặc tình trạng sẵn có của dịch vụ do Nhà cung cấp cung cấp.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Có trách nhiệm đảm bảo <span className="text-white">thông tin minh bạch</span>, hỗ trợ Khách hàng trong quá trình <span className="text-white">đặt dịch vụ, thay đổi, hủy và giải quyết khiếu nại</span> theo quy định.</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "terms-4",
    title: "4. Tài khoản Người dùng và Bảo mật",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          <span className="text-white font-medium">4.1.</span> Để sử dụng đầy đủ chức năng của Website, Khách hàng có thể cần tạo tài khoản và cung cấp các thông tin cơ bản bao gồm: 
          họ tên, số điện thoại, email và các thông tin cần thiết khác.
        </p>
        <p className="text-white font-medium">4.2. Khách hàng cam kết:</p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Cung cấp thông tin <span className="text-white">chính xác, đầy đủ và cập nhật</span>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Chịu trách nhiệm bảo mật <span className="text-white">tên đăng nhập và mật khẩu</span> của mình.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Chịu toàn bộ trách nhiệm đối với mọi hoạt động phát sinh từ tài khoản của mình.</span>
          </li>
        </ul>
        <p className="text-white font-medium">4.3. Chúng tôi có quyền <span className="text-amber-400">tạm khóa hoặc chấm dứt tài khoản</span> nếu phát hiện hành vi:</p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-red-400 mt-1">•</span>
            <span>Cung cấp thông tin sai sự thật;</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 mt-1">•</span>
            <span>Vi phạm pháp luật hoặc Điều khoản này;</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 mt-1">•</span>
            <span>Gây ảnh hưởng đến hệ thống, quyền lợi người dùng khác hoặc uy tín của Website.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "terms-5",
    title: "5. Quy trình Đặt Dịch vụ",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>Quy trình đặt dịch vụ trên Website được thực hiện như sau:</p>
        <div className="space-y-3 mt-4">
          {[
            "Khách hàng tìm kiếm và lựa chọn dịch vụ phù hợp trên Website.",
            "Khách hàng gửi yêu cầu đặt dịch vụ và cung cấp thông tin cần thiết (ngày, số người, thông tin liên hệ,...).",
            "Website chuyển yêu cầu đến Nhà cung cấp dịch vụ.",
            "Khi Nhà cung cấp xác nhận còn chỗ / còn dịch vụ, Website thông báo lại cho Khách hàng.",
            "Khách hàng thực hiện thanh toán theo hướng dẫn trên Website.",
            "Website gửi xác nhận đặt dịch vụ cho Khách hàng."
          ].map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <span className="text-xs text-emerald-400 font-medium">{index + 1}</span>
              </div>
              <span>{step}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 bg-neutral-900/50 border border-neutral-800 rounded-lg p-3">
          Việc đặt dịch vụ được coi là <span className="text-white font-medium">hoàn tất</span> khi Khách hàng nhận được thông báo xác nhận bằng <span className="text-white">tin nhắn, email hoặc thông báo trên Website</span>.
        </p>
      </div>
    ),
  },
  {
    id: "terms-6",
    title: "6. Giá, Thanh toán và Phí Dịch vụ",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          <span className="text-white font-medium">6.1.</span> Giá dịch vụ được niêm yết trên Website <span className="text-white">do Nhà cung cấp quyết định</span> và có thể thay đổi tùy từng thời điểm.
        </p>
        <p>
          <span className="text-white font-medium">6.2.</span> Khách hàng thanh toán thông qua <span className="text-white">tài khoản ngân hàng hoặc các phương thức thanh toán điện tử</span> mà Website hỗ trợ.
        </p>
        <p>
          <span className="text-white font-medium">6.3.</span> Website có thể <span className="text-white">thu hộ tiền</span> cho Nhà cung cấp dịch vụ theo uỷ quyền. 
          Sau khi Khách hàng hoàn tất thanh toán, Website sẽ <span className="text-white">chuyển trả lại</span> cho Nhà cung cấp theo thỏa thuận <span className="text-white">sau khi trừ phí dịch vụ/hoa hồng</span>.
        </p>
        <p>
          <span className="text-white font-medium">6.4.</span> Website <span className="text-white">không lưu trữ thông tin thẻ thanh toán</span> của Khách hàng (nếu thanh toán qua cổng trung gian).
        </p>
        <p>
          <span className="text-white font-medium">6.5.</span> Website có quyền từ chối hoặc tạm hoãn xử lý giao dịch nếu phát hiện dấu hiệu gian lận, bất thường hoặc rủi ro.
        </p>
      </div>
    ),
  },
  {
    id: "terms-7",
    title: "7. Chính sách Hủy và Hoàn tiền",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          Việc hủy dịch vụ và hoàn tiền được áp dụng theo <span className="text-white font-medium">Chính sách Hủy & Hoàn tiền</span> được công bố riêng trên Website.
        </p>
        <p>
          Trong trường hợp Nhà cung cấp là bên từ chối hoặc không thể thực hiện dịch vụ, Website sẽ <span className="text-white">hỗ trợ Khách hàng làm việc với Nhà cung cấp</span> để 
          xử lý theo quy định hoàn tiền tương ứng.
        </p>
      </div>
    ),
  },
  {
    id: "terms-8",
    title: "8. Quyền và Nghĩa vụ của Khách hàng",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p className="text-white font-medium">8.1. Khách hàng có quyền:</p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Lựa chọn và yêu cầu thông tin về các dịch vụ được đăng trên Website.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Nhận hỗ trợ từ Website trong quá trình đặt dịch vụ, thay đổi, hủy hoặc khiếu nại.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Gửi phản hồi, đánh giá về chất lượng dịch vụ đã sử dụng.</span>
          </li>
        </ul>
        <p className="text-white font-medium mt-4">8.2. Khách hàng có nghĩa vụ:</p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Cung cấp thông tin chính xác, trung thực và cập nhật khi đặt dịch vụ.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Thanh toán đầy đủ và đúng hạn theo hướng dẫn của Website.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Tự chịu trách nhiệm với quyết định lựa chọn dịch vụ và Nhà cung cấp.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Tuân thủ các quy định, hướng dẫn sử dụng dịch vụ từ Nhà cung cấp.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Không thực hiện các hành vi gây ảnh hưởng đến hệ thống, uy tín Website hoặc quyền lợi Nhà cung cấp/Khách hàng khác.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "terms-9",
    title: "9. Quyền và Nghĩa vụ của Nhà cung cấp Dịch vụ",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p className="text-white font-medium">9.1. Nhà cung cấp có quyền:</p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Niêm yết dịch vụ và mức giá theo chính sách riêng.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Nhận thanh toán sau khi Website hoàn tất quy trình thu hộ và đối soát.</span>
          </li>
        </ul>
        <p className="text-white font-medium mt-4">9.2. Nhà cung cấp có nghĩa vụ:</p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Cung cấp thông tin dịch vụ <span className="text-white">chính xác, đầy đủ và minh bạch</span>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Đảm bảo <span className="text-white">chất lượng dịch vụ đúng mô tả</span> trên Website.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Xử lý các yêu cầu thay đổi, hủy hoặc khiếu nại từ Khách hàng.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Không được tự ý từ chối phục vụ nếu không có lý do hợp lệ.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Chịu trách nhiệm pháp lý đối với dịch vụ mình cung cấp.</span>
          </li>
        </ul>
        <p className="mt-4 text-xs italic bg-amber-400/5 border border-amber-400/20 rounded-lg p-3">
          <span className="text-amber-400">Lưu ý:</span> Website <span className="text-white">không chịu trách nhiệm thay cho Nhà cung cấp</span> trong 
          trường hợp dịch vụ không đúng chất lượng, bị thay đổi hoặc phát sinh tranh chấp.
        </p>
      </div>
    ),
  },
  {
    id: "terms-10",
    title: "10. Giới hạn Trách nhiệm của Website",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          <span className="text-white font-medium">10.1.</span> Website chỉ đóng vai trò <span className="text-white">trung gian kết nối</span> giữa Khách hàng và Nhà cung cấp dịch vụ.
          <br/><span className="text-white font-medium">Chúng tôi không sở hữu, vận hành hoặc trực tiếp cung cấp bất kỳ dịch vụ nào.</span>
        </p>
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mt-4">
          <p className="text-white font-medium mb-3">10.2. Chúng tôi KHÔNG chịu trách nhiệm đối với:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">✗</span>
              <span>Chất lượng dịch vụ thực tế do Nhà cung cấp cung cấp;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">✗</span>
              <span>Hành vi, thái độ hoặc năng lực chuyên môn của Nhà cung cấp;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">✗</span>
              <span>Mọi thiệt hại phát sinh từ việc sử dụng dịch vụ của Nhà cung cấp;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">✗</span>
              <span>Các sự kiện bất khả kháng như thiên tai, thời tiết xấu, gián đoạn giao thông, dịch bệnh, sự cố kỹ thuật ngoài tầm kiểm soát,...</span>
            </li>
          </ul>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 mt-4">
          <p className="text-white font-medium mb-3">10.3. Trách nhiệm của Website giới hạn ở việc:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span>Cung cấp thông tin một cách minh bạch theo dữ liệu Nhà cung cấp cung cấp;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">✓</span>
              <span>Hỗ trợ Khách hàng <span className="text-white">liên hệ và làm việc</span> với Nhà cung cấp để giải quyết yêu cầu hoặc khiếu nại.</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "terms-11",
    title: "11. Khiếu nại và Giải quyết Tranh chấp",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          <span className="text-white font-medium">11.1.</span> Khi phát sinh vấn đề, Khách hàng cần liên hệ Website qua kênh hỗ trợ (Email/Hotline) trong thời gian sớm nhất.
        </p>
        <p>
          <span className="text-white font-medium">11.2.</span> Website sẽ <span className="text-white">tiếp nhận và hỗ trợ trao đổi</span> với Nhà cung cấp để 
          giải quyết trên tinh thần hợp tác, minh bạch và tôn trọng quyền lợi các bên.
        </p>
        <p>
          <span className="text-white font-medium">11.3.</span> Trong trường hợp các bên không thể tự giải quyết, tranh chấp sẽ 
          được giải quyết theo <span className="text-white">pháp luật Việt Nam</span> tại <span className="text-white">Tòa án có thẩm quyền</span>.
        </p>
      </div>
    ),
  },
  {
    id: "terms-12",
    title: "12. Hiệu lực và Sửa đổi",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <p>
          Điều khoản này có hiệu lực từ ngày công bố trên Website.
        </p>
        <p>
          Website có quyền điều chỉnh nội dung này và sẽ thông báo bằng cách cập nhật trực tiếp trên Website.
        </p>
      </div>
    ),
  },
  {
    id: "terms-13",
    title: "13. Thông tin Chủ thể Kinh doanh",
    content: (
      <div className="space-y-3 text-sm text-neutral-400">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-neutral-500 text-xs mb-1">Tên hộ kinh doanh</p>
            <p className="text-white font-medium">Đào Văn Đà</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">Mã số thuế</p>
            <p className="text-white">[Đang cập nhật]</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">Người đại diện pháp luật</p>
            <p className="text-white">Đào Văn Đà</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">Địa chỉ đăng ký kinh doanh</p>
            <p className="text-white">[Đang cập nhật]</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">Hotline hỗ trợ</p>
            <p className="text-emerald-400">1900 1234</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs mb-1">Email hỗ trợ</p>
            <p className="text-blue-400">support@chagmihaydi.vn</p>
          </div>
        </div>
      </div>
    ),
  },
];