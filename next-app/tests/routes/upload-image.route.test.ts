// @vitest-environment node

import { describe, expect, it } from "vitest";
import { POST as uploadImage } from "@/app/api/upload/image/route";

const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sotG2UAAAAASUVORK5CYII=",
  "base64"
);

describe("POST /api/upload/image", () => {
  it("returns markdown for a valid image upload", async () => {
    const formData = new FormData();
    formData.append(
      "image",
      new File([PNG_BYTES], "pixel.png", { type: "image/png" })
    );

    const response = await uploadImage(
      new Request("http://localhost/api/upload/image", {
        method: "POST",
        body: formData,
      }) as never
    );

    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.markdown).toContain("![pixel]");
    expect(json.url).toContain("data:image/png;base64,");
  });

  it("rejects invalid file types", async () => {
    const formData = new FormData();
    formData.append(
      "image",
      new File(["not an image"], "notes.txt", { type: "text/plain" })
    );

    const response = await uploadImage(
      new Request("http://localhost/api/upload/image", {
        method: "POST",
        body: formData,
      }) as never
    );

    expect(response.status).toBe(400);
  });

  it("rejects oversized uploads", async () => {
    const formData = new FormData();
    formData.append(
      "image",
      new File([Buffer.alloc(5 * 1024 * 1024 + 1)], "huge.png", {
        type: "image/png",
      })
    );

    const response = await uploadImage(
      new Request("http://localhost/api/upload/image", {
        method: "POST",
        body: formData,
      }) as never
    );

    expect(response.status).toBe(400);
  });
});
