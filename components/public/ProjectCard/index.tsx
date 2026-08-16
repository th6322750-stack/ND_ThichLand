import Image from "next/image";
import Link from "next/link";
import type { ProjectListing, ProjectStatus } from "@/lib/types";
import { projectStatusLabel } from "@/lib/projectStatus";
import { firstMedia, PROJECT_PLACEHOLDER } from "@/lib/media";
import { Icon } from "@/components/icons";

interface ProjectCardProps {
  project: ProjectListing;
  selected?: boolean;
}

const STATUS_STYLES: Record<ProjectStatus, string> = {
  "Đang triển khai": "bg-gold text-surface",
  "Tiêu biểu": "bg-primary text-surface",
  "Đã hoàn thành": "bg-success text-surface",
};
// Unknown status keeps a neutral chip rather than borrowing another
// status's colour, which would read as a claim about the project.
const UNKNOWN_STATUS_STYLE = "bg-soft text-muted";

export function ProjectCard({ project, selected = false }: ProjectCardProps) {
  return (
    <Link
      href={`/du-an/${project.slug}`}
      className={`block overflow-hidden rounded-md border bg-surface transition-colors duration-fast hover:border-primary ${
        selected ? "border-2 border-primary" : "border border-line"
      }`}
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={firstMedia(project.media, PROJECT_PLACEHOLDER)}
          alt={project.name}
          fill
          className="object-cover"
          unoptimized
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-label ${
            project.status ? STATUS_STYLES[project.status] : UNKNOWN_STATUS_STYLE
          }`}
        >
          {projectStatusLabel(project.status)}
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
