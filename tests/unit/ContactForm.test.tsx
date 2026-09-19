import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/public/ContactForm";

// submitContactAction reads headers() for IP-based rate limiting — outside
// a real Next.js request context (i.e. in this component test) that throws.
vi.mock("next/headers", () => ({ headers: async () => ({ get: () => null }) }));

describe("ContactForm validation", () => {
  it("moves focus to the first invalid field on submit", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole("button", { name: /gửi yêu cầu/i }));
    expect(screen.getByLabelText(/họ và tên/i)).toHaveFocus();
  });

  it("submits via keyboard (Enter) once required fields are valid", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/họ và tên/i), "Nguyễn Văn A");
    await user.type(screen.getByLabelText(/số điện thoại/i), "0912345678{Enter}");
    expect(await screen.findByText(/đã gửi/i)).toBeInTheDocument();
  });

  it("shows a success state after a valid submission", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/họ và tên/i), "Nguyễn Văn A");
    await user.type(screen.getByLabelText(/số điện thoại/i), "0912345678");
    await user.click(screen.getByRole("button", { name: /gửi yêu cầu/i }));
    expect(await screen.findByText(/đã gửi/i)).toBeInTheDocument();
  });

  it("connects the error message via aria-describedby and focuses the second field when only it is invalid", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/họ và tên/i), "Nguyễn Văn A");
    await user.click(screen.getByRole("button", { name: /gửi yêu cầu/i }));
    const phoneInput = screen.getByLabelText(/số điện thoại/i);
    expect(phoneInput).toHaveFocus();
    expect(phoneInput).toHaveAttribute("aria-invalid", "true");
    const describedBy = phoneInput.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent(/vui lòng nhập số điện thoại/i);
  });

  it("does not crash when submit is clicked repeatedly on an empty form", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    const submit = screen.getByRole("button", { name: /gửi yêu cầu/i });
    await user.click(submit);
    await user.click(submit);
    await user.click(submit);
    expect(screen.getByLabelText(/họ và tên/i)).toHaveFocus();
  });
});
