import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useWagonData } from "../context/WagonDataContext";
import { resolveSessionZone, filterWagonsByDateRange, buildWagonSummary, getWagonFilterOptions } from "../utils/wagonUtils";

export function useZoneWagons(options = {}) {
  const auth = useAuth();
  const { wagons: allWagons, loading, error, refresh, createWagon, updateWagon, deleteWagon, lastSyncedAt } = useWagonData();

  const sessionZone = resolveSessionZone(auth);
  const zone    = options.zone    || sessionZone || null;
  const dateFrom = options.dateFrom || "";
  const dateTo   = options.dateTo   || "";

  const zoneWagons = useMemo(() =>
    zone ? allWagons.filter(w => w.zone === zone) : allWagons,
  [allWagons, zone]);

  const datedWagons   = useMemo(() => filterWagonsByDateRange(zoneWagons, dateFrom, dateTo), [zoneWagons, dateFrom, dateTo]);
  const summary       = useMemo(() => buildWagonSummary(datedWagons),  [datedWagons]);
  const filterOptions = useMemo(() => getWagonFilterOptions(zoneWagons), [zoneWagons]);

  return { zone, allWagons, wagons: datedWagons, zoneWagons, summary, filterOptions, loading, error, refresh, createWagon, updateWagon, deleteWagon, lastSyncedAt };
}

export default useZoneWagons;
