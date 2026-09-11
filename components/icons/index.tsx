import Image from "next/image";

export type IconName =
  | "area"
  | "arrow-right"
  | "bath"
  | "bed"
  | "building"
  | "calendar"
  | "chat"
  | "check"
  | "chevron-right"
  | "clock"
  | "close"
  | "dumbbell"
  | "edit"
  | "facebook"
  | "filter"
  | "grill"
  | "heart"
  | "home"
  | "key"
  | "menu"
  | "phone"
  | "person"
  | "pin"
  | "pool"
  | "quote"
  | "search"
  | "shield"
  | "shop"
  | "sort"
  | "star"
  | "tiktok"
  | "trash"
  | "tree"
  | "upload"
  | "youtube";

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
