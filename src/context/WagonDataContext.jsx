import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../utils/api";
import { normalizeWagonRecord, resolveSessionZone } from "../utils/wagonUtils";
import { useAuth } from "./AuthContext";

const WagonDataContext = createContext(null);
const POLL_INTERVAL_MS = 45000;

export function WagonDataProvider({ children }) {
  const auth = useAuth();
  const zone = resolveSessionZone(auth);
  const canLoad = Boolean(auth.admin || auth.analyst);
  const pollRef = useRef(null);

  const [wagons,      setWagons]      = useState([]);
  const [loading,     setLoading]     = useState(canLoad);
  const [error,       setError]       = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!canLoad) { setWagons([]); setLoading(false); setError(""); return []; }
    if (!silent) setLoading(true);
    try {
      const response = await api.getWagons();
      const normalized = (response.data || []).map(normalizeWagonRecord);
      setWagons(normalized);
      setError("");
      setLastSyncedAt(new Date());
      return normalized;
    } catch (err) {
      setError(err?.message || "Unable to load wagons");
      return [];
    } finally {
      if (!silent) setLoading(false);
    }
  }, [canLoad]);

  useEffect(() => {
    refresh();
    if (pollRef.current) clearInterval(pollRef.current);
    if (!canLoad) return undefined;
    pollRef.current = setInterval(() => refresh({ silent: true }), POLL_INTERVAL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [canLoad, refresh]);

  const createWagon = useCallback(async (payload) => {
    const res = await api.createWagon(payload);
    const n = normalizeWagonRecord(res.data);
    setWagons(prev => [n, ...prev]);
    setLastSyncedAt(new Date());
    return n;
  }, []);

  const updateWagon = useCallback(async (id, payload) => {
    const res = await api.updateWagon(id, payload);
    const n = normalizeWagonRecord(res.data);
    setWagons(prev => prev.map(w => (w._id === n._id || w.wagonId === n.wagonId) ? n : w));
    setLastSyncedAt(new Date());
    return n;
  }, []);

  const deleteWagon = useCallback(async (id, wagonId) => {
    await api.deleteWagon(id);
    setWagons(prev => prev.filter(w => w._id !== id && w.wagonId !== wagonId));
    setLastSyncedAt(new Date());
  }, []);

  const value = useMemo(() => ({
    wagons, loading, error, zone, lastSyncedAt,
    refresh, createWagon, updateWagon, deleteWagon,
  }), [wagons, loading, error, zone, lastSyncedAt, refresh, createWagon, updateWagon, deleteWagon]);

  return <WagonDataContext.Provider value={value}>{children}</WagonDataContext.Provider>;
}

export const useWagonData = () => {
  const ctx = useContext(WagonDataContext);
  if (!ctx) throw new Error("useWagonData must be used within WagonDataProvider");
  return ctx;
};
