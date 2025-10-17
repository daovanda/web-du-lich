type NearbyLocation = {
  id: string;
  name: string;
  type: string | null;
  region: string | null;
  image_url: string | null;
};

type Props = {
  nearby: NearbyLocation[];
  location: string | null;
};

export default function ServiceNearby({ nearby, location }: Props) {
  if (!nearby?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-3 text-lg font-semibold">Trong khu vực</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {nearby.map((l) => (
          <div
            key={l.id}
            className="overflow-hidden rounded-xl border border-white/10 bg-black/30 hover:bg-white/10 transition"
          >
            <img
              src={l.image_url || "/anh1.jpeg"}
              alt={l.name}
              className="h-40 w-full object-cover"
            />
            <div className="p-3">
              <div className="text-xs uppercase text-gray-400">
                {l.type} • {l.region || location}
              </div>
              <div className="mt-1 font-medium">{l.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
