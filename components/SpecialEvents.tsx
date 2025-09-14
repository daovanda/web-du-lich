"use client";

import Link from "next/link";
import Marquee from "react-fast-marquee";

export default function SpecialEventsMarquee() {
  return (
    <div className="w-full overflow-hidden" style={{ backgroundColor: "#0b0b0b", height: "192px" }}>
      <Marquee gradient={false} speed={50} pauseOnHover={true} loop={0}>
        <div className="px-2 flex-shrink-0">
          <Link href="/events/hue">
            <div className="bg-[#0b0b0b] p-1 rounded-2xl shadow-md">
              <img
                src="/events/hue.jpg"
                alt="Festival Huế"
                className="w-80 h-48 rounded-xl object-cover"
              />
            </div>
          </Link>
        </div>

        <div className="px-2 flex-shrink-0">
          <Link href="/events/nha-trang">
            <div className="bg-[#0b0b0b] p-1 rounded-2xl shadow-md">
              <img
                src="/events/nha-trang.jpg"
                alt="Lễ hội biển Nha Trang"
                className="w-80 h-48 rounded-xl object-cover"
              />
            </div>
          </Link>
        </div>

        <div className="px-2 flex-shrink-0">
          <Link href="/events/da-nang">
            <div className="bg-[#0b0b0b] p-1 rounded-2xl shadow-md">
              <img
                src="/events/da-nang.jpg"
                alt="Pháo hoa Đà Nẵng"
                className="w-80 h-48 rounded-xl object-cover"
              />
            </div>
          </Link>
        </div>

        <div className="px-2 flex-shrink-0">
          <Link href="/events/tay-nguyen">
            <div className="bg-[#0b0b0b] p-1 rounded-2xl shadow-md">
              <img
                src="/events/tay-nguyen.jpg"
                alt="Festival Tây Nguyên"
                className="w-80 h-48 rounded-xl object-cover"
              />
            </div>
          </Link>
        </div>

        <div className="px-2 flex-shrink-0">
          <Link href="/map">
            <div className="bg-[#0b0b0b] p-1 rounded-2xl shadow-md">
              <img
                src="/map-thumbnail.png"
                alt="Bản đồ hành trình"
                className="w-80 h-48 rounded-xl object-cover"
              />
            </div>
          </Link>
        </div>
      </Marquee>
      <style jsx>{`
        .w-full {
          width: 100%;
          overflow-y: hidden;
        }
        @media (max-width: 896px) {
          .w-full {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
}