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
    <div className="rounded-xl border border-neutral-800 bg-black p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">Trong khu vực</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {nearby.map((l) => (
          <div
            key={l.id}
            className="group overflow-hidden rounded-xl border border-neutral-800 bg-black hover:border-neutral-700 transition-all cursor-pointer"
          >
            <div className="relative aspect-video overflow-hidden bg-neutral-900">
              <img
                src={l.image_url || "/anh1.jpeg"}
                alt={l.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
            <div className="p-3">
              <div className="text-xs uppercase text-neutral-500 font-semibold tracking-wide mb-1">
                {l.type} • {l.region || location}
              </div>
              <div className="text-sm font-medium text-white line-clamp-1">{l.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}