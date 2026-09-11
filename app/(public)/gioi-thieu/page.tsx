import type { Metadata } from "next";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { ContactCTA } from "@/components/public/ContactCTA";
import { getPageContentRepository } from "@/lib/server/pageContent/providers";
import { getSiteSettingsRepository } from "@/lib/server/settings/providers";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { webPageJsonLd } from "@/lib/seoJsonLd";

const AREA_GRADIENTS = [
  "from-[#D3D8DD] via-[#B5BEC5] to-[#89949C]",
  "from-[#E6D6CE] via-[#C5AEA1] to-[#9A786A]",
  "from-[#C9D6CC] via-[#9CB09E] to-[#6E8570]",
];

async function loadAboutContent() {
  return (await getPageContentRepository()).get("about");
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadAboutContent();
  return buildPageMetadata({
    title: content.metadataTitle,
    description: content.metadataDescription,
    path: "/gioi-thieu",
    image: content.heroImage,
    imageAlt: content.heroMediaLabel,
  });
}

export default async function GioiThieuPage() {
  const [content, settings] = await Promise.all([
    loadAboutContent(),
    getSiteSettingsRepository().then((repo) => repo.get()),
  ]);

  return (
    <>
      <JsonLd
        id="about-page-jsonld"
        data={webPageJsonLd({
          type: "AboutPage",
          name: content.metadataTitle,
          description: content.metadataDescription,
          path: "/gioi-thieu",
          image: content.heroImage,
        })}
      />
      <section className="v2-reveal bg-soft">
        <div className="container-page grid grid-cols-1 gap-8 py-16 desktop:grid-cols-2 desktop:items-center">
          <div>
            <span className="text-label text-primary">{content.heroEyebrow}</span>
            <h1 className="mt-3 whitespace-pre-line text-h1-mobile text-ink desktop:text-h1">{content.heroTitle}</h1>
            <p className="mt-4 text-body-lg-mobile text-body desktop:text-body-lg">{content.heroBody}</p>
          </div>
          <div className="relative flex aspect-[4/3] items-end overflow-hidden rounded-md bg-gradient-to-br from-[#E6D6CE] via-[#C5AEA1] to-[#9A786A] p-4">
            {content.heroImage && (
              <Image src={content.heroImage} alt={content.heroMediaLabel} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" unoptimized loading="eager" />
            )}
            <span className="relative z-10 text-label text-surface/90 drop-shadow-sm">{content.heroMediaLabel}</span>
          </div>
        </div>
      </section>

      <section className="v2-reveal container-page py-16">
        <span className="text-label text-primary">{content.statsEyebrow}</span>
        <h2 className="mt-2 text-h2-mobile text-ink desktop:text-h2">{content.statsTitle}</h2>
        <p className="mt-1 text-body text-muted">{content.statsDescription}</p>
        <div className="mt-8 grid grid-cols-2 gap-4 desktop:grid-cols-4">
          {content.stats.map((stat, index) => (
            <div key={index} className="rounded-md border border-line p-6">
              <p className="text-h2-mobile text-ink desktop:text-h2">{stat.value}</p>
              <p className="mt-1 text-body text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="v2-reveal container-page py-16">
        <span className="text-label text-primary">{content.valuesEyebrow}</span>
        <h2 className="mt-2 text-h2-mobile text-ink desktop:text-h2">{content.valuesTitle}</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-3">
          {content.values.map((value, index) => (
            <div key={index} className="rounded-md bg-soft p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
                <Icon name="check" size={18} className="text-primary" />
              </span>
              <h3 className="mt-4 text-h3 text-ink">{value.title}</h3>
              <p className="mt-2 text-body text-muted">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="v2-reveal container-page py-16">
        <span className="text-label text-primary">{content.areasEyebrow}</span>
        <h2 className="mt-2 text-h2-mobile text-ink desktop:text-h2">{content.areasTitle}</h2>
        <p className="mt-1 text-body text-muted">{content.areasDescription}</p>
        <div className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-3">
          {content.areas.map((area, index) => (
            <div key={index}>
              <div className={`relative flex aspect-[4/3] items-end overflow-hidden rounded-md bg-gradient-to-br p-4 ${AREA_GRADIENTS[index] ?? AREA_GRADIENTS[0]}`}>
                {area.image && <Image src={area.image} alt={area.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" unoptimized />}
                <span className="relative z-10 text-label text-surface/90 drop-shadow-sm">{area.title}</span>
              </div>
              <h3 className="mt-4 text-h3 text-ink">{area.title}</h3>
              <p className="mt-1 text-body text-muted">{area.description}</p>
            </div>
          ))}
        </div>
      </section>

      <ContactCTA
        title={content.ctaTitle}
        subtitle={content.ctaSubtitle}
        callLabel={content.ctaCallLabel}
        zaloLabel={content.ctaZaloLabel}
        phone={settings.phonePrimary}
      />
    </>
  );
}
