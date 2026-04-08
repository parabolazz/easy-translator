import { act } from "react";
import { createRoot } from "react-dom/client";
import { useTheme } from "@mui/material/styles";
import Theme from "./Theme";

jest.mock("./ColorMode", () => ({
  useDarkMode: () => ({ darkMode: "light" }),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
});

function ThemeProbe() {
  const theme = useTheme();

  return (
    <div
      data-testid="theme-probe"
      data-shape-radius={String(theme.shape.borderRadius)}
      data-paper-radius={String(
        theme.components.MuiPaper?.styleOverrides?.root?.borderRadius ?? ""
      )}
      data-dialog-radius={String(
        theme.components.MuiDialog?.styleOverrides?.paper?.borderRadius ?? ""
      )}
      data-drawer-radius={String(
        theme.components.MuiDrawer?.styleOverrides?.paper?.borderRadius ?? ""
      )}
    />
  );
}

function renderUI() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <Theme>
        <ThemeProbe />
      </Theme>
    );
  });

  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe("Theme", () => {
  test("keeps popup-like surfaces on a restrained corner radius", () => {
    const { container, unmount } = renderUI();
    const probe = container.querySelector("[data-testid='theme-probe']");

    expect(probe.getAttribute("data-shape-radius")).toBe("10");
    expect(probe.getAttribute("data-paper-radius")).toBe("10");
    expect(probe.getAttribute("data-dialog-radius")).toBe("10");
    expect(probe.getAttribute("data-drawer-radius")).toBe("10");

    unmount();
  });
});
