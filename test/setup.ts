// Test setup file for vitest
import { beforeAll } from "vitest";

beforeAll(() => {
	// Set up any global test configuration here
	process.env.NODE_ENV = "test";
});

