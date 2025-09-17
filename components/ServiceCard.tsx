import Link from "next/link";

type Props = {
  service: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    price: string;
    type: "car" | "motorbike" | "stay";
    location?: string;
  };
};

export default function ServiceCard({ service }: Props) {
  return (
    <Link href={`/services/${service.type}/${service.id}`}>
      <div className="bg-neutral-900 text-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 cursor-pointer flex flex-col">
        {/* Ảnh dịch vụ */}
        <div className="relative w-full h-52 overflow-hidden">
          <img
            src={service.image_url}
            alt={service.title}
            className="w-full h-full object-cover transform hover:scale-105 transition duration-300"
          />
        </div>

        {/* Nội dung */}
        <div className="p-4 flex flex-col flex-grow justify-between">
          <div>
            <h2 className="font-semibold text-lg mb-1 line-clamp-1">
              {service.title}
            </h2>
            {service.location && (
              <p className="text-sm text-gray-400 mb-1 line-clamp-1">
                📍 {service.location}
              </p>
            )}
            <p className="text-sm text-gray-300 line-clamp-2">
              {service.description}
            </p>
          </div>
          <p className="mt-3 text-pink-400 font-semibold">{service.price}</p>
        </div>
      </div>
    </Link>
  );
}
