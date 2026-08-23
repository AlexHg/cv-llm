"use client";

import { asNumber, asString, clamp } from "@/components/a2ui/coerce";

type RadarPoint = {
  label: string;
  value: number;
};

export function RadarChart({
  title,
  description,
  max = 5,
  data,
}: {
  title: string;
  description?: string;
  max?: number;
  data: RadarPoint[];
}) {
  const maxValue = Math.max(asNumber(max, 5), 1);
  const items = (Array.isArray(data) ? data : [])
    .map((item) => ({
      label: asString(item?.label),
      value: clamp(asNumber(item?.value), 0, maxValue),
    }))
    .filter((item) => item.label);

  const size = 280;
  const center = size / 2;
  const radius = 92;
  const rings = 4;
  const count = items.length;

  function vertex(index: number, magnitude: number) {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    return {
      x: center + magnitude * Math.cos(angle),
      y: center + magnitude * Math.sin(angle),
    };
  }

  const polygon =
    count > 2
      ? items
          .map((item, index) => {
            const point = vertex(index, (item.value / maxValue) * radius);
            return `${point.x},${point.y}`;
          })
          .join(" ")
      : "";

  return (
    <section className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="font-head text-sm font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-body">{description}</p>
      ) : null}

      {count < 3 ? (
        <p className="mt-4 text-sm text-soft">
          Se necesitan al menos 3 habilidades para dibujar el radar.
        </p>
      ) : (
        <div className="mt-3 flex flex-col items-center gap-3">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="h-auto w-full max-w-70"
            role="img"
            aria-label={title}
          >
            {Array.from({ length: rings }, (_, ring) => {
              const magnitude = ((ring + 1) / rings) * radius;
              const points = items
                .map((_, index) => {
                  const point = vertex(index, magnitude);
                  return `${point.x},${point.y}`;
                })
                .join(" ");
              return (
                <polygon
                  key={ring}
                  points={points}
                  fill="none"
                  stroke="#d4d7dc"
                  strokeWidth="1"
                />
              );
            })}

            {items.map((_, index) => {
              const end = vertex(index, radius);
              return (
                <line
                  key={`axis-${index}`}
                  x1={center}
                  y1={center}
                  x2={end.x}
                  y2={end.y}
                  stroke="#d4d7dc"
                  strokeWidth="1"
                />
              );
            })}

            <polygon
              points={polygon}
              fill="color-mix(in srgb, var(--cv-accent) 28%, white)"
              stroke="var(--cv-accent)"
              strokeWidth="2"
            />

            {items.map((item, index) => {
              const point = vertex(index, (item.value / maxValue) * radius);
              return (
                <circle
                  key={`dot-${item.label}`}
                  cx={point.x}
                  cy={point.y}
                  r="3.5"
                  fill="var(--cv-accent)"
                />
              );
            })}

            {items.map((item, index) => {
              const labelPoint = vertex(index, radius + 22);
              return (
                <text
                  key={`label-${item.label}`}
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-ink"
                  fontSize="9"
                  fontFamily="var(--font-head), sans-serif"
                >
                  {item.label}
                </text>
              );
            })}
          </svg>

          <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-body">
            {items.map((item) => (
              <li key={item.label} className="flex justify-between gap-2">
                <span className="truncate">{item.label}</span>
                <span className="shrink-0 tabular-nums text-ink">
                  {item.value}/{maxValue}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
