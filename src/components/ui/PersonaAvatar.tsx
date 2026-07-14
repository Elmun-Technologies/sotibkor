import type { PersonaKey } from "@/lib/content";

/**
 * Illyustrativ persona avatarlari — real foto EMAS (image-gen kaliti yo'q),
 * lekin harf o'rniga har xarakterga mos gradient + belgi bilan "jonli"
 * ko'rinadi (CloseMe-solishtiruv #2). Har persona o'z rangi/belgisi bilan
 * darrov tanilsin uchun butun ilova bo'ylab (qongiroq katalogi, trener
 * ekrani) shu bir komponentdan foydalaniladi.
 */

const GRADIENT: Record<PersonaKey, [string, string]> = {
  qimmatchi: ["#f2b23a", "#b8760a"],
  shubhali: ["#a78bfa", "#6d28d9"],
  bandman: ["#38bdf8", "#0e7490"],
  bilagon: ["#2ee27f", "#0f7a44"],
  "yumshoq-lekin-olmaydi": ["#f472b6", "#be185d"],
};

function Glyph({ persona }: { persona: PersonaKey }) {
  switch (persona) {
    case "qimmatchi":
      // Tanga — narxga qattiq qaraydigan mijoz.
      return (
        <>
          <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.6" />
          <path
            d="M12 8.3v7.4M9.8 9.9c0-1 .9-1.7 2.2-1.7 1.4 0 2.3.7 2.3 1.6 0 2.2-4.5 1-4.5 3.2 0 .9 1 1.6 2.3 1.6s2.2-.7 2.2-1.7"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </>
      );
    case "shubhali":
      // Katta ko'zoynak — hammaga shubha bilan qaraydi.
      return (
        <>
          <circle cx="8.6" cy="12.5" r="3.1" stroke="white" strokeWidth="1.6" />
          <circle
            cx="15.4"
            cy="12.5"
            r="3.1"
            stroke="white"
            strokeWidth="1.6"
          />
          <path d="M11.5 12h1" stroke="white" strokeWidth="1.6" />
          <path
            d="M5.5 11.4c0-1.4.6-2.2 1.4-2.2M18.5 11.4c0-1.4-.6-2.2-1.4-2.2"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </>
      );
    case "bandman":
      // Soat — hech qachon vaqti yo'q.
      return (
        <>
          <circle cx="12" cy="12.6" r="6.4" stroke="white" strokeWidth="1.6" />
          <path
            d="M12 9v3.8l2.6 1.6"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 5.6h4"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </>
      );
    case "bilagon":
      // Bitiruv qalpog'i — "bu sohani men bilaman" havoskori.
      return (
        <path
          d="M12 6.6 4.5 10l7.5 3.4 6-2.7v4.3M8.2 11.6v3.1c0 1.1 1.7 2 3.8 2s3.8-.9 3.8-2v-3.1"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    case "yumshoq-lekin-olmaydi":
      // Iliq tabassum, yumilgan ko'zlar — rozidek ko'rinadi, aslida qochadi.
      return (
        <>
          <path
            d="M8 12.4c0 .9.6 1.4 1.1.5M13 12.9c0 .9.6 1.4 1.1.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M8 15.4c1.1 1.3 5.9 1.3 7 0"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      );
  }
}

export interface PersonaAvatarProps {
  persona: PersonaKey;
  size?: number;
  className?: string;
}

export function PersonaAvatar({
  persona,
  size = 48,
  className,
}: PersonaAvatarProps) {
  const [from, to] = GRADIENT[persona];
  const gradId = `pa-${persona}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill={`url(#${gradId})`} />
      <Glyph persona={persona} />
    </svg>
  );
}
