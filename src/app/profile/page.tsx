import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileForm } from "@/components/ProfileForm";
import { ProfileMenu } from "@/components/ProfileMenu";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      publicId: true,
      name: true,
      gender: true,
      birthDate: true,
      city: true,
      phone: true,
      timeZone: true,
      photoPath: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <header className="border-b border-[var(--line)] bg-black/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/">
            <p className="font-serif text-lg uppercase tracking-[0.12em] text-[var(--gold-light)]">Ксения Наумчик</p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--muted)]">Автор трансформационных программ</p>
          </Link>
          <ProfileMenu name={user.name} role={session.user.role} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 pt-8">
        <Link className="secondary-button inline-flex px-4 py-2 text-sm" href="/">
          На главную
        </Link>
      </div>

      <ProfileForm user={user} />
    </main>
  );
}
