import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { type BookingSummary, MyBookings } from "@/components/MyBookings";
import { ProfileMenu } from "@/components/ProfileMenu";
import { prisma } from "@/lib/prisma";
import { getClientSlots } from "@/lib/slots";

export default async function BookingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role === "ADMIN") {
    redirect("/history");
  }

  const [bookings, slots, user] = await Promise.all([
    getUserBookings(session.user.id),
    getClientSlots(),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    }),
  ]);
  const availableSlots = slots.filter((slot) => !slot.isBooked);

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <header className="border-b border-[var(--line)] bg-black/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/">
            <p className="font-serif text-lg uppercase tracking-[0.12em] text-[var(--gold-light)]">Ксения Наумчик</p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--muted)]">Автор трансформационных программ</p>
          </Link>
          <ProfileMenu name={user?.name ?? session.user.name} role={session.user.role} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 pt-8">
        <Link className="secondary-button inline-flex px-4 py-2 text-sm" href="/">
          На главную
        </Link>
      </div>

      <MyBookings
        availableSlots={availableSlots}
        bookings={bookings}
        currentUser={{ id: session.user.id, name: user?.name ?? session.user.name ?? "Профиль", email: user?.email ?? session.user.email ?? "" }}
        timeZone={session.user.timeZone}
      />
    </main>
  );
}

async function getUserBookings(userId: string): Promise<BookingSummary[]> {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      status: true,
      cancelledAt: true,
      type: true,
      diagnosticNumber: true,
      rescheduledAt: true,
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    startsAt: booking.startsAt.toISOString(),
    endsAt: booking.endsAt.toISOString(),
    status: booking.status,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    type: booking.type,
    diagnosticNumber: booking.diagnosticNumber,
    rescheduledAt: booking.rescheduledAt?.toISOString() ?? null,
  }));
}
