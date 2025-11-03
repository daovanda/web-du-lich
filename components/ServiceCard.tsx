import Link from "next/link";

type Props = {
  service: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    price: string;
    type: "car" | "motorbike" | "stay" | "tour";
    location?: string;
    average_rating?: number;
    reviews_count?: number;
    extra?: {
      duration_days?: number;
      guide_name?: string;
    };
  };
};

export default function ServiceCard({ service }: Props) {
  return (
    <Link href={`/services/${service.type}/${service.id}`}>
      <div className="group bg-neutral-900 text-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full border border-neutral-800 hover:border-pink-500/30">
        {/* Ảnh dịch vụ với overlay gradient */}
        <div className="relative w-full h-56 overflow-hidden">
          <img
            src={service.image_url || "/default-image.jpg"}
            alt={service.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent opacity-60"></div>
          
          {/* Badge loại dịch vụ */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-pink-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full uppercase tracking-wide">
              {service.type}
            </span>
          </div>

          {/* Rating badge */}
          {service.average_rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-full">
              <span className="text-yellow-400 text-sm">⭐</span>
              <span className="text-white text-sm font-semibold">
                {service.average_rating.toFixed(1)}
              </span>
              {service.reviews_count && (
                <span className="text-gray-300 text-xs">
                  ({service.reviews_count})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Nội dung */}
        <div className="p-5 flex flex-col flex-grow justify-between">
          <div>
            {/* Title */}
            <h2 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors duration-300">
              {service.title}
            </h2>

            {/* Location */}
            {service.location && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-pink-400">📍</span>
                <p className="text-sm text-gray-300 line-clamp-1">
                  {service.location}
                </p>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
              {service.description}
            </p>

            {/* Extra info for tours */}
            {service.extra && (
              <div className="mt-3 flex flex-wrap gap-2">
                {service.extra.duration_days && (
                  <span className="px-2.5 py-1 bg-neutral-800 text-gray-300 text-xs rounded-lg border border-neutral-700">
                    🕐 {service.extra.duration_days} ngày
                  </span>
                )}
                {service.extra.guide_name && (
                  <span className="px-2.5 py-1 bg-neutral-800 text-gray-300 text-xs rounded-lg border border-neutral-700">
                    👤 {service.extra.guide_name}
                  </span>
                )}
              </div>
            )}
          </div>


          {/* Price và CTA */}
          <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Giá từ</p>
              <p className="text-lg text-pink-400 font-bold leading-tight break-words">
                {(() => {
                  // Loại bỏ dấu . và chuyển thành số
                  const price = parseInt(service.price.replace(/\./g, ''));
                  const formattedPrice = new Intl.NumberFormat('vi-VN').format(price);
                  
                  switch (service.type) {
                    case 'stay':
                      return `${formattedPrice} VND/ngày`;
                    case 'tour':
                      return `${formattedPrice} VND/người`;
                    case 'motorbike':
                      return `${formattedPrice} VND/ngày`;
                    case 'car':
                      return `${formattedPrice} VND/người`;
                    default:
                      return `${formattedPrice} VND`;
                  }
                })()}
              </p>
            </div>
            <div className="flex items-center gap-1 text-pink-400 text-sm font-medium group-hover:gap-2 transition-all duration-300 flex-shrink-0">
              Xem chi tiết
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </div>
          </div>
          </div>
      </div>
    </Link>
  );
}