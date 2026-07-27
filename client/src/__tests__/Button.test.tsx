import { Button } from "@/components/ui/button";
import { render, screen } from "@testing-library/react";

describe("Button Component Testing", () => {
  it("should render the button with correct text", () => {
    // ১. ভার্চুয়াল স্ক্রিনে বাটনটি রেন্ডার করা হচ্ছে
    render(<Button>Click Me</Button>);

    // ২. DOM থেকে বাটনটি খুঁজে বের করা হচ্ছে (যার নাম "Click Me")
    const buttonElement = screen.getByRole("button", { name: /click me/i });

    // ৩. যাচাই করা (Assertion): বাটনটি স্ক্রিনে সঠিকভাবে দেখা যাচ্ছে কিনা
    expect(buttonElement).toBeInTheDocument();
  });
});
