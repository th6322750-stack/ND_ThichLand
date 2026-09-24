import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "@/components/public/FormField";

describe("FormField error state", () => {
  it("associates the error message via aria-describedby", () => {
    render(<FormField label="Số điện thoại" name="phone" error="Vui lòng nhập số điện thoại" />);
    const input = screen.getByLabelText("Số điện thoại");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(screen.getByText("Vui lòng nhập số điện thoại").id).toBe(describedBy);
  });
});
