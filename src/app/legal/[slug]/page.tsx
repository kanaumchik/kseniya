import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocumentView } from "@/app/legal/LegalDocumentView";
import { getLegalDocument, legalDocuments } from "@/lib/legal-documents";

type LegalDocumentPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return legalDocuments.map((document) => ({
    slug: document.slug,
  }));
}

export async function generateMetadata({ params }: LegalDocumentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = getLegalDocument(slug);

  if (!document) {
    return {
      title: "Правовая информация",
    };
  }

  return {
    title: `${document.title} | Ксения Наумчик`,
    description: document.revision ?? "Правовая информация сервиса записи на психологические консультации.",
  };
}

export default async function LegalDocumentPage({ params }: LegalDocumentPageProps) {
  const { slug } = await params;
  const document = getLegalDocument(slug);

  if (!document) {
    notFound();
  }

  return <LegalDocumentView document={document} />;
}
