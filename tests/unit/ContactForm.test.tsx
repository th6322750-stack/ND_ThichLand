import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/public/ContactForm";

describe("ContactForm validation", () => {
  it("moves focus to the first invalid field on submit", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole("button", { name: /gửi yêu cầu/i }));
    expect(screen.getByLabelText(/họ và tên/i)).toHaveFocus();
  });

  it("shows a success state after a valid submission", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/họ và tên/i), "Nguyễn Văn A");
    await user.type(screen.getByLabelText(/số điện thoại/i), "0912345678");
    await user.click(screen.getByRole("button", { name: /gửi yêu cầu/i }));
    expect(await screen.findByText(/đã gửi/i)).toBeInTheDocument();
  });
});
