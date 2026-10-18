import type { SVGProps } from "react";

export type IconName =
  | "folder"
  | "relay"
  | "card"
  | "medal"
  | "award"
  | "lock"
  | "eye"
  | "eyeOff"
  | "menu"
  | "close"
  | "arrowRight"
  | "chevronDown"
  | "shield"
  | "scale"
  | "transparency"
  | "check"
  | "alert"
  | "info"
  | "mail"
  | "phone"
  | "clock"
  | "user"
  | "building"
  | "document"
  | "hierarchy"
  | "checkCircle"
  | "arrowLeft"
  | "search"
  | "bell"
  | "more"
  | "filter"
  | "calendar"
  | "users"
  | "clipboard"
  | "truck"
  | "download"
  | "plus"
  | "refresh"
  | "logout"
  | "settings"
  | "home"
  | "chevronRight"
  | "upload"
  | "x"
  | "printer"
  | "fileText"
  | "mapPin";

const paths: Record<IconName, React.ReactNode> = {
  folder: (
    <>
      <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2.4h9A1.5 1.5 0 0 1 21 9.9V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18Z" />
      <path d="M3 11h18" />
    </>
  ),
  relay: (
    <>
      <path d="M7 5h10M7 19h10" />
      <path d="M7 5a2 2 0 1 0 0 .01M17 19a2 2 0 1 0 0 .01" />
      <path d="M7 7v10M17 5v12" />
      <path d="M10.5 12h3" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M2.5 10h19" />
      <path d="M6 14.5h3.5" />
    </>
  ),
  medal: (
    <>
      <path d="M8.4 3h7.2l-2.4 6h-2.4Z" />
      <path d="M10.8 9 8.1 15.4" />
      <path d="M13.2 9l2.7 6.4" />
      <circle cx="12" cy="16.4" r="4.1" />
      <path d="M12 14.6l.6 1.2 1.3.2-.9.9.2 1.3-1.2-.6-1.2.6.2-1.3-.9-.9 1.3-.2Z" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5.2" />
      <path d="M9 13.6 7.6 21l4.4-2.4L16.4 21 15 13.6" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
      <path d="M12 14.4v2.2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M4 4l16 16" />
      <path d="M9.6 5.2A9.7 9.7 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-2.4 3.2" />
      <path d="M6.3 7.6A16.4 16.4 0 0 0 2.5 12s3.5 7 9.5 7a9.2 9.2 0 0 0 3.4-.6" />
      <path d="M10.2 10.4a2.8 2.8 0 0 0 3.8 3.9" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12M18 6 6 18" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4.5 12h14" />
      <path d="M13 6.5 18.5 12 13 17.5" />
    </>
  ),
  chevronDown: (
    <>
      <path d="M6 9.5 12 15l6-5.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.2 5.5 5.6v5.5c0 4 2.7 7.6 6.5 9.7 3.8-2.1 6.5-5.7 6.5-9.7V5.6Z" />
      <path d="M9.2 12.2l2 2 3.6-3.8" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16" />
      <path d="M7 20h10" />
      <path d="M4 8h16" />
      <path d="M4 8l-2 4.5h4ZM20 8l-2 4.5h4Z" />
      <path d="M12 4.2 12 8" />
    </>
  ),
  transparency: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
      <path d="M8.6 11h4.8M11 8.6v4.8" />
    </>
  ),
  check: (
    <>
      <path d="M5 12.8 9.4 17 19 7" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v5" />
      <path d="M12 16.2h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.2" />
      <path d="M12 7.9h.01" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.8 7 8.2 6 8.2-6" />
    </>
  ),
  phone: (
    <>
      <path d="M6.2 3.8h3l1.4 3.6-2 1.4a11 11 0 0 0 5.6 5.6l1.4-2 3.6 1.4v3a1.8 1.8 0 0 1-2 1.8A15.8 15.8 0 0 1 4.4 5.8a1.8 1.8 0 0 1 1.8-2Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.6V12l3.2 2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.2" r="3.7" />
      <path d="M4.8 20c.7-3.7 3.6-6 7.2-6s6.5 2.3 7.2 6" />
    </>
  ),
  building: (
    <>
      <path d="M3.5 9.2 12 4.5l8.5 4.7" />
      <path d="M4.5 9.5h15" />
      <path d="M6.5 10v7M10 10v7M14 10v7M17.5 10v7" />
      <path d="M3.5 19.5h17" />
    </>
  ),
  document: (
    <>
      <path d="M6.5 3.5h7.8l3.7 3.8v12.2a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" />
      <path d="M14 3.7V7.5h3.8" />
      <path d="M8.5 11.5h7M8.5 14.5h7M8.5 17.5h4.5" />
    </>
  ),
  hierarchy: (
    <>
      <rect x="9" y="3.5" width="6" height="5" rx="1" />
      <rect x="3" y="15.5" width="6" height="5" rx="1" />
      <rect x="15" y="15.5" width="6" height="5" rx="1" />
      <path d="M12 8.5v3.5M6 15.5V12h12v3.5" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.2 12.2 2.6 2.6 5-5.3" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M19.5 12h-14" />
      <path d="M11 6.5 5.5 12l5.5 5.5" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9.5a6 6 0 0 0-12 0c0 7-2.5 7-2.5 8h17c0-1-2.5-1-2.5-8Z" />
      <path d="M10 21h4" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  filter: (
    <>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3.5 9h17" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c.4-3.2 2.2-5 5.5-5s5.1 1.8 5.5 5" />
      <path d="M15.2 5.5a3 3 0 0 1 0 5.8M17 15.2c2.2.6 3.4 2.1 3.6 4.8" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4.5" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5M8.5 10h7M8.5 14h7M8.5 18h4" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14.8-3L3 11" />
      <path d="M3 5v6h6M4 13a8 8 0 0 0 14.8 3L21 13" />
      <path d="M21 19v-6h-6" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4H5a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 5 20h9" />
      <path d="M11 12h10M17 8l4 4-4 4" />
    </>
  ),
  settings: (
    <>
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
      <path d="m19.4 15 .1.1a1.6 1.6 0 0 1-2.3 2.3l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a1.6 1.6 0 0 1-3.2 0v-.2a1.6 1.6 0 0 0-2.7-1.1l-.1.1A1.6 1.6 0 0 1 6.1 15l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.2a1.6 1.6 0 0 1 0-3.2h.2a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a1.6 1.6 0 0 1 2.3-2.3l.1.1a1.6 1.6 0 0 0 2.7-1.1v-.2a1.6 1.6 0 0 1 3.2 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a1.6 1.6 0 0 1 2.3 2.3l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.2a1.6 1.6 0 0 1 0 3.2h-.2a1.6 1.6 0 0 0-1.1 2.7Z" />
    </>
  ),
  home: (
    <>
      <path d="m3.5 11.5 8.5-7 8.5 7" />
      <path d="M5.5 10.5v9h13v-9M9.5 19.5v-5h5v5" />
    </>
  ),
  chevronRight: <path d="m9 5 7 7-7 7" />,
  upload: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
    </>
  ),
  x: (
    <>
      <path d="M6 6l12 12M18 6 6 18" />
    </>
  ),
  printer: (
    <>
      <path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <path d="M7 14h10v7H7zM17 12h.01" />
    </>
  ),
  fileText: (
    <>
      <path d="M6 3.5h8l4 4v13H6a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5v4h4M8 12h8M8 16h6" />
    </>
  ),
  mapPin: (
    <>
      <path d="M19 10c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
