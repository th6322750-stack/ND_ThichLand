import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";

interface ProjectCardOverlay2Props {
  slug: string;
  name: string;
  location: string;
  image: string;
  showButton?: boolean;
}

// Dark-gradient-overlay project card — home featured projects and the
// /du-an grid. Title + location sit over a bottom gradient on the full
// photo; /du-an additionally shows a "Xem chi tiết" button.
export function ProjectCardOverlay2({ slug, name, location, image, showButton = false }: ProjectCardOverlay2Props) {
  return (
    <Link
      href={`/du-an/${slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-lg min-[900px]:aspect-[3/4]"
    >
      <Image src={image} alt={name} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-[16px] font-bold text-white min-[900px]:text-[17px]">{name}</h3>
        <p className="mt-1 flex items-center gap-1 text-[12px] text-white/90">
          <Icon name="pin" size={13} className="invert" /> {location}
        </p>
        {showButton && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-white px-3.5 py-2 text-[12px] font-semibold text-[#0C0D0D]">
            Xem chi tiết <Icon name="arrow-right" size={13} />
          </span>
        )}
      </div>
    </Link>
  );
}
