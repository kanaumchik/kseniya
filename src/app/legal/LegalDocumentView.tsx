import Link from "next/link";
import type { ReactNode } from "react";
import { legalDocuments, type LegalDocument } from "@/lib/legal-documents";

type LegalDocumentViewProps = {
  document: LegalDocument;
};

export function LegalDocumentView({ document }: LegalDocumentViewProps) {
  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#17130f]">
      <header className="border-b border-[#ded5c5] bg-[#fbfaf7]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 lg:px-8">
          <Link href="/" className="font-serif text-xl uppercase text-[#7b5b22]">
            Ксения Наумчик
          </Link>
          <Link className="rounded-md border border-[#c8b58f] px-4 py-2 text-sm font-semibold text-[#5a421c] transition hover:bg-[#efe4d1]" href="/">
            На главную
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[20rem_1fr] lg:px-8 lg:py-12">
        <aside className="h-fit rounded-md border border-[#dfd4c2] bg-white p-5 shadow-[0_18px_50px_rgba(82,63,35,0.08)] lg:sticky lg:top-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a8a73]">Документы</p>
          <nav className="mt-5 grid gap-1">
            {legalDocuments.map((item) => {
              const isActive = item.slug === document.slug;

              return (
                <Link
                  className={`rounded-md px-3 py-2.5 text-sm font-semibold leading-5 transition ${
                    isActive ? "bg-[#f0e4cd] text-[#4c3512]" : "text-[#44382b] hover:bg-[#f7f2e9] hover:text-[#4c3512]"
                  }`}
                  href={`/legal/${item.slug}`}
                  key={item.slug}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        <article className="rounded-md border border-[#dfd4c2] bg-white px-5 py-7 shadow-[0_18px_55px_rgba(82,63,35,0.08)] sm:px-8 lg:px-12 lg:py-11">
          <div className="mb-8">
            {document.revision ? <p className="text-sm font-semibold text-[#9b722c]">{document.revision}</p> : null}
            <h1 className="mt-4 max-w-4xl font-serif text-3xl leading-tight text-[#16130f] sm:text-4xl lg:text-5xl">{document.title}</h1>
          </div>

          <div className="grid gap-4 text-base leading-8 text-[#2d261d]">{renderDocument(document.body)}</div>
        </article>
      </div>
    </main>
  );
}

function renderDocument(body: string) {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line, index) => {
      if (!line) {
        return false;
      }

      return !(index === 0 && line.startsWith("# "));
    })
    .map((line, index) => {
      if (line.startsWith("## ")) {
        return (
          <h2 className="mt-7 font-serif text-2xl leading-snug text-[#18130e]" key={`${line}-${index}`}>
            {renderInline(line.replace(/^##\s+/, ""))}
          </h2>
        );
      }

      if (line.startsWith("# ")) {
        return (
          <h2 className="mt-7 font-serif text-2xl leading-snug text-[#18130e]" key={`${line}-${index}`}>
            {renderInline(line.replace(/^#\s+/, ""))}
          </h2>
        );
      }

      return (
        <p className="max-w-4xl" key={`${line}-${index}`}>
          {renderInline(line)}
        </p>
      );
    });
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong className="font-semibold text-[#16130f]" key={`${part}-${index}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}
