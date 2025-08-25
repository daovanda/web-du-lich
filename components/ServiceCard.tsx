import Link from "next/link";

type Props = {
  service: {
    id: string;
    title: string;
    description: string;
    image_url: string; // Sửa từ image thành image_url để khớp dữ liệu Supabase
    price: string;
    type: "car" | "motorbike" | "stay";
  };
};

export default function ServiceCard({ service }: Props) {
  return (
    <Link href={`/services/${service.type}/${service.id}`}>
      <div className="bg-white rounded-xl shadow p-4 transition-transform hover:scale-105 cursor-pointer">
        <img
          src={service.image_url} // Sửa từ service.image thành service.image_url
          alt={service.title}
          className="rounded-md w-full h-40 sm:h-48 object-cover mb-3"
        />
        <h2 className="font-semibold text-base sm:text-lg">{service.title}</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          {service.description}
        </p>
        <p className="mt-2 text-blue-600 font-bold text-sm sm:text-base">
          {service.price}
        </p>
      </div>
    </Link>
  );
}
