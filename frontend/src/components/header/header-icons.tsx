"use client";

export function MobileLoginIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20a6 6 0 0 1 12 0M16 12h6m-2.5-2.5L22 12l-2.5 2.5" />
    </svg>
  );
}

export function MobileNavIcon({
  name,
  active,
}: {
  name: string;
  active: boolean;
}) {
  const common = {
    viewBox: "0 0 24 24",
    className: `size-5 ${active ? "stroke-[2.4]" : ""}`,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "Início")
    return (
      <svg {...common}>
        <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z" />
      </svg>
    );
  if (name === "Explorar")
    return (
      <svg {...common}>
        <path d="M12 21s7-4.2 7-11a7 7 0 1 0-14 0c0 6.8 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  if (name === "Ajudar")
    return (
      <svg {...common}>
        <path d="M20.8 4.8a5.2 5.2 0 0 0-7.4 0L12 6.2l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M4 6.5 9 4l6 2.5L20 4v14l-5 2-6-2.5L4 20Z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </svg>
  );
}

export function HeaderMenuIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "size-4.5 shrink-0",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "heart")
    return (
      <svg {...common}>
        <path d="M20.8 4.7a5.2 5.2 0 0 0-7.4 0L12 6.1l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21l8.8-8.9a5.2 5.2 0 0 0 0-7.4Z" />
      </svg>
    );
  if (name === "bell")
    return (
      <svg {...common}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </svg>
    );
  if (name === "bookmark")
    return (
      <svg {...common}>
        <path d="M6 3h12v18l-6-4-6 4V3Z" />
      </svg>
    );
  if (name === "user")
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  if (name === "users")
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M17 5a3 3 0 0 1 0 6m0 4a5 5 0 0 1 4 5" />
      </svg>
    );
  if (name === "pin")
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  if (name === "lock")
    return (
      <svg {...common}>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  if (name === "admin")
    return (
      <svg {...common}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    </svg>
  );
}
