import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../utils/api";
import { normalizeWagonRecord, resolveSessionZone } from "../utils/wagonUtils";
import { useAuth } from "./AuthContext";

const WagonDataContext = createContext(null);
const POLL_INTERVAL_MS = 45000;

const normalizeCollection = (items) => items.map(normalizeWagonRecord);

const upsertWagon = (wagons, nextWagon) => {
  const existingIndex = wagons.findIndex((wagon) => wagon._id === nextWagon._id || wagon.wagonId === nextWagon.wagonId);
  if (existingIndex === -1) return [nextWagon, ...wagons];

  const next = [...wagons];
  next[existingIndex] = nextWagon;
  return next;
};

export function WagonDataProvider({ children }) {
  const auth = useAuth();
  const zone = resolveSessionZone(auth);
  const canLoad = Boolean(auth.admin || auth.analyst);
  const pollRef = useRef(null);

  const [wagons, setWagons] = useState([]);
  const [loading, setLoading] = useState(canLoad);
  const [error, setError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!canLoad) {
      setWagons([]);
      setLoading(false);
      setError("");
      return [];
    }

    if (!silent) setLoading(true);
    try {
      const response = await api.getWagons();
      const normalized = normalizeCollection(response.data || []);
      setWagons(normalized);
      setError("");
      setLastSyncedAt(new Date());
      return normalized;
    } catch (fetchError) {
      const message = fetchError?.message || "Unable to load wagons";
      setError(message);
      return [];
    } finally {
      if (!silent) setLoading(false);
    }
  }, [canLoad]);

  useEffect(() => {
    refresh();

    if (pollRef.current) clearInterval(pollRef.current);
    if (!canLoad) return undefined;

    pollRef.current = setInterval(() => {
      refresh({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [canLoad, refresh]);

  const createWagon = useCallback(async (payload) => {
    const response = await api.createWagon(payload);
    const normalized = normalizeWagonRecord(response.data);
    setWagons((current) => upsertWagon(current, normalized));
    setLastSyncedAt(new Date());
    return normalized;
  }, []);

  const updateWagon = useCallback(async (id, payload) => {
    const response = await api.updateWagon(id, payload);
    const normalized = normalizeWagonRecord(response.data);
    setWagons((current) => upsertWagon(current, normalized));
    setLastSyncedAt(new Date());
    return normalized;
  }, []);

  const deleteWagon = useCallback(async (id, wagonId) => {
    await api.deleteWagon(id);
    setWagons((current) =>
      current.filter((wagon) => wagon._id !== id && wagon.wagonId !== wagonId)
    );
    setLastSyncedAt(new Date());
  }, []);

  const value = useMemo(() => ({
    wagons,
    loading,
    error,
    zone,
    lastSyncedAt,
    refresh,
    createWagon,
    updateWagon,
    deleteWagon,
  }), [wagons, loading, error, zone, lastSyncedAt, refresh, createWagon, updateWagon, deleteWagon]);

  return (
    <WagonDataContext.Provider value={value}>
      {children}
    </WagonDataContext.Provider>
  );
}

export const useWagonData = () => {
  const context = useContext(WagonDataContext);
  if (!context) {
    throw new Error("useWagonData must be used within WagonDataProvider");
  }
  return context;
};
