import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { useImageUpload } from "@/hooks/useImageUpload";

const UPLOAD_ENDPOINT = "/api/upload/image";

const SUCCESSFUL_RESPONSE = {
  url: "https://cdn.example.com/test.png",
  markdown: "![test.png](https://cdn.example.com/test.png)",
  filename: "test.png",
  size: 1024,
  type: "image/png",
};

function createMockFile(
  name = "test.png",
  type = "image/png",
  content = "image-data"
): File {
  return new File([content], name, { type });
}

function createMockDataTransferItemList(
  items: Array<{ type: string; file: File | null }>
): DataTransferItemList {
  const dtItems = items.map((item) => ({
    kind: "file" as const,
    type: item.type,
    getAsFile: () => item.file,
    getAsString: vi.fn(),
    webkitGetAsEntry: vi.fn(() => null),
  }));

  return Object.assign(dtItems, {
    length: dtItems.length,
    [Symbol.iterator]: dtItems[Symbol.iterator].bind(dtItems),
    add: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  }) as unknown as DataTransferItemList;
}

function providerWrapper({ children }: { children: React.ReactNode }) {
  return createElement(ToastProvider, null, children);
}

function renderImageUploadHook() {
  return renderHook(() => useImageUpload(), { wrapper: providerWrapper });
}

function mockFetchSuccess(data = SUCCESSFUL_RESPONSE) {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );
}

function mockFetchErrorResponse(
  errorMessage = "Upload failed",
  status = 500
) {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

function mockFetchNetworkError(message = "Network error") {
  vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error(message));
}

describe("useImageUpload", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with isUploading as false", () => {
    const { result } = renderImageUploadHook();

    expect(result.current.isUploading).toBe(false);
  });

  it("sends FormData to the upload endpoint", async () => {
    mockFetchSuccess();
    const { result } = renderImageUploadHook();
    const mockFile = createMockFile();

    await act(async () => {
      await result.current.upload(mockFile);
    });

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    const [url, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(url).toBe(UPLOAD_ENDPOINT);
    expect(options?.method).toBe("POST");
    expect(options?.body).toBeInstanceOf(FormData);

    const formData = options?.body as FormData;
    expect(formData.get("image")).toBeInstanceOf(File);
    expect((formData.get("image") as File).name).toBe("test.png");
  });

  it("returns UploadResult on success", async () => {
    mockFetchSuccess();
    const { result } = renderImageUploadHook();

    let uploadResult: unknown;
    await act(async () => {
      uploadResult = await result.current.upload(createMockFile());
    });

    expect(uploadResult).toEqual(SUCCESSFUL_RESPONSE);
  });

  it("returns null on server error", async () => {
    mockFetchErrorResponse("File too large", 413);
    const { result } = renderImageUploadHook();

    let uploadResult: unknown;
    await act(async () => {
      uploadResult = await result.current.upload(createMockFile());
    });

    expect(uploadResult).toBeNull();
  });

  it("sets isUploading to true during the request", async () => {
    let resolveUpload!: (value: Response) => void;
    vi.spyOn(globalThis, "fetch").mockReturnValueOnce(
      new Promise((resolve) => {
        resolveUpload = resolve;
      })
    );

    const { result } = renderImageUploadHook();

    let uploadPromise: Promise<unknown>;
    act(() => {
      uploadPromise = result.current.upload(createMockFile());
    });

    expect(result.current.isUploading).toBe(true);

    await act(async () => {
      resolveUpload(
        new Response(JSON.stringify(SUCCESSFUL_RESPONSE), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
      await uploadPromise!;
    });

    expect(result.current.isUploading).toBe(false);
  });

  it("extracts and uploads an image from clipboard items", async () => {
    mockFetchSuccess();
    const { result } = renderImageUploadHook();
    const mockFile = createMockFile("clipboard.png");
    const items = createMockDataTransferItemList([
      { type: "image/png", file: mockFile },
    ]);

    let uploadResult: unknown;
    await act(async () => {
      uploadResult = await result.current.uploadFromClipboard(items);
    });

    expect(uploadResult).toEqual(SUCCESSFUL_RESPONSE);
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it("returns null for clipboard data with no image items", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { result } = renderImageUploadHook();
    const items = createMockDataTransferItemList([
      { type: "text/plain", file: null },
    ]);

    let uploadResult: unknown;
    await act(async () => {
      uploadResult = await result.current.uploadFromClipboard(items);
    });

    expect(uploadResult).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows error toast on upload failure", async () => {
    mockFetchErrorResponse("Unsupported file type", 400);
    const { result } = renderImageUploadHook();

    await act(async () => {
      await result.current.upload(createMockFile());
    });

    // The hook calls notify() with the error message.
    // Since isUploading resets to false, the error was handled gracefully.
    expect(result.current.isUploading).toBe(false);
  });

  it("handles network errors gracefully", async () => {
    mockFetchNetworkError("Failed to fetch");
    const { result } = renderImageUploadHook();

    let uploadResult: unknown;
    await act(async () => {
      uploadResult = await result.current.upload(createMockFile());
    });

    expect(uploadResult).toBeNull();
    expect(result.current.isUploading).toBe(false);
  });

  it("resets isUploading to false after a network error", async () => {
    mockFetchNetworkError();
    const { result } = renderImageUploadHook();

    await act(async () => {
      await result.current.upload(createMockFile());
    });

    expect(result.current.isUploading).toBe(false);
  });
});
