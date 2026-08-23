import type { CvContact } from "@/data/types";

const icons: Record<CvContact["type"], string> = {
  phone:
    "M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.25 1.01l-2.2 2.22z",
  email:
    "M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  linkedin:
    "M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 6.8h-1.9c-.2-.8-.5-1.6-.9-2.3a8 8 0 012.8 2.3zM12 4.1c.6.8 1 1.7 1.3 2.7h-2.6c.3-1 .7-1.9 1.3-2.7zM4.3 14a8.2 8.2 0 010-4h2.2a16 16 0 000 4H4.3zm1.1 2h1.9c.2.8.5 1.6.9 2.3A8 8 0 015.4 16zm1.9-8H5.4a8 8 0 012.8-2.3c-.4.7-.7 1.5-.9 2.3zM12 19.9c-.6-.8-1-1.7-1.3-2.7h2.6c-.3 1-.7 1.9-1.3 2.7zm1.7-4.7h-3.4a14 14 0 010-4h3.4a14 14 0 010 4zm.7 4.1c.4-.7.7-1.5.9-2.3h1.9a8 8 0 01-2.8 2.3zm1.1-4.3a16 16 0 000-4h2.2a8.2 8.2 0 010 4h-2.2z",
  country:
    "M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z",
};

export function CvContactCard({ type, label, value }: CvContact) {
  return (
    <div className="flex items-stretch">
      <div className="flex w-[11mm] shrink-0 items-center justify-center bg-mustard">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d={icons[type]} />
        </svg>
      </div>
      <div className="flex-1 bg-ink px-3 py-2">
        <p className="font-head text-[10px] leading-tight font-bold tracking-[0.22em] text-white">
          {label}
        </p>
        <p
          className={`mt-px text-[10.5px] leading-tight text-gray-200 ${
            type === "phone" ? "tracking-[0.12em]" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
