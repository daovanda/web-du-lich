type Props = { service: { title: string; location: string | null } };

export default function ServiceBreadcrumb({ service }: Props) {
  return (
    <div className="text-sm text-gray-400">
      <span className="opacity-80">Việt Nam</span>
      {service.location && <> &nbsp;/&nbsp; <span>{service.location}</span></>}
      &nbsp;/&nbsp; <span className="text-gray-100">{service.title}</span>
    </div>
  );
}
