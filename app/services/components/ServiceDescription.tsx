type Props = {
  description?: string | null;
};

export default function ServiceDescription({ description }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-2 text-lg font-semibold">Mô tả</h3>
      <p className="text-gray-300">
        {description || "Dịch vụ xe chất lượng, thuận tiện cho mọi hành trình."}
      </p>
    </div>
  );
}
