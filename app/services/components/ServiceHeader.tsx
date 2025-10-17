type Props = {
  service: {
    title: string;
    average_rating: number;
    reviews_count: number;
    location?: string | null;
  };
};

export default function ServiceHeader({ service }: Props) {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">{service.title}</h1>
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-600 px-2 py-1 font-semibold text-white">
            {service.average_rating?.toFixed(1) || "0.0"}
          </span>
          <span>{service.reviews_count} đánh giá</span>
        </div>
        <span>• Xe di chuyển</span>
        {service.location && <span>• {service.location}</span>}
      </div>
    </div>
  );
}
