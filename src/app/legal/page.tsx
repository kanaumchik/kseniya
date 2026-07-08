import { redirect } from "next/navigation";
import { legalDocuments } from "@/lib/legal-documents";

export default function LegalPage() {
  redirect(`/legal/${legalDocuments[0].slug}`);
}
