import { useCallback, useEffect, useMemo } from "react";
import { STOKEY_SYNC, DEFAULT_SYNC, normalizeSync } from "../config";
import { useStorage } from "./Storage";

/**
 * sync hook
 * @returns
 */
export function useSync() {
  const {
    data,
    save,
    update,
    reload,
    isLoading,
  } = useStorage(STOKEY_SYNC, DEFAULT_SYNC);
  const sync = useMemo(() => normalizeSync(data), [data]);

  useEffect(() => {
    if (isLoading || !data) return;
    if (JSON.stringify(data) === JSON.stringify(sync)) return;
    save(sync);
  }, [data, isLoading, save, sync]);

  return { sync, updateSync: update, reloadSync: reload };
}

/**
 * update syncmeta hook
 * @returns
 */
export function useSyncMeta() {
  const { updateSync } = useSync();

  const updateSyncMeta = useCallback(
    (key) => {
      updateSync((prevSync) => {
        const newSyncMeta = {
          ...(prevSync?.syncMeta || {}),
          [key]: {
            ...(prevSync?.syncMeta?.[key] || {}),
            updateAt: Date.now(),
          },
        };
        return { syncMeta: newSyncMeta };
      });
    },
    [updateSync]
  );

  return { updateSyncMeta };
}

/**
 * caches sync hook
 * @param {*} url
 * @returns
 */
export function useSyncCaches() {
  const { sync, updateSync, reloadSync } = useSync();

  const updateDataCache = useCallback(
    (url) => {
      updateSync((prevSync) => ({
        dataCaches: {
          ...(prevSync?.dataCaches || {}),
          [url]: Date.now(),
        },
      }));
    },
    [updateSync]
  );

  const deleteDataCache = useCallback(
    (url) => {
      updateSync((prevSync) => {
        const newDataCaches = { ...(prevSync?.dataCaches || {}) };
        delete newDataCaches[url];
        return { dataCaches: newDataCaches };
      });
    },
    [updateSync]
  );

  const dataCaches = useMemo(() => sync?.dataCaches || {}, [sync?.dataCaches]);

  return {
    dataCaches,
    updateDataCache,
    deleteDataCache,
    reloadSync,
  };
}
