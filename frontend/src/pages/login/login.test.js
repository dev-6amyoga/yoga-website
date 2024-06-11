import { render, screen } from "@testing-library/react";
import { expect } from "vitest";
import Login from "./login";

describe("Login component", () => {
	it("should render Register component correctly", () => {
		render(<Login />);
		const element = screen.getByRole("main");
		expect(element).toBeInTheDocument();
	});
});
