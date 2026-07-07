import { logoutAction } from "@/app/actions";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className = "secondary-button px-4 py-2 text-sm" }: SignOutButtonProps) {
  return (
    <form action={logoutAction}>
      <button className={className} type="submit">
        Выйти
      </button>
    </form>
  );
}
