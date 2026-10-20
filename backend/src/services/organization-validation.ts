export function isValidCnpj(value: string) {
  if (!/^\d{14}$/.test(value) || /^(\d)\1+$/.test(value)) return false;
  const digit = (size: number) => { let sum = 0, weight = size - 7; for (let i = 0; i < size; i += 1) { sum += Number(value[i]) * weight--; if (weight === 1) weight = 9; } const result = 11 - sum % 11; return result > 9 ? 0 : result; };
  return digit(12) === Number(value[12]) && digit(13) === Number(value[13]);
}

export function organizationSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "organizacao";
}
