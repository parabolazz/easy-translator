import { APP_VERSION, STOKEY_SETTING, OPT_SYNCTYPE_WORKER } from "../config";
import { getSettingWithDefault, getSyncWithDefault } from "./storage";

describe("getSettingWithDefault", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("backfills missing CEFR nested fields and persists normalized settings", async () => {
    const legacySetting = {
      darkMode: "light",
      cefrSetting: {
        enabled: true,
        level: 2,
      },
    };

    window.localStorage.setItem(STOKEY_SETTING, JSON.stringify(legacySetting));

    const setting = await getSettingWithDefault();

    expect(setting.cefrSetting).toEqual({
      enabled: true,
      level: 2,
      assessmentCompleted: false,
      levelSource: "unset",
      lastPromptFrom: "",
    });

    const persisted = JSON.parse(window.localStorage.getItem(STOKEY_SETTING));
    expect(persisted.cefrSetting).toEqual({
      enabled: true,
      level: 2,
      assessmentCompleted: false,
      levelSource: "unset",
      lastPromptFrom: "",
    });
  });

  test("persists backfilled defaultApiSlug for legacy settings", async () => {
    const legacySetting = {
      darkMode: "light",
      cefrSetting: {
        enabled: true,
        level: 2,
      },
    };

    window.localStorage.setItem(STOKEY_SETTING, JSON.stringify(legacySetting));

    const setting = await getSettingWithDefault();

    expect(setting.defaultApiSlug).toBe("Microsoft");

    const persisted = JSON.parse(window.localStorage.getItem(STOKEY_SETTING));
    expect(persisted.defaultApiSlug).toBe("Microsoft");
  });

  test("migrates legacy KISS setting storage into the Easy Translator key", async () => {
    const legacyKey = `KISS-Translator_setting_v${APP_VERSION[0]}`;
    const easyKey = `Easy-Translator_setting_v${APP_VERSION[0]}`;
    const legacySetting = {
      darkMode: "light",
      cefrSetting: {
        enabled: true,
        level: 3,
      },
    };

    window.localStorage.setItem(legacyKey, JSON.stringify(legacySetting));

    const setting = await getSettingWithDefault();

    expect(setting.darkMode).toBe("light");
    expect(setting.cefrSetting.level).toBe(3);
    expect(JSON.parse(window.localStorage.getItem(easyKey))).toMatchObject({
      darkMode: "light",
      cefrSetting: {
        enabled: true,
        level: 3,
      },
    });
  });
});

describe("getSyncWithDefault", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("migrates legacy KISS sync settings and normalizes the worker type", async () => {
    const legacyKey = "KISS-Translator_sync";
    const easyKey = "Easy-Translator_sync";

    window.localStorage.setItem(
      legacyKey,
      JSON.stringify({
        syncType: "KISS-Worker",
        syncUrl: "https://example.com",
        syncKey: "secret",
      })
    );

    const sync = await getSyncWithDefault();

    expect(sync).toMatchObject({
      syncType: OPT_SYNCTYPE_WORKER,
      syncUrl: "https://example.com",
      syncKey: "secret",
    });
    expect(JSON.parse(window.localStorage.getItem(easyKey))).toMatchObject({
      syncType: OPT_SYNCTYPE_WORKER,
      syncUrl: "https://example.com",
      syncKey: "secret",
    });
  });
});
