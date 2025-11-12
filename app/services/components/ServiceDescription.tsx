type Props = {
  description?: string | null;
};

export default function ServiceDescription({ description }: Props) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-black p-5">
      <h3 className="mb-3 text-lg font-semibold text-white">Mô tả</h3>
      <p className="text-sm text-neutral-400 leading-relaxed">
        {description || "Dịch vụ xe chất lượng, thuận tiện cho mọi hành trình."}
      </p>
    </div>
  );
}