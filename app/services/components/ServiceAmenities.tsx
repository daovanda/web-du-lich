type Props = {
  amenities?: { name: string }[];
};

export default function ServiceAmenities({ amenities }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-3 text-lg font-semibold">Tiện ích chính</h3>
      <ul className="grid grid-cols-2 gap-2 text-sm text-gray-300 md:grid-cols-3">
        {amenities && amenities.length > 0 ? (
          amenities.map((a, i) => <li key={i}>• {a.name}</li>)
        ) : (
          <li>• Không có dữ liệu</li>
        )}
      </ul>
    </div>
  );
}
