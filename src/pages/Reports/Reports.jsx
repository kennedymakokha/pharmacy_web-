
import React, { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  FileBarChart,
  TrendingUp,
  ShoppingCart,
  Wallet,
  RefreshCw,
} from "lucide-react";

import { useGetSalesQuery } from "../../app/services/saleApi";
import { useGetMedicinesQuery } from "../../app/services/medicineApi";
import { useGetPurchasesQuery } from "../../app/services/purchaseApi";

const money = (value) =>
  `KSh ${Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getRecords = (response) => {
  if (Array.isArray(response)) return response;

  if (!response || typeof response !== "object") return [];

  const possibleKeys = [
    "data",
    "results",
    "records",
    "items",
    "sales",
    "medicines",
    "purchases",
  ];

  for (const key of possibleKeys) {
    const value = response[key];

    if (Array.isArray(value)) return value;

    if (value && typeof value === "object") {
      const nested = getRecords(value);
      if (nested.length > 0) return nested;
    }
  }

  return [];
};

const getSaleAmount = (sale) =>
  Number(
    sale.amount ??
      sale.totalAmount ??
      sale.total ??
      sale.grandTotal ??
      sale.totalPrice ??
      0
  );

const getPurchaseAmount = (purchase) =>
  Number(
    purchase.amount ??
      purchase.totalAmount ??
      purchase.total ??
      purchase.grandTotal ??
      purchase.totalPrice ??
      0
  );

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

const getSaleReference = (sale) =>
  sale.reference ||
  sale.invoiceNumber ||
  sale.saleNumber ||
  sale._id ||
  "—";

const getPurchaseMedicine = (purchase) =>
  purchase.medicineName ||
  purchase.medicine?.name ||
  purchase.name ||
  "—";

const getPurchaseSupplier = (purchase) => {
  if (typeof purchase.supplier === "string") {
    return purchase.supplier;
  }

  return (
    purchase.supplierName ||
    purchase.supplier?.name ||
    "—"
  );
};

function ReportsPage() {
  const [type, setType] = useState("Sales report");

  const {
    data: salesResponse,
    isLoading: salesLoading,
    isFetching: salesFetching,
    isError: salesError,
    error: salesApiError,
    refetch: refetchSales,
  } = useGetSalesQuery({ page: 1, limit: 1000 });

  const {
    data: medicinesResponse,
    isLoading: medicinesLoading,
    isFetching: medicinesFetching,
    isError: medicinesError,
    error: medicinesApiError,
    refetch: refetchMedicines,
  } = useGetMedicinesQuery({ page: 1, limit: 1000 });

  const {
    data: purchasesResponse,
    isLoading: purchasesLoading,
    isFetching: purchasesFetching,
    isError: purchasesError,
    error: purchasesApiError,
    refetch: refetchPurchases,
  } = useGetPurchasesQuery({ page: 1, limit: 1000 });

  const sales = useMemo(
    () => getRecords(salesResponse),
    [salesResponse]
  );

  const medicines = useMemo(
    () => getRecords(medicinesResponse),
    [medicinesResponse]
  );

  const purchases = useMemo(
    () => getRecords(purchasesResponse),
    [purchasesResponse]
  );

  const loading =
    salesLoading || medicinesLoading || purchasesLoading;

  const fetching =
    salesFetching || medicinesFetching || purchasesFetching;

  const refreshReports = () => {
    refetchSales();
    refetchMedicines();
    refetchPurchases();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalSales = sales.reduce(
    (sum, sale) => sum + getSaleAmount(sale),
    0
  );

  const totalPurchases = purchases.reduce(
    (sum, purchase) => sum + getPurchaseAmount(purchase),
    0
  );

  const totalUnits = medicines.reduce(
    (sum, medicine) =>
      sum + Number(medicine.quantity || 0),
    0
  );

  const expiredMedicines = medicines.filter((medicine) => {
    if (!medicine.expiry) return false;

    const expiry = new Date(medicine.expiry);

    if (Number.isNaN(expiry.getTime())) return false;

    expiry.setHours(0, 0, 0, 0);

    return expiry < today;
  });

  const reportTypes = [
    "Sales report",
    "Inventory report",
    "Purchase report",
    "Expired medicines",
    "Financial summary",
  ];

  const reportDescription = {
    "Sales report": `${sales.length} sales transactions recorded. Total sales: ${money(totalSales)}.`,
    "Inventory report": `${medicines.length} medicine records. ${totalUnits.toLocaleString("en-KE")} units in stock.`,
    "Purchase report": `${purchases.length} purchase records. Total purchases: ${money(totalPurchases)}.`,
    "Expired medicines": `${expiredMedicines.length} expired medicine records found.`,
    "Financial summary": `Sales: ${money(totalSales)}. Purchases: ${money(totalPurchases)}.`,
  };

  const renderSalesReport = () => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Reference</th>
            <th>Customer</th>
            <th>Payment</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {sales.length > 0 ? (
            sales.map((sale, index) => (
              <tr key={sale._id || sale.id || index}>
                <td>
                  {formatDate(sale.createdAt || sale.date)}
                </td>
                <td>{getSaleReference(sale)}</td>
                <td>
                  {sale.customerName ||
                    sale.customer?.name ||
                    "Walk-in Customer"}
                </td>
                <td>
                  {sale.paymentMethod ||
                    sale.paymentType ||
                    "—"}
                </td>
                <td>{money(getSaleAmount(sale))}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No sales records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Category</th>
            <th>Batch</th>
            <th>Expiry</th>
            <th>Quantity</th>
            <th>Unit price</th>
            <th>Stock value</th>
          </tr>
        </thead>

        <tbody>
          {medicines.length > 0 ? (
            medicines.map((medicine, index) => {
              const quantity = Number(medicine.quantity || 0);
              const price = Number(medicine.price || 0);

              return (
                <tr key={medicine._id || medicine.id || index}>
                  <td>{medicine.name || "—"}</td>
                  <td>
                    {medicine.category?.name ||
                      medicine.category ||
                      "—"}
                  </td>
                  <td>{medicine.batch || "—"}</td>
                  <td>{formatDate(medicine.expiry)}</td>
                  <td>
                    {quantity.toLocaleString("en-KE")}
                  </td>
                  <td>{money(price)}</td>
                  <td>{money(quantity * price)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7">No inventory records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderPurchaseReport = () => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Medicine</th>
            <th>Supplier</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {purchases.length > 0 ? (
            purchases.map((purchase, index) => (
              <tr key={purchase._id || purchase.id || index}>
                <td>
                  {formatDate(
                    purchase.createdAt || purchase.date
                  )}
                </td>
                <td>{getPurchaseMedicine(purchase)}</td>
                <td>{getPurchaseSupplier(purchase)}</td>
                <td>{purchase.quantity ?? "—"}</td>
                <td>{purchase.status || "—"}</td>
                <td>{money(getPurchaseAmount(purchase))}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No purchase records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderExpiredReport = () => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Batch</th>
            <th>Expiry date</th>
            <th>Quantity</th>
          </tr>
        </thead>

        <tbody>
          {expiredMedicines.length > 0 ? (
            expiredMedicines.map((medicine, index) => (
              <tr key={medicine._id || medicine.id || index}>
                <td>{medicine.name || "—"}</td>
                <td>{medicine.batch || "—"}</td>
                <td>{formatDate(medicine.expiry)}</td>
                <td>{medicine.quantity ?? 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No expired medicines found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderFinancialSummary = () => (
    <div className="report-financial-grid">
      <div className="report-financial-card">
        <TrendingUp size={22} />

        <span>Total sales</span>

        <strong>{money(totalSales)}</strong>
        <small>{sales.length} transactions</small>
      </div>

      <div className="report-financial-card">
        <ShoppingCart size={22} />

        <span>Total purchases</span>

        <strong>{money(totalPurchases)}</strong>
        <small>{purchases.length} purchase records</small>
      </div>

      <div className="report-financial-card">
        <Wallet size={22} />

        <span>Sales less purchases</span>

        <strong>{money(totalSales - totalPurchases)}</strong>
        <small>Simple difference</small>
      </div>

      <p className="muted report-note">
        Sales less purchases is not net profit. It excludes
        operating expenses, taxes, salaries and other costs.
      </p>
    </div>
  );

  const renderReport = () => {
    switch (type) {
      case "Sales report":
        return renderSalesReport();

      case "Inventory report":
        return renderInventoryReport();

      case "Purchase report":
        return renderPurchaseReport();

      case "Expired medicines":
        return renderExpiredReport();

      case "Financial summary":
        return renderFinancialSummary();

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="panel">
        <div className="empty-state">
          Loading report data...
        </div>
      </div>
    );
  }

  return (
    <div className="panel reports-page">
      <div className="toolbar no-print">
        <div>
          <h3>Generate reports</h3>
          <p className="muted">
            Review and print pharmacy reports.
          </p>
        </div>

        <div className="report-actions">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {reportTypes.map((report) => (
              <option key={report} value={report}>
                {report}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn"
            onClick={refreshReports}
            disabled={fetching}
            title="Refresh reports"
          >
            <RefreshCw
              size={16}
              className={fetching ? "spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {(salesError || medicinesError || purchasesError) && (
        <div className="report-errors no-print">
          <strong>Some report data could not be loaded.</strong>

          {salesError && (
            <p>Sales: {salesApiError?.data?.message || salesApiError?.error || "Request failed"}</p>
          )}

          {medicinesError && (
            <p>Inventory: {medicinesApiError?.data?.message || medicinesApiError?.error || "Request failed"}</p>
          )}

          {purchasesError && (
            <p>Purchases: {purchasesApiError?.data?.message || purchasesApiError?.error || "Request failed"}</p>
          )}
        </div>
      )}

      <div className="report-result">
        <div className="report-icon">
          <FileBarChart size={30} />
        </div>

        <div className="report-result-content">
          <h2>{type}</h2>
          <p>{reportDescription[type]}</p>
        </div>

        <button
          type="button"
          className="btn primary no-print"
          onClick={() => window.print()}
        >
          <ArrowDownToLine size={16} />
          Print / Save as PDF
        </button>
      </div>

      <div className="report-content">
        {renderReport()}
      </div>

      <div className="report-footer muted">
        <span>Generated: {formatDate(new Date())}</span>
        <span>Pharmacy Management System</span>
      </div>
    </div>
  );
}

export default ReportsPage;
