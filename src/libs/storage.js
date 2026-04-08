import {
  STOKEY_SETTING,
  STOKEY_SETTING_OLD,
  STOKEY_RULES,
  STOKEY_RULES_OLD,
  STOKEY_WORDS,
  STOKEY_FAB,
  STOKEY_TRANBOX,
  STOKEY_SYNC,
  STOKEY_MSAUTH,
  STOKEY_BDAUTH,
  STOKEY_RULESCACHE_PREFIX,
  LEGACY_STORAGE_KEY_ALIASES,
  LEGACY_STOKEY_RULESCACHE_PREFIX,
  DEFAULT_SETTING,
  normalizeSetting,
  normalizeCEFRSetting,
  normalizeSync,
  DEFAULT_RULES,
  DEFAULT_SYNC,
  BUILTIN_RULES,
} from "../config";
import { isExt, isGm } from "./client";
import { browser } from "./browser";
import { easyLog } from "./log";
import { debounce } from "./utils";

const getLegacyKeys = (key) => {
  const exactKeys = LEGACY_STORAGE_KEY_ALIASES[key] || [];

  if (key.startsWith(STOKEY_RULESCACHE_PREFIX)) {
    const suffix = key.slice(STOKEY_RULESCACHE_PREFIX.length);
    return [...exactKeys, `${LEGACY_STOKEY_RULESCACHE_PREFIX}${suffix}`];
  }

  return exactKeys;
};

const getGMStorage = () => window.EASY_GM || window.KISS_GM || GM;

const isMissingValue = (value) => value === null || value === undefined;

async function readRaw(key) {
  if (isExt) {
    const val = await browser.storage.local.get([key]);
    return val[key];
  } else if (isGm) {
    return await getGMStorage().getValue(key);
  }
  return window.localStorage.getItem(key);
}

async function readWithLegacyFallback(key) {
  const value = await readRaw(key);
  if (!isMissingValue(value)) {
    return { value, sourceKey: key };
  }

  for (const legacyKey of getLegacyKeys(key)) {
    const legacyValue = await readRaw(legacyKey);
    if (!isMissingValue(legacyValue)) {
      return { value: legacyValue, sourceKey: legacyKey };
    }
  }

  return { value: undefined, sourceKey: key };
}

async function set(key, val) {
  if (isExt) {
    await browser.storage.local.set({ [key]: val });
  } else if (isGm) {
    await getGMStorage().setValue(key, val);
  } else {
    window.localStorage.setItem(key, val);
  }
}

async function get(key) {
  return (await readWithLegacyFallback(key)).value;
}

async function del(key) {
  if (isExt) {
    await browser.storage.local.remove([key, ...getLegacyKeys(key)]);
  } else if (isGm) {
    const storage = getGMStorage();
    await storage.deleteValue(key);
    for (const legacyKey of getLegacyKeys(key)) {
      await storage.deleteValue(legacyKey);
    }
  } else {
    window.localStorage.removeItem(key);
    getLegacyKeys(key).forEach((legacyKey) => {
      window.localStorage.removeItem(legacyKey);
    });
  }
}

async function setObj(key, obj) {
  await set(key, JSON.stringify(obj));
}

async function trySetObj(key, obj) {
  if (!(await get(key))) {
    await setObj(key, obj);
  }
}

async function getObj(key) {
  const { value: val, sourceKey } = await readWithLegacyFallback(key);
  if (val === null || val === undefined) return null;
  try {
    const parsed = JSON.parse(val);
    if (sourceKey !== key) {
      await set(key, val);
    }
    return parsed;
  } catch (err) {
    easyLog("parse json in storage err: ", key);
  }
  return null;
}

async function putObj(key, obj) {
  const cur = (await getObj(key)) ?? {};
  await setObj(key, { ...cur, ...obj });
}

/**
 * 对storage的封装
 */
export const storage = {
  get,
  set,
  del,
  setObj,
  trySetObj,
  getObj,
  putObj,
  // onChanged,
};

/**
 * 设置信息
 */
