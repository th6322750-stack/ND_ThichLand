import Image from "next/image";

export type IconName =
  | "area"
  | "bed"
  | "building"
  | "chat"
  | "check"
  | "edit"
  | "filter"
  | "home"
  | "menu"
  | "phone"
  | "pin"
  | "search"
  | "trash"
  | "upload";

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size = 20 }: IconProps) {
  return (
    <Image
      src={`/assets/icons/${name}.svg`}
      alt=""
      role="presentation"
      width={size}
      height={size}
      className={className}
      unoptimized
    />
  );
}
