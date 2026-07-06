import { logoutAction } from "@/app/actions";

export function SignOutButton() {
  return (
    <form action={logoutAction}>
      <button className="secondary-button px-4 py-2 text-sm" type="submit">
        Выйти
      </button>
    </form>
  );
}
