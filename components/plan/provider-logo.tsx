import Image from "next/image";
import { providerLogo } from "@/lib/catalogue";

const SIZES = {
  md: { box: "size-[72px]", img: 52 },
  sm: { box: "size-12", img: 36 },
};

/** "Masdar City Free Zone" → "MC"; single words → first letter. */
function initials(name: string): string {
  const words = name.replace(/\(.*?\)/g, "").split(/[\s—-]+/).filter((w) => /^[A-Za-z]/.test(w));
  return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : (words[0]?.[0] ?? "?").toUpperCase();
}

/**
 * Square logo tile. The provider's name sits next to it, so the image is
 * decorative (empty alt). Falls back to initials when no logo is on file.
 */
export function ProviderLogo({ name, size = "md" }: { name: string; size?: keyof typeof SIZES }) {
  const logo = providerLogo(name);
  const s = SIZES[size];
  return (
    <span
      className={`flex flex-none items-center justify-center border border-rule ${s.box} ${logo?.onDark ? "bg-ink" : "bg-white"}`}
    >
      {logo ? (
        <Image src={logo.src} alt="" width={s.img} height={s.img} className="object-contain" />
      ) : (
        <span aria-hidden className="font-mono text-sm font-semibold text-ink-soft">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
