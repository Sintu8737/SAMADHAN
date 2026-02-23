import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders application header", () => {
  render(<App />);
  const titleElement = screen.getByText(/SAMADHAN/i);
  expect(titleElement).toBeInTheDocument();
});
