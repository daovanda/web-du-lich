type Props = {
  address: string;
};

export default function ServiceMap({ address }: Props) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-black p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">Bản đồ</h3>
      <div className="overflow-hidden rounded-lg border border-neutral-800">
        <iframe
          title="map"
          className="h-72 w-full"
          loading="lazy"
          src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
        />
      </div>
    </div>
  );
}