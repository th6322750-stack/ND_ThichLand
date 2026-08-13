import Image from "next/image";
import Link from "next/link";
import type { ProjectListing } from "@/lib/types";
import { Icon } from "@/components/icons";

interface ProjectCardProps {
  project: ProjectListing;
  selected?: boolean;
}

const STATUS_STYLES: Record<ProjectListing["status"], string> = {
  "Đang triển khai": "bg-gold text-surface",
  "Tiêu biểu": "bg-primary text-surface",
  "Đã hoàn thành": "bg-success text-surface",
};

export function ProjectCard({ project, selected = false }: ProjectCardProps) {
  return (
    <Link
      href={`/du-an/${project.slug}`}
      className={`block overflow-hidden rounded-md border bg-surface transition-colors duration-fast hover:border-primary ${
        selected ? "border-2 border-primary" : "border border-line"
      }`}
    >
      <div className="relative aspect-[4/3]">
        <Image src={project.media[0]} alt={project.name} fill className="object-cover" unoptimized />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-label ${STATUS_STYLES[project.status]}`}
        >
          {project.status}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-h3 text-ink">{project.name}</h3>
        <p className="mt-1 inline-flex items-center gap-1 text-body text-muted">
          <Icon name="pin" size={16} /> {project.location} / theo dữ liệu dự án
        </p>
        <span className="mt-3 inline-block text-label text-primary hover:underline">Xem dự án</span>
      </div>
    </Link>
  );
}
