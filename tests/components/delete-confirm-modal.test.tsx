import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";

function renderModal(overrides: Partial<Parameters<typeof DeleteConfirmModal>[0]> = {}) {
  const defaults = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    documentTitle: "My Document",
  };
  const props = { ...defaults, ...overrides };
  const result = render(<DeleteConfirmModal {...props} />);
  return { ...result, props };
}

describe("DeleteConfirmModal", () => {
  it("does not render when not open", () => {
    renderModal({ isOpen: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders confirmation message when open", () => {
    renderModal();

    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByText("Delete Document")).toBeVisible();
    expect(screen.getByText(/This action cannot be undone/)).toBeVisible();
  });

  it("confirm button triggers deletion callback", async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(props.onConfirm).toHaveBeenCalledOnce();
  });

  it("cancel button closes modal", async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it("escape key closes modal", async () => {
    const user = userEvent.setup();
    const { props } = renderModal();

    await user.keyboard("{Escape}");

    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it("shows document name in confirmation message", () => {
    renderModal({ documentTitle: "README.md" });

    expect(
      screen.getByText(/Are you sure you want to delete "README.md"/)
    ).toBeVisible();
  });
});
