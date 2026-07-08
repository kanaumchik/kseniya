export const psychologistTimeZone = "Asia/Yekaterinburg";

export const supportedTimeZones = [
  { value: "Europe/Kaliningrad", label: "GMT+2 Калининград" },
  { value: "Europe/Moscow", label: "GMT+3 Москва, Санкт-Петербург, Казань" },
  { value: "Asia/Samara", label: "GMT+4 Самара, Саратов, Ульяновск" },
  { value: "Asia/Yekaterinburg", label: "GMT+5 Екатеринбург, Челябинск, Уфа" },
  { value: "Asia/Omsk", label: "GMT+6 Омск" },
  { value: "Asia/Novosibirsk", label: "GMT+7 Новосибирск, Красноярск, Барнаул" },
  { value: "Asia/Irkutsk", label: "GMT+8 Иркутск, Улан-Удэ, Братск" },
  { value: "Asia/Yakutsk", label: "GMT+9 Якутск, Чита, Благовещенск" },
  { value: "Asia/Vladivostok", label: "GMT+10 Владивосток, Хабаровск, Комсомольск-на-Амуре" },
  { value: "Asia/Magadan", label: "GMT+11 Южно-Сахалинск, Магадан" },
  { value: "Asia/Kamchatka", label: "GMT+12 Петропавловск-Камчатский, Анадырь" },
] as const;

const cityTimeZones: Record<string, string> = {
  екатеринбург: "Asia/Yekaterinburg",
  челябинск: "Asia/Yekaterinburg",
  уфа: "Asia/Yekaterinburg",
  москва: "Europe/Moscow",
  "санкт-петербург": "Europe/Moscow",
  спб: "Europe/Moscow",
  казань: "Europe/Moscow",
  калининград: "Europe/Kaliningrad",
  самара: "Asia/Samara",
  саратов: "Asia/Samara",
  ульяновск: "Asia/Samara",
  омск: "Asia/Omsk",
  новосибирск: "Asia/Novosibirsk",
  красноярск: "Asia/Krasnoyarsk",
  барнаул: "Asia/Novosibirsk",
  иркутск: "Asia/Irkutsk",
  "улан-удэ": "Asia/Irkutsk",
  братск: "Asia/Irkutsk",
  якутск: "Asia/Yakutsk",
  чита: "Asia/Yakutsk",
  благовещенск: "Asia/Yakutsk",
  владивосток: "Asia/Vladivostok",
  хабаровск: "Asia/Vladivostok",
  "комсомольск-на-амуре": "Asia/Vladivostok",
  магадан: "Asia/Magadan",
  "южно-сахалинск": "Asia/Magadan",
  "петропавловск-камчатский": "Asia/Kamchatka",
  петропавловск: "Asia/Kamchatka",
  анадырь: "Asia/Kamchatka",
};

export function getLocalTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function getTimeZoneForCity(city: string | null | undefined) {
  const normalizedCity = (city ?? "").trim().toLowerCase();

  return cityTimeZones[normalizedCity] ?? psychologistTimeZone;
}

export function formatDateTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

export function formatTimeRange(start: Date, end: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function formatTimeOnly(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

export function formatDateKey(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function makeZonedDate(year: number, month: number, day: number, hour: number, timeZone: string, minute = 0) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = getTimeZoneOffsetMs(utcGuess, timeZone);

  return new Date(utcGuess.getTime() - offset);
}

export function makeZonedDateFromKey(dateKey: string, hour: number, timeZone: string, minute = 0) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return makeZonedDate(year, month, day, hour, timeZone, minute);
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return asUtc - date.getTime();
}
