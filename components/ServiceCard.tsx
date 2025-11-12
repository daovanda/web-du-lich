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
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      car: "Xe hơi",
      motorbike: "Xe máy",
      stay: "Lưu trú",
      tour: "Tour"
    };
    return labels[type] || type;
  };

  return (
    <Link href={`/services/${service.type}/${service.id}`}>
      <div className="group bg-black border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all duration-300 cursor-pointer flex flex-col h-full">
        {/* Ảnh dịch vụ */}
        <div className="relative w-full aspect-square overflow-hidden bg-neutral-900">
          <img
            src={service.image_url || "/default-image.jpg"}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Gradient overlay subtle */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Badge loại dịch vụ */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-black text-xs font-semibold rounded-md uppercase tracking-wide">
              {getTypeLabel(service.type)}
            </span>
          </div>

          {/* Rating badge */}
          {service.average_rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
              <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white text-xs font-semibold">
                {service.average_rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Bookmark button */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              // Add bookmark logic here
            }}
            className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Nội dung */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Title */}
          <h3 className="font-semibold text-base mb-1.5 line-clamp-2 text-white group-hover:text-neutral-300 transition-colors">
            {service.title}
          </h3>

          {/* Location */}
          {service.location && (
            <div className="flex items-center gap-1 mb-2">
              <svg className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-neutral-500 line-clamp-1">
                {service.location}
              </p>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-3">
            {service.description}
          </p>

          {/* Extra info */}
          {service.extra && (
            <div className="flex flex-wrap gap-2 mb-3">
              {service.extra.duration_days && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs rounded-md">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {service.extra.duration_days} ngày
                </span>
              )}
              {service.extra.guide_name && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs rounded-md">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {service.extra.guide_name}
                </span>
              )}
            </div>
          )}

          {/* Price & Reviews */}
          <div className="mt-auto pt-3 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">
                  {(() => {
                    const price = parseInt(service.price.replace(/\./g, ''));
                    const formattedPrice = new Intl.NumberFormat('vi-VN').format(price);
                    return `${formattedPrice}đ`;
                  })()}
                  <span className="text-neutral-600 text-xs font-normal ml-1">
                    {(() => {
                      switch (service.type) {
                        case 'stay': return '/đêm';
                        case 'tour': return '/người';
                        case 'motorbike': return '/ngày';
                        case 'car': return '/người';
                        default: return '';
                      }
                    })()}
                  </span>
                </p>
              </div>

              {/* View button */}
              <div className="flex items-center gap-1 text-neutral-400 group-hover:text-white transition-colors">
                <span className="text-sm font-medium">Xem</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}