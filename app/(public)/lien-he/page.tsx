import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { ContactForm } from "@/components/public/ContactForm";
import { getZaloHref } from "@/lib/zalo";
import { mapQueryOf, telHref } from "@/lib/data/siteSettings";
import { getPageContentRepository } from "@/lib/server/pageContent/providers";
import { getSiteSettingsRepository } from "@/lib/server/settings/providers";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import { webPageJsonLd } from "@/lib/seoJsonLd";

async function loadContactContent() {
  return (await getPageContentRepository()).get("contact");
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContactContent();
  return buildPageMetadata({
    title: content.metadataTitle,
    description: content.metadataDescription,
    path: "/lien-he",
  });
}

export default async function LienHePage() {
  const [content, settings] = await Promise.all([
    loadContactContent(),
    getSiteSettingsRepository().then((repo) => repo.get()),
  ]);
  const cards = [
    { icon: "phone" as const, label: content.primaryPhoneLabel, value: settings.phonePrimary, href: `tel:${telHref(settings.phonePrimary)}` },
    { icon: "pin" as const, label: content.locationLabel, value: settings.address, href: undefined },
  ];
  const mapQuery = mapQueryOf(settings);

  return (
    <>
      <JsonLd
        id="contact-page-jsonld"
        data={webPageJsonLd({
          type: "ContactPage",
          name: content.metadataTitle,
          description: content.metadataDescription,
          path: "/lien-he",
          mainEntity: { "@id": absoluteUrl("/#organization") },
        })}
      />
      <div className="container-page py-10">
      <div className="grid grid-cols-1 gap-8 rounded-md bg-soft p-8 desktop:grid-cols-2 desktop:items-center">
        <div>
          <h1 className="text-h1-mobile text-ink desktop:text-h1">{content.heroTitle}</h1>
          <p className="mt-3 text-body-lg-mobile text-body desktop:text-body-lg">{content.heroBody}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`tel:${telHref(settings.phonePrimary)}`} className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover">
              <Icon name="phone" size={16} className="invert" /> {content.callButtonLabel} {settings.phonePrimary}
            </a>
            <a href={getZaloHref()} className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-surface">
              <Icon name="chat" size={16} /> {content.zaloButtonLabel}
            </a>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-surface">
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed&hl=vi&z=16`}
            title={content.mapLabel}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
          />
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-sm bg-footer/80 px-3 py-2 text-label text-surface">{content.mapLabel}</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 tablet:grid-cols-3">
        {cards.map((card, index) => (
          <div key={index} className="flex items-center gap-4 rounded-md border border-line p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-soft">
              <Icon name={card.icon} size={20} className="text-primary" />
            </span>
            <div className="min-w-0">
              <p className="text-body text-muted">{card.label}</p>
              {card.href ? <a href={card.href} className="text-h3 text-ink hover:text-primary">{card.value}</a> : <p className="text-h3 text-ink">{card.value}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-md border border-line p-8">
        <h2 className="text-h2-mobile text-ink desktop:text-h2">{content.formTitle}</h2>
        <p className="mt-1 text-body text-muted">{content.formDescription}</p>
        <div className="mt-6">
          <ContactForm
            nameLabel={content.formNameLabel}
            phoneLabel={content.formPhoneLabel}
            needLabel={content.formNeedLabel}
            needPlaceholder={content.formNeedPlaceholder}
            areaLabel={content.formAreaLabel}
            areaPlaceholder={content.formAreaPlaceholder}
            messageLabel={content.formMessageLabel}
            submitLabel={content.formSubmitLabel}
            submittingLabel={content.formSubmittingLabel}
            nameRequiredError={content.formNameRequiredError}
            phoneRequiredError={content.formPhoneRequiredError}
            successMessage={content.formSuccessMessage}
          />
        </div>
      </div>
      </div>
    </>
  );
}
