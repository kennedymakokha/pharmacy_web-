
import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Boxes,
  Search,
  RefreshCw,
  Package,
  Clock,
  XCircle,
  X,
} from "lucide-react";

import { useGetMedicinesQuery } from "../../app/services/medicineApi";

const DAY_MS = 24 * 60 * 60 * 1000;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getExpiryDays = (value) => {
  if (!value) return null;

  const expiry = new Date(value);

  if (Number.isNaN(expiry.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil((expiry.getTime() - today.getTime()) / DAY_MS);
};

const getStockStatus = (medicine) => {
  const quantity = Number(medicine.quantity || 0);
  const reorder = Number(medicine.reorder || 0);

  if (quantity <= 0) return "Out of stock";
  if (quantity <= reorder) return "Low stock";

  return "In stock";
};

const getExpiryStatus = (medicine) => {
  const days = getExpiryDays(medicine.expiry);

  if (days === null) return "Unknown";
  if (days < 0) return "Expired";
  if (days <= 30) return "Expiring soon";

  return "Valid";
};

function InventoryPage() {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");

  const {
    data: medicinesResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMedicinesQuery({
    page: 1,
    limit: 1000,
    search: "",
    category: "",
  });

  const medicines = medicinesResponse?.data || [];

  const inventory = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return medicines.filter((medicine) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          medicine.name,
          medicine.batch,
          medicine.manufacturer,
          medicine.category?.name,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch)
          );

      const stockStatus = getStockStatus(medicine);
      const expiryStatus = getExpiryStatus(medicine);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" &&
          (stockStatus === "Low stock" ||
            stockStatus === "Out of stock")) ||
        (stockFilter === "out" && stockStatus === "Out of stock") ||
        (stockFilter === "available" && stockStatus === "In stock");

      const matchesExpiry =
        expiryFilter === "all" ||
        (expiryFilter === "expired" && expiryStatus === "Expired") ||
        (expiryFilter === "soon" && expiryStatus === "Expiring soon") ||
        (expiryFilter === "valid" && expiryStatus === "Valid");

      return matchesSearch && matchesStock && matchesExpiry;
    });
  }, [medicines, search, stockFilter, expiryFilter]);

  const summary = useMemo(() => {
    const totalUnits = medicines.reduce(
      (sum, medicine) => sum + Math.max(0, Number(medicine.quantity || 0)),
      0
    );

    const lowStock = medicines.filter((medicine) => {
      const quantity = Number(medicine.quantity || 0);
      const reorder = Number(medicine.reorder || 0);

      return quantity > 0 && quantity <= reorder;
    });

    const outOfStock = medicines.filter(
      (medicine) => Number(medicine.quantity || 0) <= 0
    );

    const expiring = medicines.filter(
      (medicine) => getExpiryStatus(medicine) === "Expiring soon"
    );

    const expired = medicines.filter(
      (medicine) => getExpiryStatus(medicine) === "Expired"
    );

    return {
      totalUnits,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      expiring: expiring.length,
      expired: expired.length,
    };
  }, [medicines]);

  const clearFilters = () => {
    setSearch("");
    setStockFilter("all");
    setExpiryFilter("all");
  };

  const hasFilters =
    search.trim() !== "" ||
    stockFilter !== "all" ||
    expiryFilter !== "all";

  return (
    <>
      {/* Inventory summary */}
      <div className="stats-grid compact">
        <div className="stat-card red">
          <div className="stat-icon">
            <AlertTriangle />
          </div>

          <div>
            <span>Low stock</span>
            <strong>{summary.lowStock}</strong>
            <small>Above zero, at or below reorder level</small>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <CalendarDays />
          </div>

          <div>
            <span>Expiring soon</span>
            <strong>{summary.expiring}</strong>
            <small>Expiry within 30 days</small>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <Boxes />
          </div>

          <div>
            <span>Total units</span>
            <strong>{summary.totalUnits.toLocaleString()}</strong>
            <small>Across loaded medicines</small>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon">
            <XCircle />
          </div>

          <div>
            <span>Out of stock</span>
            <strong>{summary.outOfStock}</strong>
            <small>Medicines with zero quantity</small>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <Clock />
          </div>

          <div>
            <span>Expired</span>
            <strong>{summary.expired}</strong>
            <small>Require review</small>
          </div>
        </div>
      </div>

      {/* Stock monitoring */}
      <div className="panel">
        <div className="panel-head inventory-panel-head">
          <div>
            <h3>Stock levels and expiry monitoring</h3>
            <p className="muted">
              Monitor medicine quantities, reorder levels and expiry dates.
            </p>
          </div>

          <button
            type="button"
            className="btn secondary"
            onClick={refetch}
            disabled={isFetching}
          >
            <RefreshCw size={15} />
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Filters */}
        <div className="inventory-filters">
          <div className="inventory-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search medicine, batch or manufacturer..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            aria-label="Filter by stock status"
          >
            <option value="all">All stock levels</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
            <option value="available">In stock</option>
          </select>

          <select
            value={expiryFilter}
            onChange={(event) => setExpiryFilter(event.target.value)}
            aria-label="Filter by expiry status"
          >
            <option value="all">All expiry dates</option>
            <option value="expired">Expired</option>
            <option value="soon">Expiring soon</option>
            <option value="valid">Valid</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              className="btn small secondary"
              onClick={clearFilters}
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {isError && (
          <div className="inventory-error">
            <AlertTriangle size={17} />
            <span>
              {error?.data?.message ||
                error?.error ||
                "Failed to load inventory."}
            </span>

            <button
              type="button"
              className="btn small secondary"
              onClick={refetch}
            >
              Retry
            </button>
          </div>
        )}

        <div className="inventory-result-count">
          Showing {inventory.length} of {medicines.length} loaded medicines
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Quantity</th>
                <th>Reorder level</th>
                <th>Expiry date</th>
                <th>Stock status</th>
                <th>Expiry status</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    Loading inventory...
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    {medicines.length === 0
                      ? "No medicines available."
                      : "No medicines match your filters."}
                  </td>
                </tr>
              ) : (
                inventory.map((medicine) => {
                  const stockStatus = getStockStatus(medicine);
                  const expiryStatus = getExpiryStatus(medicine);

                  return (
                    <tr key={medicine._id}>
                      <td>
                        <div className="inventory-medicine">
                          <Package size={16} />
                          <div>
                            <strong>{medicine.name}</strong>
                            {medicine.manufacturer && (
                              <small>{medicine.manufacturer}</small>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>{medicine.batch || "—"}</td>
                      <td>{Number(medicine.quantity || 0)}</td>
                      <td>{Number(medicine.reorder || 0)}</td>
                      <td>{formatDate(medicine.expiry)}</td>

                      <td>
                        <span
                          className={`pill ${
                            stockStatus === "In stock"
                              ? "green-pill"
                              : "red-pill"
                          }`}
                        >
                          {stockStatus}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`pill ${
                            expiryStatus === "Valid"
                              ? "green-pill"
                              : expiryStatus === "Unknown"
                                ? "orange-pill"
                                : "red-pill"
                          }`}
                        >
                          {expiryStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {isFetching && !isLoading && (
          <p className="muted inventory-refreshing">
            Updating inventory...
          </p>
        )}
      </div>
    </>
  );
}

export default InventoryPage;
