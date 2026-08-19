const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function uploadImages(files: File[]) {
  if (files.length === 0) return [];

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch(`${API_BASE_URL}/api/uploads/images`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || "Não foi possível enviar as imagens.");
  }

  return data.urls as string[];
}
