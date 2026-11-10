
import React, { useMemo, useState } from "react";
import {
  Plus,
  Check,
  Search,
  X,
  RefreshCw,
  Package,
} from "lucide-react";

import { useGetMedicinesQuery } from "../../app/services/medicineApi";
import {
  useGetPurchasesQuery,
  useCreatePurchaseMutation,
  useReceivePurchaseMutation,
} from "../../app/services/purchaseApi";

const getErrorMessage = (error) =>
  error?.data?.message || error?.error || "Something went wrong. Please try again.";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function PurchasesPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({
    supplier: "",
    medicine: "",
    quantity: "1",
    unitCost: "",
  });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    data: purchasesResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetPurchasesQuery({
    page: 1,
    limit: 100,
    search,
    status: statusFilter,
  });

  const {
    data: medicinesResponse,
    isLoading: medicinesLoading,
  } = useGetMedicinesQuery({
    page: 1,
    limit: 1000,
    search: "",
    category: "",
  });

  const [createPurchase, { isLoading: creating }] =
    useCreatePurchaseMutation();

  const [receivePurchase, { isLoading: receiving }] =
    useReceivePurchaseMutation();

  const purchases = purchasesResponse?.data || [];
  const medicines = medicinesResponse?.data || [];

  const selectedMedicine = useMemo(
    () => medicines.find((medicine) => medicine._id === form.medicine),
    [medicines, form.medicine]
  );

  const totalCost =
    Number(form.quantity || 0) * Number(form.unitCost || 0);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError("");
    setSuccessMessage("");
  };

  const resetForm = () => {
    setForm({
      supplier: "",
      medicine: "",
      quantity: "1",
      unitCost: "",
    });
    setFormError("");
  };

  const handleCreatePurchase = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!form.supplier.trim()) {
      setFormError("Enter the supplier name.");
      return;
    }

    if (!form.medicine) {
      setFormError("Select a medicine.");
      return;
    }

    const quantity = Number(form.quantity);
    const unitCost = Number(form.unitCost);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setFormError("Quantity must be a whole number greater than zero.");
      return;
    }

    if (!Number.isFinite(unitCost) || unitCost < 0) {
      setFormError("Enter a valid buying cost.");
      return;
    }

    try {
      await createPurchase({
        supplier: form.supplier.trim(),
        medicine: form.medicine,
        quantity,
        unitCost,
      }).unwrap();

      resetForm();
      setShowForm(false);
      setSuccessMessage("Purchase order created successfully.");
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const handleReceive = async (purchase) => {
    const confirmed = window.confirm(
      `Confirm that ${purchase.quantity} units of ${purchase.medicineName} have been delivered?`
    );

    if (!confirmed) return;

    setSuccessMessage("");
    setFormError("");

    try {
      await receivePurchase(purchase._id).unwrap();
      setSuccessMessage(
        `${purchase.orderNumber} received. Medicine stock has been updated.`
      );
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  return (
    <div className="panel">
      <div className="toolbar">
        <p className="muted">
          Create supplier orders and record deliveries.
        </p>

        <button
          type="button"
          className="btn primary"
          onClick={() => {
            setShowForm((current) => !current);
            setFormError("");
            setSuccessMessage("");
          }}
        >
          {showForm ? <X size={17} /> : <Plus size={17} />}
          {showForm ? "Close form" : "Create purchase order"}
        </button>
      </div>

      {successMessage && (
        <div className="purchase-message success">
          <Check size={16} />
          {successMessage}
        </div>
      )}

      {formError && !showForm && (
        <div className="purchase-message error">{formError}</div>
      )}

      {showForm && (
        <form className="purchase-form" onSubmit={handleCreatePurchase}>
          <div className="purchase-form-heading">
            <div>
              <h3>New purchase order</h3>
              <p className="muted">
                The medicine stock will only increase after delivery is received.
              </p>
            </div>
          </div>

          <div className="purchase-form-grid">
            <label className="purchase-field">
              <span>Supplier name *</span>
              <input
                type="text"
                value={form.supplier}
                onChange={(e) => updateForm("supplier", e.target.value)}
                placeholder="Enter supplier name"
                required
              />
            </label>

            <label className="purchase-field">
              <span>Medicine *</span>
              <select
                value={form.medicine}
                onChange={(e) => updateForm("medicine", e.target.value)}
                required
                disabled={medicinesLoading}
              >
                <option value="">
                  {medicinesLoading ? "Loading medicines..." : "Select medicine"}
                </option>

                {medicines.map((medicine) => (
                  <option key={medicine._id} value={medicine._id}>
                    {medicine.name} — Stock: {medicine.quantity}
                  </option>
                ))}
              </select>
            </label>

            <label className="purchase-field">
              <span>Quantity *</span>
              <input
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(e) => updateForm("quantity", e.target.value)}
                required
              />
            </label>

            <label className="purchase-field">
              <span>Buying cost per unit (KES) *</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unitCost}
                onChange={(e) => updateForm("unitCost", e.target.value)}
                placeholder="0.00"
                required
              />
            </label>
          </div>

          {selectedMedicine && (
            <div className="purchase-stock-info">
              <Package size={17} />
              <span>
                Current stock: <strong>{selectedMedicine.quantity}</strong>
              </span>
              <span>
                New stock after receipt:{" "}
                <strong>
                  {Number(selectedMedicine.quantity || 0) +
                    Math.max(0, Number(form.quantity || 0))}
                </strong>
              </span>
            </div>
          )}

          <div className="purchase-total">
            <span>Order total</span>
            <strong>{formatMoney(totalCost)}</strong>
          </div>

          {formError && (
            <div className="purchase-message error">{formError}</div>
          )}

          <div className="purchase-form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn primary"
              disabled={creating || medicinesLoading}
            >
              {creating ? "Creating..." : "Create order"}
            </button>
          </div>
        </form>
      )}

      <div className="purchase-filters">
        <div className="purchase-search">
          <Search size={17} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, supplier or medicine..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter purchase status"
        >
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Received">Received</option>
        </select>

        <button
          type="button"
          className="btn secondary"
          onClick={refetch}
          disabled={isFetching}
          title="Refresh purchase orders"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {isError && (
        <div className="purchase-message error">
          {getErrorMessage(error)}
          <button type="button" className="btn small secondary" onClick={refetch}>
            Retry
          </button>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order no.</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Medicine</th>
              <th>Quantity</th>
              <th>Total cost</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="empty-cell">
                  Loading purchase orders...
                </td>
              </tr>
            ) : purchases.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-cell">
                  No purchase orders found.
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr key={purchase._id}>
                  <td>{purchase.orderNumber}</td>
                  <td>{formatDate(purchase.createdAt)}</td>
                  <td>{purchase.supplier}</td>
                  <td>{purchase.medicineName}</td>
                  <td>{purchase.quantity}</td>
                  <td>{formatMoney(purchase.totalCost)}</td>

                  <td>
                    <span
                      className={`pill ${
                        purchase.status === "Received"
                          ? "green-pill"
                          : "orange-pill"
                      }`}
                    >
                      {purchase.status}
                    </span>
                  </td>

                  <td>
                    {purchase.status === "Pending" ? (
                      <button
                        type="button"
                        className="btn small secondary"
                        onClick={() => handleReceive(purchase)}
                        disabled={receiving}
                      >
                        <Check size={14} />
                        Mark received
                      </button>
                    ) : (
                      <span className="muted">Received {formatDate(purchase.receivedAt)}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFetching && !isLoading && (
        <p className="muted purchase-refreshing">Refreshing purchase orders...</p>
      )}
    </div>
  );
}

export default PurchasesPage;
