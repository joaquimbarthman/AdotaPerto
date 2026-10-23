const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const PROFILE_ADDRESS_PATH = "/perfil#endereco";
export const PROFILE_ADDRESS_MESSAGE = "Complete seu endereço no perfil antes de continuar.";

type ProfileAddress = {
  zipCode?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
};

type AddressProfile = ProfileAddress & {
  accountType?: "PERSON" | "ORGANIZATION";
  primaryOrganization?: (ProfileAddress & { postalCode?: string | null }) | null;
};

export type ProfileAddressStatus = { complete: boolean; accountType: "PERSON" | "ORGANIZATION"; path: string; message: string };

export function hasCompleteProfileAddress(profile: ProfileAddress) {
  return [profile.zipCode, profile.street, profile.city, profile.state].every(
    (value) => Boolean(value?.trim()),
  );
}

export async function fetchProfileAddressCompletion(signal?: AbortSignal) {
  return (await fetchProfileAddressStatus(signal)).complete;
}

export async function fetchProfileAddressStatus(signal?: AbortSignal): Promise<ProfileAddressStatus> {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    credentials: "include",
    signal,
  });
  if (!response.ok) {
    throw new Error("Não foi possível verificar o endereço do perfil.");
  }
  const profile = await response.json() as AddressProfile;
  const organizationAccount = profile.accountType === "ORGANIZATION";
  const address = organizationAccount ? {
    zipCode: profile.primaryOrganization?.postalCode,
    street: profile.primaryOrganization?.street,
    city: profile.primaryOrganization?.city,
    state: profile.primaryOrganization?.state,
  } : profile;
  return {
    complete: hasCompleteProfileAddress(address),
    accountType: organizationAccount ? "ORGANIZATION" : "PERSON",
    path: organizationAccount ? "/perfil#endereco-organizacao" : PROFILE_ADDRESS_PATH,
    message: organizationAccount ? "Complete o endereço da ONG antes de continuar." : PROFILE_ADDRESS_MESSAGE,
  };
}