export const getSetting = () => getObj(STOKEY_SETTING);
export const getSettingOld = () => getObj(STOKEY_SETTING_OLD);
export const getSettingWithDefault = async () => {
  const setting = await getSetting();
  const normalizedSetting = normalizeSetting(setting);

  if (setting && typeof setting === "object") {
    const originalSetting = JSON.stringify({
      ...setting,
      cefrSetting: normalizeCEFRSetting(setting.cefrSetting),
    });
    const nextSetting = JSON.stringify(normalizedSetting);

    if (originalSetting !== nextSetting) {
      await setSetting(normalizedSetting);
    }
  }

  return normalizedSetting;
};
export const setSetting = (val) => setObj(STOKEY_SETTING, val);
export const putSetting = (obj) => putObj(STOKEY_SETTING, obj);

/**
 * 规则列表
 */
export const getRules = () => getObj(STOKEY_RULES);
export const getRulesOld = () => getObj(STOKEY_RULES_OLD);
export const getRulesWithDefault = async () =>
  (await getRules()) || DEFAULT_RULES;
export const setRules = (val) => setObj(STOKEY_RULES, val);

/**
 * 词汇列表
 */
export const getWords = () => getObj(STOKEY_WORDS);
export const getWordsWithDefault = async () => (await getWords()) || {};
export const setWords = (val) => setObj(STOKEY_WORDS, val);

/**
 * 订阅规则
 */
export const getSubRules = (url) => getObj(STOKEY_RULESCACHE_PREFIX + url);
export const getSubRulesWithDefault = async () => (await getSubRules()) || [];
export const delSubRules = (url) => del(STOKEY_RULESCACHE_PREFIX + url);
export const setSubRules = (url, val) =>
  setObj(STOKEY_RULESCACHE_PREFIX + url, val);

/**
 * fab位置
 */
export const getFab = () => getObj(STOKEY_FAB);
export const getFabWithDefault = async () => (await getFab()) || {};
export const setFab = (obj) => setObj(STOKEY_FAB, obj);
export const putFab = (obj) => putObj(STOKEY_FAB, obj);

/**
 * tranbox位置大小
 */
export const getTranBox = () => getObj(STOKEY_TRANBOX);
export const putTranBox = (obj) => putObj(STOKEY_TRANBOX, obj);
export const debouncePutTranBox = debounce(putTranBox, 300);

/**
 * 数据同步
 */
export const getSync = () => getObj(STOKEY_SYNC);
export const getSyncWithDefault = async () => {
  const sync = await getSync();
  const normalizedSync = normalizeSync(sync);

  if (sync && JSON.stringify(sync) !== JSON.stringify(normalizedSync)) {
    await setObj(STOKEY_SYNC, normalizedSync);
  }

  return normalizedSync || DEFAULT_SYNC;
};
export const putSync = (obj) => putObj(STOKEY_SYNC, obj);
export const putSyncMeta = async (key) => {
  const { syncMeta = {} } = await getSyncWithDefault();
  syncMeta[key] = { ...(syncMeta[key] || {}), updateAt: Date.now() };
  await putSync({ syncMeta });
};
export const debounceSyncMeta = debounce(putSyncMeta, 300);

/**
 * ms auth
 */
export const getMsauth = () => getObj(STOKEY_MSAUTH);
export const setMsauth = (val) => setObj(STOKEY_MSAUTH, val);

/**
 * baidu auth
 */
export const getBdauth = () => getObj(STOKEY_BDAUTH);
export const setBdauth = (val) => setObj(STOKEY_BDAUTH, val);

/**
 * 存入默认数据
 */
export const tryInitDefaultData = async () => {
  try {
    await trySetObj(STOKEY_SETTING, DEFAULT_SETTING);
    await trySetObj(STOKEY_RULES, DEFAULT_RULES);
    await trySetObj(STOKEY_SYNC, DEFAULT_SYNC);
    await trySetObj(
      `${STOKEY_RULESCACHE_PREFIX}${process.env.REACT_APP_RULESURL}`,
      BUILTIN_RULES
    );
  } catch (err) {
    easyLog("init default", err);
  }
};
