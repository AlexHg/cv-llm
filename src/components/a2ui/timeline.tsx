"use client";

import { asString } from "@/components/a2ui/coerce";

type TimelineItem = {
  title: string;
  subtitle?: string;
  period: string;
  description?: string;
};

export function Timeline({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: TimelineItem[];
}) {
  const entries = (Array.isArray(items) ? items : [])
    .map((item) => ({
      title: asString(item?.title),
      subtitle: asString(item?.subtitle),
      period: asString(item?.period),
      description: asString(item?.description),
    }))
    .filter((item) => item.title || item.period);

  return (
    <section className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="font-head text-sm font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-body">{description}</p>
      ) : null}

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-soft">No hay hitos para mostrar.</p>
      ) : (
        <ol className="mt-4 space-y-4">
          {entries.map((item, index) => (
            <li
              key={`${item.title}-${item.period}-${index}`}
              className="relative pl-6"
            >
              {index < entries.length - 1 ? (
                <span className="absolute top-3.5 left-[4.5px] h-[calc(100%+8px)] w-px bg-zinc-200" />
              ) : null}
              <span className="absolute top-1.5 left-0 h-2.5 w-2.5 rounded-full bg-mustard" />
              <p className="font-head text-[13px] font-bold text-ink">
                {item.title}
              </p>
              {item.subtitle || item.period ? (
                <p className="mt-0.5 text-[12px]">
                  {item.subtitle ? (
                    <span className="text-mustard">{item.subtitle}</span>
                  ) : null}
                  {item.subtitle && item.period ? (
                    <span className="mx-1 text-soft">|</span>
                  ) : null}
                  {item.period ? (
                    <span className="tracking-[0.04em] text-soft">
                      {item.period}
                    </span>
                  ) : null}
                </p>
              ) : null}
              {item.description ? (
                <p className="mt-1 text-[12px] leading-5 text-body">
                  {item.description}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
