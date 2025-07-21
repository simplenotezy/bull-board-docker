import { describe, it, expect, beforeEach } from "vitest";
import config from "../src/config";

describe("Bull Board Configuration", () => {
	beforeEach(() => {
		// Clear environment variables before each test
		Object.keys(process.env).forEach((key) => {
			if (key.startsWith("BULL_BOARD_")) {
				delete process.env[key];
			}
		});
	});

	describe("parseBullBoardOptions", () => {
		it("should parse basic UI configuration", () => {
			process.env.BULL_BOARD_UI_CONFIG__BOARD_TITLE = "Test Dashboard";
			process.env.BULL_BOARD_UI_BASE_PATH = "/admin";

			const result = config.getBullBoardOptions();

			expect(result.uiConfig?.boardTitle).toBe("Test Dashboard");
			expect(result.uiBasePath).toBe("/admin");
		});

		it("should parse nested configuration with automatic type conversion", () => {
			process.env.BULL_BOARD_UI_CONFIG__POLLING_INTERVAL__SHOW_SETTING =
				"true";
			process.env.BULL_BOARD_UI_CONFIG__POLLING_INTERVAL__FORCE_INTERVAL =
				"3000";
			process.env.BULL_BOARD_UI_CONFIG__BOARD_LOGO__WIDTH = "200";

			const result = config.getBullBoardOptions();

			expect(result.uiConfig?.pollingInterval?.showSetting).toBe(true);
			expect(result.uiConfig?.pollingInterval?.forceInterval).toBe(3000);
			expect(result.uiConfig?.boardLogo?.width).toBe(200);
		});

		it("should handle complex nested structures", () => {
			process.env.BULL_BOARD_UI_CONFIG__BOARD_LOGO__PATH = "/logo.png";
			process.env.BULL_BOARD_UI_CONFIG__LOCALE__LNG = "en";
			process.env.BULL_BOARD_UI_CONFIG__DATE_FORMATS__SHORT = "HH:mm:ss";
			process.env.BULL_BOARD_UI_CONFIG__MENU__WIDTH = "300px";

			const result = config.getBullBoardOptions();

			expect(result.uiConfig?.boardLogo?.path).toBe("/logo.png");
			expect(result.uiConfig?.locale?.lng).toBe("en");
			expect(result.uiConfig?.dateFormats?.short).toBe("HH:mm:ss");
			expect(result.uiConfig?.menu?.width).toBe("300px");
		});

		it("should convert string numbers to numbers", () => {
			process.env.BULL_BOARD_UI_CONFIG__BOARD_LOGO__WIDTH = "200";
			process.env.BULL_BOARD_UI_CONFIG__BOARD_LOGO__HEIGHT = "100";

			const result = config.getBullBoardOptions();

			expect(typeof result.uiConfig?.boardLogo?.width).toBe("number");
			expect(result.uiConfig?.boardLogo?.width).toBe(200);
			expect(typeof result.uiConfig?.boardLogo?.height).toBe("number");
			expect(result.uiConfig?.boardLogo?.height).toBe(100);
		});

		it("should convert boolean strings to booleans", () => {
			process.env.BULL_BOARD_UI_CONFIG__POLLING_INTERVAL__SHOW_SETTING =
				"true";
			process.env.BULL_BOARD_UI_CONFIG__POLLING_INTERVAL__FORCE_INTERVAL =
				"false";

			const result = config.getBullBoardOptions();

			expect(typeof result.uiConfig?.pollingInterval?.showSetting).toBe(
				"boolean"
			);
			expect(result.uiConfig?.pollingInterval?.showSetting).toBe(true);
			expect(typeof result.uiConfig?.pollingInterval?.forceInterval).toBe(
				"boolean"
			);
			expect(result.uiConfig?.pollingInterval?.forceInterval).toBe(false);
		});

		it("should preserve non-numeric strings", () => {
			process.env.BULL_BOARD_UI_CONFIG__BOARD_TITLE =
				"My Custom Dashboard";
			process.env.BULL_BOARD_UI_CONFIG__BOARD_LOGO__PATH =
				"/assets/logo.png";

			const result = config.getBullBoardOptions();

			expect(typeof result.uiConfig?.boardTitle).toBe("string");
			expect(result.uiConfig?.boardTitle).toBe("My Custom Dashboard");
			expect(typeof result.uiConfig?.boardLogo?.path).toBe("string");
			expect(result.uiConfig?.boardLogo?.path).toBe("/assets/logo.png");
		});

		it("should handle empty configuration", () => {
			const result = config.getBullBoardOptions();

			expect(result).toEqual({});
		});

		it("should be future-proof for new Bull Board options", () => {
			// Test with a hypothetical future option
			process.env.BULL_BOARD_UI_CONFIG__NEW_FEATURE__ENABLED = "true";
			process.env.BULL_BOARD_UI_CONFIG__NEW_FEATURE__SETTINGS__DEPTH =
				"5";

			const result = config.getBullBoardOptions();

			// @ts-expect-error - newFeature is not part of the base types
			expect(result.uiConfig?.newFeature?.enabled).toBe(true);
			// @ts-expect-error - newFeature is not part of the base types
			expect(result.uiConfig?.newFeature?.settings?.depth).toBe(5);
		});
	});

	describe("Dynamic parsing capabilities", () => {
		it("should demonstrate dynamic parsing works for any nested structure", () => {
			process.env.BULL_BOARD_UI_CONFIG__BOARD_TITLE = "Test Dashboard";
			process.env.BULL_BOARD_UI_CONFIG__POLLING_INTERVAL__SHOW_SETTING =
				"true";
			process.env.BULL_BOARD_UI_CONFIG__POLLING_INTERVAL__FORCE_INTERVAL =
				"3000";
			process.env.BULL_BOARD_UI_CONFIG__LOCALE__LNG = "en";
			process.env.BULL_BOARD_UI_CONFIG__BOARD_LOGO__PATH = "/logo.png";
			process.env.BULL_BOARD_UI_CONFIG__BOARD_LOGO__WIDTH = "200";
			process.env.BULL_BOARD_UI_CONFIG__DATE_FORMATS__SHORT = "HH:mm:ss";
			process.env.BULL_BOARD_UI_CONFIG__MENU__WIDTH = "300px";
			process.env.BULL_BOARD_UI_BASE_PATH = "/admin";

			const result = config.getBullBoardOptions();

			// Verify the structure is correctly parsed according to BoardOptions interface
			expect(result.uiConfig?.boardTitle).toBe("Test Dashboard");
			expect(result.uiConfig?.pollingInterval?.showSetting).toBe(true);
			expect(result.uiConfig?.pollingInterval?.forceInterval).toBe(3000);
			expect(result.uiConfig?.locale?.lng).toBe("en");
			expect(result.uiConfig?.boardLogo?.path).toBe("/logo.png");
			expect(result.uiConfig?.boardLogo?.width).toBe(200);
			expect(result.uiConfig?.dateFormats?.short).toBe("HH:mm:ss");
			expect(result.uiConfig?.menu?.width).toBe("300px");
			expect(result.uiBasePath).toBe("/admin");
		});
	});
});

