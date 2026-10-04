import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const shared = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function EmailIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

export function UpworkIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16V8M8.5 11.5 12 8l3.5 3.5" />
    </svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 11v5M8 8v.01M12 16v-3.2c0-1.1.9-1.8 1.8-1.8 1 0 1.7.8 1.7 1.8V16" />
    </svg>
  );
}

export function GithubIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <path d="M7 8 5 4l3 2.2M17 8l2-4-3 2.2" />
      <circle cx="12" cy="13" r="7" />
      <path d="M9 14c.6.8 1.6 1.2 3 1.2s2.4-.4 3-1.2" />
    </svg>
  );
}
