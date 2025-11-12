type Props = { service: { title: string; location: string | null } };

export default function ServiceBreadcrumb({ service }: Props) {
  return (
    <div className="text-xs text-neutral-500 font-medium mb-4">
      <span className="opacity-70">Việt Nam</span>
      {service.location && (
        <>
          <span className="mx-1.5 text-neutral-700">/</span>
          <span className="opacity-70">{service.location}</span>
        </>
      )}
      <span className="mx-1.5 text-neutral-700">/</span>
      <span className="text-neutral-300">{service.title}</span>
    </div>
  );
}