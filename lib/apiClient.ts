export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = RequestInit & {
  fallbackMessage?: string;
};

export async function apiRequest<T>(
  input: string,
  options: RequestOptions = {}
): Promise<T> {
  const { fallbackMessage = "Đã có lỗi xảy ra", ...init } = options;

  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type");
  const payload =
    contentType && contentType.includes("application/json")
      ? await response.json()
      : null;

  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string"
        ? payload.error
        : fallbackMessage;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

type FormRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  fallbackMessage?: string;
  formData: FormData;
};

export async function apiFormRequest<T>(
  input: string,
  options: FormRequestOptions
): Promise<T> {
  const { fallbackMessage = "Đã có lỗi xảy ra", formData, ...init } = options;

  const response = await fetch(input, {
    ...init,
    body: formData,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type");
  const payload =
    contentType && contentType.includes("application/json")
      ? await response.json()
      : null;

  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string"
        ? payload.error
        : fallbackMessage;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
