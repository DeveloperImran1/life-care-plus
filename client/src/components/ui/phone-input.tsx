"use client";

import { useState } from "react";
import PhoneInput, { Value } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./phone-input.css";

interface PhoneInputFieldProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function PhoneInputField({
  name,
  defaultValue = "",
  placeholder = "+880 1712-345678",
  disabled = false,
}: PhoneInputFieldProps) {
  const [value, setValue] = useState<Value | undefined>(
    defaultValue ? (defaultValue as Value) : undefined
  );

  return (
    <div className="relative">
      <PhoneInput
        international
        defaultCountry="BD"
        value={value}
        onChange={setValue}
        placeholder={placeholder}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 PhoneInputRoot"
      />
      {/* Hidden input to pass value to FormData in native forms */}
      <input type="hidden" name={name} value={value || ""} />
    </div>
  );
}
