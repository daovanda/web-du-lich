type Props = {
  amenities?: { name: string }[];
};

export default function ServiceAmenities({ amenities }: Props) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-black p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">Tiện ích chính</h3>
      <ul className="grid grid-cols-2 gap-2.5 text-sm text-neutral-400 md:grid-cols-3">
        {amenities && amenities.length > 0 ? (
          amenities.map((a, i) => (
            <li key={i} className="flex items-center gap-2">
              <svg className="w-1.5 h-1.5 text-neutral-600 flex-shrink-0" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" />
              </svg>
              <span>{a.name}</span>
            </li>
          ))
        ) : (
          <li className="flex items-center gap-2 text-neutral-600">
            <svg className="w-1.5 h-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="4" />
            </svg>
            <span>Không có dữ liệu</span>
          </li>
        )}
      </ul>
    </div>
  );
}