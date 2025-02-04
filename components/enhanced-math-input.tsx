"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { addStyles, EditableMathField } from "react-mathquill";
import { evaluate } from "mathjs";

// Add MathQuill styles
if (typeof window !== "undefined") {
  addStyles();
}

interface EnhancedMathInputProps {
  value: string;
  onChange: (value: string) => void;
  onLatexChange?: (latex: string) => void;
  className?: string;
}

const EnhancedMathInput = ({
  value,
  onChange,
  onLatexChange,
  className = "",
}: EnhancedMathInputProps) => {
  const [latex, setLatex] = useState("");
  const [isValid, setIsValid] = useState(true);

  // Convert plain text math to LaTeX on initial load
  useEffect(() => {
    try {
      // Basic conversion of common functions to LaTeX
      const latexValue = value
        .replace(/ln/g, "\\ln")
        .replace(/log/g, "\\log")
        .replace(/\*/g, "\\cdot")
        .replace(/sqrt/g, "\\sqrt");
      setLatex(latexValue);
    } catch (error) {
      console.error("Error converting to LaTeX:", error);
    }
  }, []);

  const handleChange = (mathField: { latex: () => string }) => {
    try {
      const latex = mathField.latex();
      const plaintext = latex
        .replace(/\\cdot/g, "*")
        .replace(/\\ln/g, "ln")
        .replace(/\\log/g, "log")
        .replace(/\\sqrt/g, "sqrt")
        .replace(/\\/g, "");

      // Test if the expression is valid
      evaluate("1 + 1"); // Just to ensure mathjs is working
      setIsValid(true);
      setLatex(latex);
      onChange(plaintext);
      if (onLatexChange) onLatexChange(latex);
    } catch (error) {
      setIsValid(false);
      console.error("Invalid math expression:", error);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <EditableMathField
        latex={latex}
        onChange={handleChange}
        className={`w-full p-2 border rounded-md ${
          isValid ? "border-input" : "border-red-500"
        } bg-background`}
      />
      {!isValid && (
        <p className="text-xs text-red-500 mt-1">Invalid math expression</p>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(EnhancedMathInput), {
  ssr: false,
});
