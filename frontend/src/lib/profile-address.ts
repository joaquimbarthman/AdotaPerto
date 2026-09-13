const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const PROFILE_ADDRESS_PATH = "/perfil#endereco";
export const PROFILE_ADDRESS_MESSAGE =
  "Complete seu endereço no perfil antes de continuar.";

type ProfileAddress = {
  zipCode?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
};

export function hasCompleteProfileAddress(profile: ProfileAddress) {
  return [profile.zipCode, profile.street, profile.city, profile.state].every(
    (value) => Boolean(value?.trim()),
  );
}

export async function fetchProfileAddressCompletion(signal?: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    credentials: "include",
    signal,
  });
  if (!response.ok) {
    throw new Error("Não foi possível verificar o endereço do perfil.");
  }
  return hasCompleteProfileAddress(await response.json());
}
