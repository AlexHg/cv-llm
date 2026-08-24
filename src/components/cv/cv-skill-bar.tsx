import {
  citeTargetClass,
  useCited,
} from "@/components/citation/citation-highlight";
import { skillCiteKey } from "@/domain/citation";
import type { CvSkill } from "@/domain/cv";

export function CvSkillBar({ name, level }: CvSkill) {
  const cite = skillCiteKey(name);

  return (
    <div
      data-cite={cite}
      className={`flex items-center justify-between ${citeTargetClass(useCited(cite))}`}
    >
      <span className="flex items-center gap-3 text-[11.5px] tracking-[0.08em] text-soft">
        <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-body" />
        <span className="mt-0">{name}</span>
      </span>
      <span className="flex gap-[5px]">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={`inline-block h-[8px] w-[13px] rounded-[1px] ${
              index < level ? "bg-mustard" : "bg-gray-400"
            }`}
          />
        ))}
      </span>
    </div>
  );
}
