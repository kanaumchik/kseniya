import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BookingCalendar } from "@/components/BookingCalendar";
import { BookingModal } from "@/components/BookingModal";
import { type BookingSummary, MyBookings } from "@/components/MyBookings";
import { SignOutButton } from "@/components/SignOutButton";
import { prisma } from "@/lib/prisma";
import { getClientSlots } from "@/lib/slots";

export default async function BookingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "USER") {
    redirect("/dashboard");
  }

  const [bookings, slots] = await Promise.all([getUserBookings(session.user.id), getClientSlots()]);
  const availableSlots = slots.filter((slot) => !slot.isBooked);

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <header className="border-b border-[var(--line)] bg-black/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/dashboard">
            <p className="font-serif text-lg uppercase tracking-[0.12em] text-[var(--gold-light)]">Ксения Иванова</p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--muted)]">Мои записи</p>
          </Link>
          <div className="flex items-center gap-3">
            <BookingModal buttonLabel="Записаться" title="Выберите дату и время" variant="nav">
              <BookingCalendar role="USER" slots={slots} timeZone={session.user.timeZone} users={[]} year={new Date().getFullYear()} month={new Date().getMonth() + 1} />
            </BookingModal>
            <Link className="secondary-button px-4 py-2 text-sm" href="/dashboard">
              На главную
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <MyBookings availableSlots={availableSlots} bookings={bookings} timeZone={session.user.timeZone} />
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
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    startsAt: booking.startsAt.toISOString(),
    endsAt: booking.endsAt.toISOString(),
    status: booking.status,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
  }));
}
