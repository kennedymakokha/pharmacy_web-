
import React, { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  FileBarChart,
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  Wallet,
} from "lucide-react";

import { useGetSalesQuery } from "../../app/services/saleApi";
import { useGetMedicinesQuery } from "../../app/services/medicineApi";
import { useGetPurchasesQuery } from "../../app/services/purchaseApi";

const money = value =>
  `KSh ${Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getRecords = response => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.sales)) return response.sales;
  if (Array.isArray(response?.medicines)) return response.medicines;
  if (Array.isArray(response?.purchases)) return response.purchases;
  return [];
};

const getSaleAmount = sale =>
  Number(
    sale.amount ??
    sale.totalAmount ??
    sale.total ??
    sale.grandTotal ??
    0
  );

const getPurchaseAmount = purchase =>
  Number(
    purchase.amount ??
    purchase.totalAmount ??
    purchase.total ??
    purchase.grandTotal ??
    0
  );

const formatDate = value => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function ReportsPage() {
  const [type, setType] = useState("Sales report");

  const {
    data: salesResponse,
    isLoading: salesLoading,
    isError: salesError,
  } = useGetSalesQuery({ page: 1, limit: 1000 });

  const {
    data: medicinesResponse,
    isLoading: medicinesLoading,
    isError: medicinesError,
  } = useGetMedicinesQuery({ page: 1, limit: 1000, search: "" });

  const {
    data: purchasesResponse,
    isLoading: purchasesLoading,
    isError: purchasesError,
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

  const loading = salesLoading || medicinesLoading || purchasesLoading;
  const hasError = salesError || medicinesError || purchasesError;

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
    (sum, medicine) => sum + Number(medicine.quantity || 0),
    0
  );

  const expiredMedicines = medicines.filter(medicine => {
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
    "Inventory report": `${medicines.length} medicine records with ${totalUnits.toLocaleString("en-KE")} units currently in stock.`,
    "Purchase report": `${purchases.length} purchase records. Total recorded purchases: ${money(totalPurchases)}.`,
    "Expired medicines": `${expiredMedicines.length} expired medicine records found.`,
    "Financial summary": `Recorded sales: ${money(totalSales)}. Recorded purchases: ${money(totalPurchases)}.`,
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
          {sales.length ? (
            sales.map((sale, index) => (
              <tr key={sale._id || sale.id || index}>
                <td>{formatDate(sale.createdAt || sale.date)}</td>
                <td>
                  {sale.reference ||
                    sale.invoiceNumber ||
                    sale.saleNumber ||
                    "—"}
                </td>
                <td>
                  {sale.customerName ||
                    sale.customer?.name ||
                    "Walk-in Customer"}
                </td>
                <td>{sale.paymentMethod || sale.paymentType || "—"}</td>
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
          </tr>
        </thead>

        <tbody>
          {medicines.length ? (
            medicines.map((medicine, index) => (
              <tr key={medicine._id || medicine.id || index}>
                <td>{medicine.name}</td>
                <td>
                  {medicine.category?.name ||
                    medicine.category ||
                    "—"}
                </td>
                <td>{medicine.batch || "—"}</td>
                <td>{formatDate(medicine.expiry)}</td>
                <td>{Number(medicine.quantity || 0).toLocaleString("en-KE")}</td>
                <td>{money(medicine.price)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No inventory records found.</td>
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
          {purchases.length ? (
            purchases.map((purchase, index) => (
              <tr key={purchase._id || purchase.id || index}>
                <td>{formatDate(purchase.createdAt || purchase.date)}</td>
                <td>
                  {purchase.medicineName ||
                    purchase.medicine?.name ||
                    "—"}
                </td>
                <td>
                  {purchase.supplierName ||
                    purchase.supplier?.name ||
                    purchase.supplier ||
                    "—"}
                </td>
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
          {expiredMedicines.length ? (
            expiredMedicines.map((medicine, index) => (
              <tr key={medicine._id || medicine.id || index}>
                <td>{medicine.name}</td>
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
      </div>

      <div className="report-financial-card">
        <ShoppingCart size={22} />
        <span>Total purchases</span>
        <strong>{money(totalPurchases)}</strong>
      </div>

      <div className="report-financial-card">
        <Wallet size={22} />
        <span>Sales less purchases</span>
        <strong>{money(totalSales - totalPurchases)}</strong>
      </div>

      <p className="muted report-note">
        Sales less purchases is a simple comparison, not net profit.
        It excludes operating expenses, taxes, and other costs.
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

  return (
    <div className="panel reports-page">
      <div className="toolbar no-print">
        <div>
          <h3>Generate reports</h3>
          <p className="muted">
            Choose a report category to review pharmacy records.
          </p>
        </div>

        <select
          value={type}
          onChange={e => setType(e.target.value)}
        >
          {reportTypes.map(report => (
            <option key={report} value={report}>
              {report}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="empty-state">
          Loading report data...
        </div>
      ) : hasError ? (
        <div className="empty-state error">
          Unable to load all report data. Check your API connection and try again.
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default ReportsPage;
