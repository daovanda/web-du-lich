"use client";

type Props = {
  serviceHistory: any[];
  getStatusColor: (status: string) => string;
};

export default function ServiceHistory({ serviceHistory, getStatusColor }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Lịch sử sử dụng dịch vụ</h2>
      {serviceHistory.length === 0 ? (
        <p className="text-gray-400 text-center">
          Chưa có dịch vụ nào được sử dụng.
        </p>
      ) : (
        <div className="space-y-6">
          {serviceHistory.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900 rounded-xl overflow-hidden shadow hover:shadow-lg transition"
            >
              {item.services?.image_url && (
                <img
                  src={item.services.image_url}
                  alt={item.services.title}
                  className="w-full h-56 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg">{item.services?.title}</h3>
                <p className="text-sm text-gray-400">
                  Loại: {item.services?.type}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleString()} –{" "}
                  <span className={`font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
