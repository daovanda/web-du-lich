type Props = {
  address: string;
};

export default function ServiceMap({ address }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-2 text-lg font-semibold">Bản đồ hehehe</h3>
      <iframe
        title="map"
        className="h-72 w-full rounded-xl"
        loading="lazy"
        src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
      />
    </div>
  );
}
