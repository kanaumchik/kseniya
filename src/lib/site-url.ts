export const canonicalOrigin = "https://kseniyanaumchik.ru";
export const legacyHost = "naumchik.psy.fvds.ru";

export function getAppOrigin() {
  return process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? canonicalOrigin;
}

export function getAppHomeUrl() {
  return `${getAppOrigin()}/`;
}
