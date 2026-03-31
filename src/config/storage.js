import { APP_NAME, APP_VERSION } from "./app";

export const LEGACY_APP_NAME = "KISS-Translator";

export const KV_RULES_KEY = `easy-rules_v${APP_VERSION[0]}.json`;
export const KV_WORDS_KEY = "easy-words.json";
export const KV_RULES_SHARE_KEY = `easy-rules-share_v${APP_VERSION[0]}.json`;
export const KV_SETTING_KEY = `easy-setting_v${APP_VERSION[0]}.json`;
export const KV_SALT_SYNC = "Easy-Translator-SYNC";
export const KV_SALT_SHARE = "Easy-Translator-SHARE";

export const STOKEY_MSAUTH = `${APP_NAME}_msauth`;
export const STOKEY_BDAUTH = `${APP_NAME}_bdauth`;
export const STOKEY_SETTING_OLD = `${APP_NAME}_setting`;
export const STOKEY_RULES_OLD = `${APP_NAME}_rules`;
export const STOKEY_SETTING = `${APP_NAME}_setting_v${APP_VERSION[0]}`;
export const STOKEY_RULES = `${APP_NAME}_rules_v${APP_VERSION[0]}`;
export const STOKEY_WORDS = `${APP_NAME}_words`;
export const STOKEY_SYNC = `${APP_NAME}_sync`;
export const STOKEY_FAB = `${APP_NAME}_fab`;
export const STOKEY_TRANBOX = `${APP_NAME}_tranbox`;
export const STOKEY_SEPARATE_WINDOW = `${APP_NAME}_separate_window`;
export const STOKEY_RULESCACHE_PREFIX = `${APP_NAME}_rulescache_`;

export const LEGACY_STOKEY_MSAUTH = `${LEGACY_APP_NAME}_msauth`;
export const LEGACY_STOKEY_BDAUTH = `${LEGACY_APP_NAME}_bdauth`;
export const LEGACY_STOKEY_SETTING_OLD = `${LEGACY_APP_NAME}_setting`;
export const LEGACY_STOKEY_RULES_OLD = `${LEGACY_APP_NAME}_rules`;
export const LEGACY_STOKEY_SETTING = `${LEGACY_APP_NAME}_setting_v${APP_VERSION[0]}`;
export const LEGACY_STOKEY_RULES = `${LEGACY_APP_NAME}_rules_v${APP_VERSION[0]}`;
export const LEGACY_STOKEY_WORDS = `${LEGACY_APP_NAME}_words`;
export const LEGACY_STOKEY_SYNC = `${LEGACY_APP_NAME}_sync`;
export const LEGACY_STOKEY_FAB = `${LEGACY_APP_NAME}_fab`;
export const LEGACY_STOKEY_TRANBOX = `${LEGACY_APP_NAME}_tranbox`;
export const LEGACY_STOKEY_SEPARATE_WINDOW = `${LEGACY_APP_NAME}_separate_window`;
export const LEGACY_STOKEY_RULESCACHE_PREFIX = `${LEGACY_APP_NAME}_rulescache_`;

export const LEGACY_STORAGE_KEY_ALIASES = {
  [STOKEY_MSAUTH]: [LEGACY_STOKEY_MSAUTH],
  [STOKEY_BDAUTH]: [LEGACY_STOKEY_BDAUTH],
  [STOKEY_SETTING_OLD]: [LEGACY_STOKEY_SETTING_OLD],
  [STOKEY_RULES_OLD]: [LEGACY_STOKEY_RULES_OLD],
  [STOKEY_SETTING]: [LEGACY_STOKEY_SETTING],
  [STOKEY_RULES]: [LEGACY_STOKEY_RULES],
  [STOKEY_WORDS]: [LEGACY_STOKEY_WORDS],
  [STOKEY_SYNC]: [LEGACY_STOKEY_SYNC],
  [STOKEY_FAB]: [LEGACY_STOKEY_FAB],
  [STOKEY_TRANBOX]: [LEGACY_STOKEY_TRANBOX],
  [STOKEY_SEPARATE_WINDOW]: [LEGACY_STOKEY_SEPARATE_WINDOW],
};

export const CACHE_NAME = `${APP_NAME}_cache`;
export const DEFAULT_CACHE_TIMEOUT = 3600 * 24 * 7; // 缓存超时时间(7天)
