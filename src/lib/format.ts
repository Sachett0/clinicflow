export const currency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const currencyPrecise = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

export const weekdayShort = (iso: string) => {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
};

export const age = (birthDate: string) => {
  const birth = new Date(`${birthDate}T12:00:00`);
  const now = new Date("2026-09-22T12:00:00");
  let years = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) years--;
  return years;
};

/** Mascara o CPF, exibindo apenas os dígitos centrais. */
export const maskCpf = (cpf: string) => cpf.replace(/^\d{3}\.\d{3}/, "***.***");

export const initials = (name: string) =>
  name
    .split(" ")
    .filter((part) => part.length > 2)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const addMinutes = (time: string, minutes: number) => {
  const [h = "0", m = "0"] = time.split(":");
  const total = Number(h) * 60 + Number(m) + minutes;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

export const TODAY = "2026-09-22";
