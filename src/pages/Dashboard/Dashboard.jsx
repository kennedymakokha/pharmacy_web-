
import React, { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  FileBarChart,
  FileText,
  Package,
  Pill,
  Plus,
  ShoppingCart,
  Truck,
  RefreshCw,
} from "lucide-react";

import { useGetMedicinesQuery } from "../../app/services/medicineApi";
import { useGetSalesQuery } from "../../app/services/saleApi";

const money = (amount) =>
  `KSh ${Number(amount || 0).toLocaleString("en-KE", {
    maximumFractionDigits: 2,
  })}`;

const getDateKey = (date) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "—";

  return value.toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Dashboard({ setPage, openAdd }) {
  // ------------------------------------------------
  // MEDICINES
  // ------------------------------------------------

  const {
    data: medicineResponse,
    isLoading: medicinesLoading,
    isError: medicinesError,
    refetch: refetchMedicines,
  } = useGetMedicinesQuery({
    page: 1,
    limit: 1000,
    search: "",
  });

  // ------------------------------------------------
  // SALES
  // ------------------------------------------------

  const {
    data: salesResponse,
    isLoading: salesLoading,
    isError: salesError,
    refetch: refetchSales,
  } = useGetSalesQuery({
    page: 1,
    limit: 100,
  });

  const medicines = Array.isArray(medicineResponse?.data)
    ? medicineResponse.data
    : [];

  const sales = Array.isArray(salesResponse?.data)
    ? salesResponse.data
    : [];

  const loading = medicinesLoading || salesLoading;

  // ------------------------------------------------
  // INVENTORY CALCULATIONS
  // ------------------------------------------------

  const inventory = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const lowStock = medicines.filter((medicine) => {
      const quantity = Number(medicine.quantity || 0);
      const reorder = Number(medicine.reorder ?? 10);

      return quantity <= reorder;
    });

    const expiring = medicines.filter((medicine) => {
      if (!medicine.expiry) return false;

      const expiryDate = new Date(medicine.expiry);

      if (Number.isNaN(expiryDate.getTime())) return false;

      expiryDate.setHours(0, 0, 0, 0);

      return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
    });

    const expired = medicines.filter((medicine) => {
      if (!medicine.expiry) return false;

      const expiryDate = new Date(medicine.expiry);

      if (Number.isNaN(expiryDate.getTime())) return false;

      expiryDate.setHours(0, 0, 0, 0);

      return expiryDate < today;
    });

    const totalStock = medicines.reduce(
      (total, medicine) =>
        total + Number(medicine.quantity || 0),
      0
    );

    return {
      totalMedicines:
        medicineResponse?.pagination?.total ?? medicines.length,
      totalStock,
      lowStock,
      expiring,
      expired,
    };
  }, [medicines, medicineResponse]);

  // ------------------------------------------------
  // SALES CALCULATIONS
  // ------------------------------------------------

  const salesSummary = useMemo(() => {
    const today = new Date();
    const todayKey = getDateKey(today);

    const todaySales = sales
      .filter((sale) => getDateKey(sale.createdAt) === todayKey)
      .reduce(
        (total, sale) => total + Number(sale.totalAmount || 0),
        0
      );

    // Build the last seven calendar days.
    const days = [];

    for (let index = 6; index >= 0; index--) {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - index);

      days.push({
        key: getDateKey(date),
        label: date.toLocaleDateString("en-KE", {
          weekday: "short",
        }),
        amount: 0,
      });
    }

    const dayMap = new Map(
      days.map((day) => [day.key, day])
    );

    sales.forEach((sale) => {
      const key = getDateKey(sale.createdAt);
      const day = dayMap.get(key);

      if (day) {
        day.amount += Number(sale.totalAmount || 0);
      }
    });

    const weeklyTotal = days.reduce(
      (total, day) => total + day.amount,
      0
    );

    const maxAmount = Math.max(
      ...days.map((day) => day.amount),
      1
    );

    const points = days.map((day, index) => {
      const x = index * 100;
      const y = 155 - (day.amount / maxAmount) * 130;

      return `${x},${y}`;
    });

    return {
      todaySales,
      days,
      weeklyTotal,
      points: points.join(" "),
    };
  }, [sales]);

  // ------------------------------------------------
  // SUMMARY CARDS
  // ------------------------------------------------

  const cards = [
    {
      label: "Total medicines",
      value: inventory.totalMedicines,
      note: "Registered records",
      Icon: Pill,
      color: "blue",
      loading: medicinesLoading,
    },
    {
      label: "Today's sales",
      value: money(salesSummary.todaySales),
      note: "Completed transactions",
      Icon: ShoppingCart,
      color: "green",
      loading: salesLoading,
    },
    {
      label: "Low stock items",
      value: inventory.lowStock.length,
      note: "At or below reorder level",
      Icon: Package,
      color: "purple",
      loading: medicinesLoading,
    },
    {
      label: "Expiring soon",
      value: inventory.expiring.length,
      note: "Within the next 30 days",
      Icon: AlertTriangle,
      color: "orange",
      loading: medicinesLoading,
    },
  ];

  // ------------------------------------------------
  // REFRESH
  // ------------------------------------------------

  const handleRefresh = () => {
    refetchMedicines();
    refetchSales();
  };

  return (
    <>
      {/* API ERROR */}
      {(medicinesError || salesError) && (
        <div className="medicine-state medicine-error">
          <AlertTriangle size={20} />

          <p>
            {medicinesError && salesError
              ? "Unable to load dashboard data."
              : medicinesError
                ? "Unable to load medicine inventory."
                : "Unable to load sales information."}
          </p>

          <button
            type="button"
            className="btn primary"
            onClick={handleRefresh}
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="stats-grid">
        {cards.map(({ label, value, note, Icon, color, loading: cardLoading }) => (
          <div className={`stat-card ${color}`} key={label}>
            <div className="stat-icon">
              <Icon size={22} />
            </div>

            <div>
              <span>{label}</span>

              <strong>
                {cardLoading ? (
                  <RefreshCw
                    size={17}
                    className="medicine-spin"
                  />
                ) : (
                  value
                )}
              </strong>

              <small>{note}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* SALES OVERVIEW */}
        <div className="panel sales-panel">
          <div className="panel-head">
            <h3>
              <BarChart3 /> Sales overview
            </h3>

            <span className="muted">
              Last 7 days
            </span>
          </div>

          <div className="sales-chart-summary">
            <span>Sales in the last 7 days</span>
            <strong>
              {salesLoading ? "Loading..." : money(salesSummary.weeklyTotal)}
            </strong>
          </div>

          <div className="chart">
            <div className="chart-y">
              <span>{money(
                Math.max(...salesSummary.days.map((day) => day.amount), 1)
              )}</span>
              <span> </span>
              <span> </span>
              <span> </span>
              <span>KSh 0</span>
            </div>

            <div className="chart-area">
              <div className="grid-lines">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>

              {salesLoading ? (
                <div className="chart-loading">
                  Loading sales chart...
                </div>
              ) : (
                <svg
                  viewBox="0 0 600 170"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points={salesSummary.points}
                    fill="none"
                    stroke="#1673ed"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {salesSummary.days.map((day, index) => {
                    const x = index * 100;
                    const y =
                      155 -
                      (day.amount /
                        Math.max(
                          ...salesSummary.days.map((item) => item.amount),
                          1
                        )) *
                        130;

                    return (
                      <circle
                        key={day.key}
                        cx={x}
                        cy={y}
                        r="4.5"
                        fill="#1673ed"
                      />
                    );
                  })}
                </svg>
              )}

              <div className="chart-x">
                {salesSummary.days.map((day) => (
                  <span key={day.key}>{day.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* INVENTORY SNAPSHOT */}
        <div className="panel">
          <div className="panel-head">
            <h3>
              <Activity /> Inventory snapshot
            </h3>

            <button
              type="button"
              className="text-btn"
              onClick={() => setPage("Inventory")}
            >
              View inventory →
            </button>
          </div>

          <div className="inventory-summary">
            <div>
              <b>
                {medicinesLoading
                  ? "—"
                  : inventory.totalStock.toLocaleString("en-KE")}
              </b>
              <span>Units in stock</span>
            </div>

            <div>
              <b>
                {medicinesLoading ? "—" : inventory.lowStock.length}
              </b>
              <span>Low stock</span>
            </div>

            <div>
              <b>
                {medicinesLoading ? "—" : inventory.expiring.length}
              </b>
              <span>Expiry alerts</span>
            </div>
          </div>

          <div className="mini-alerts">
            {medicinesLoading ? (
              <p className="muted">Loading inventory...</p>
            ) : inventory.lowStock.length > 0 ? (
              inventory.lowStock.slice(0, 3).map((medicine) => (
                <div key={medicine._id}>
                  <span className="dot red" />
                  <span>{medicine.name}</span>
                  <b>{medicine.quantity} left</b>
                </div>
              ))
            ) : (
              <p className="muted">No low-stock items.</p>
            )}
          </div>

          {!medicinesLoading && inventory.expired.length > 0 && (
            <div className="mini-alerts">
              <div>
                <span className="dot red" />
                <span>Expired medicines</span>
                <b>{inventory.expired.length}</b>
              </div>
            </div>
          )}
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="panel table-panel">
          <div className="panel-head">
            <h3>
              <FileText /> Recent transactions
            </h3>

            <button
              type="button"
              className="text-btn"
              onClick={() => setPage("Sales")}
            >
              View all →
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {salesLoading ? (
                  <tr>
                    <td colSpan={5} className="empty-cell">
                      Loading transactions...
                    </td>
                  </tr>
                ) : sales.length > 0 ? (
                  sales.slice(0, 4).map((sale) => (
                    <tr key={sale._id}>
                      <td>{sale.reference}</td>
                      <td>{formatDate(sale.createdAt)}</td>
                      <td>{sale.customerName || "Walk-in Customer"}</td>
                      <td>{money(sale.totalAmount)}</td>
                      <td>
                        <span className="pill green-pill">
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-cell">
                      No transactions recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="panel">
          <div className="panel-head">
            <h3>
              <Activity /> Quick actions
            </h3>
          </div>

          <div className="quick-grid">
            <button
              type="button"
              onClick={() => setPage("Sales")}
            >
              <ShoppingCart />
              New sale
            </button>

            <button
              type="button"
              onClick={() => openAdd("medicine")}
            >
              <Plus />
              Add medicine
            </button>

            <button
              type="button"
              onClick={() => setPage("Purchases")}
            >
              <Truck />
              Create order
            </button>

            <button
              type="button"
              onClick={() => setPage("Reports")}
            >
              <FileBarChart />
              View reports
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
