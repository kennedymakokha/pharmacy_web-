import React, { useEffect, useMemo, useRef, useState } from "react";

import { useGetCustomersQuery } from "../../app/services/customerApi";
import {
  Pill,
  ShoppingCart,
  Plus,
  CreditCard,
  FileText,
  X,
  Minus,
  Loader2,
  Search,
  CheckCircle,
} from "lucide-react";

import { useGetMedicinesQuery } from "../../app/services/medicineApi";
import {
  useGetSalesQuery,
  useCreateSaleMutation,
} from "../../app/services/saleApi";

const money = (amount) =>
  `KSh ${Number(amount || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getErrorMessage = (error) =>
  error?.data?.message || error?.error || "Something went wrong.";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function SalesPage() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerOptions, setShowCustomerOptions] = useState(false);

  const customerSelectRef = useRef(null);

  const {
    data: customerResponse,
    isFetching: customersLoading,
    isError: customersError,
  } = useGetCustomersQuery(
    {
      page: 1,
      limit: 10,
      search: customerSearch.trim(),
    },
    {
      skip: customerSearch.trim().length < 2 || !!selectedCustomer,
    },
  );

  const customers = Array.isArray(customerResponse?.data)
    ? customerResponse.data
    : [];
  const {
    data: medicineResponse,
    isLoading: medicinesLoading,
    isError: medicinesError,
  } = useGetMedicinesQuery({
    page: 1,
    limit: 1000,
    search: "",
    category: "",
  });

  const { data: salesResponse, isLoading: salesLoading } = useGetSalesQuery({
    page: 1,
    limit: 10,
  });

  const [createSale, { isLoading: completingSale }] = useCreateSaleMutation();

  const medicines = Array.isArray(medicineResponse?.data)
    ? medicineResponse.data
    : [];

  const sales = Array.isArray(salesResponse?.data) ? salesResponse.data : [];

  const availableMedicines = useMemo(() => {
    const term = search.trim().toLowerCase();

    return medicines.filter((medicine) => {
      const matchesSearch =
        !term ||
        medicine.name?.toLowerCase().includes(term) ||
        medicine.batch?.toLowerCase().includes(term);

      return matchesSearch && Number(medicine.quantity) > 0;
    });
  }, [medicines, search]);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const paid = amountPaid === "" ? total : Number(amountPaid);
  const change = Math.max(0, paid - total);

  const addToCart = (medicine) => {
    setErrorMessage("");
    setSuccessMessage("");

    setCart((oldCart) => {
      const existing = oldCart.find((item) => item.id === medicine._id);

      if (existing) {
        return oldCart.map((item) =>
          item.id === medicine._id
            ? {
                ...item,
                qty: Math.min(Number(medicine.quantity), item.qty + 1),
              }
            : item,
        );
      }

      return [
        ...oldCart,
        {
          id: medicine._id,
          name: medicine.name,
          category: medicine.category?.name || "",
          batch: medicine.batch || "",
          price: Number(medicine.price),
          available: Number(medicine.quantity),
          qty: 1,
        },
      ];
    });
  };

  const updateQuantity = (medicineId, nextQuantity) => {
    setCart((oldCart) =>
      oldCart.map((item) =>
        item.id === medicineId
          ? {
              ...item,
              qty: Math.max(1, Math.min(item.available, nextQuantity)),
            }
          : item,
      ),
    );
  };

  const removeFromCart = (medicineId) => {
    setCart((oldCart) => oldCart.filter((item) => item.id !== medicineId));
  };

  const handleCompleteSale = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!cart.length) {
      setErrorMessage("Add medicines before completing the sale.");
      return;
    }

    const payment = Number(amountPaid === "" ? total : amountPaid);

    if (!Number.isFinite(payment) || payment < total) {
      setErrorMessage("Amount paid cannot be less than the total payable.");
      return;
    }

    try {
      const result = await createSale({
        items: cart.map((item) => ({
          medicine: item.id,
          quantity: item.qty,
        })),
        customer: selectedCustomer?._id || null,
        customerName: selectedCustomer?.name || "Walk-in Customer",
        paymentMethod,
        amountPaid: payment,
      }).unwrap();
      setSuccessMessage(
        `Sale ${result.data?.reference || ""} completed successfully.`,
      );

      setCart([]);
      clearSelectedCustomer();
      setPaymentMethod("cash");
      setAmountPaid("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };
  const handleCustomerSearch = (value) => {
    setCustomerSearch(value);
    setSelectedCustomer(null);
    setShowCustomerOptions(true);
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch("");
    setShowCustomerOptions(false);
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setShowCustomerOptions(false);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        customerSelectRef.current &&
        !customerSelectRef.current.contains(event.target)
      ) {
        setShowCustomerOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <>
      <div className="sales-layout">
        {/* Medicine selection */}
        <div className="panel">
          <div className="panel-head">
            <h3>
              <Pill /> Select medicines
            </h3>
          </div>

          <div className="sales-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search medicine or batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="medicine-pick-list">
            {medicinesLoading ? (
              <div className="empty-state">
                <Loader2 className="spin" size={20} />
                Loading medicines...
              </div>
            ) : medicinesError ? (
              <p className="muted">
                Failed to load medicines. Please refresh and try again.
              </p>
            ) : availableMedicines.length ? (
              availableMedicines.map((medicine) => {
                const cartItem = cart.find((item) => item.id === medicine._id);

                return (
                  <div className="pick-row" key={medicine._id}>
                    <div>
                      <b>{medicine.name}</b>
                      <small>
                        {medicine.category?.name || "Uncategorised"} ·{" "}
                        {medicine.quantity} available
                      </small>
                    </div>

                    <strong>{money(medicine.price)}</strong>

                    <button
                      type="button"
                      className="btn small primary"
                      disabled={cartItem?.qty >= Number(medicine.quantity)}
                      onClick={() => addToCart(medicine)}
                    >
                      <Plus size={15} />
                      Add
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="muted">
                {search
                  ? "No matching medicines in stock."
                  : "No medicines available in stock."}
              </p>
            )}
          </div>
        </div>

        {/* Current sale */}
        <div className="panel">
          <div className="panel-head">
            <h3>
              <ShoppingCart /> Current sale
            </h3>
          </div>

          {cart.length === 0 ? (
            <div className="empty-state">
              Your cart is empty. Add medicines to begin.
            </div>
          ) : (
            <div className="cart-list">
              {cart.map((item) => (
                <div className="cart-row" key={item.id}>
                  <div>
                    <b>{item.name}</b>
                    <small>{money(item.price)} each</small>
                  </div>

                  <div className="qty-control">
                    <button
                      type="button"
                      aria-label={`Decrease ${item.name}`}
                      disabled={item.qty <= 1}
                      onClick={() => updateQuantity(item.id, item.qty - 1)}
                    >
                      <Minus size={13} />
                    </button>

                    <span>{item.qty}</span>

                    <button
                      type="button"
                      aria-label={`Increase ${item.name}`}
                      disabled={item.qty >= item.available}
                      onClick={() => updateQuantity(item.id, item.qty + 1)}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <b>{money(item.price * item.qty)}</b>

                  <button
                    type="button"
                    className="danger-icon"
                    title="Remove item"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="sale-customer-field">
            <label>Customer</label>

            <div className="customer-select" ref={customerSelectRef}>
              {selectedCustomer ? (
                <div className="selected-customer">
                  <div className="selected-customer-info">
                    <b>{selectedCustomer.name}</b>
                    <small>{selectedCustomer.phone}</small>
                  </div>

                  <button
                    type="button"
                    className="customer-clear-btn"
                    onClick={clearSelectedCustomer}
                    title="Remove selected customer"
                    aria-label="Remove selected customer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="customer-select-input">
                    <Search size={16} />

                    <input
                      type="text"
                      placeholder="Search customer by name or phone..."
                      value={customerSearch}
                      onChange={(e) => handleCustomerSearch(e.target.value)}
                      onFocus={() => setShowCustomerOptions(true)}
                      autoComplete="off"
                    />
                  </div>

                  {showCustomerOptions && customerSearch.trim().length >= 2 && (
                    <div className="customer-options">
                      {customersLoading ? (
                        <div className="customer-option-message">
                          <Loader2 size={16} className="spin" />
                          Searching customers...
                        </div>
                      ) : customersError ? (
                        <div className="customer-option-message error">
                          Failed to search customers.
                        </div>
                      ) : customers.length > 0 ? (
                        customers.map((customer) => (
                          <button
                            type="button"
                            className="customer-option"
                            key={customer._id}
                            onClick={() => selectCustomer(customer)}
                          >
                            <span className="customer-option-avatar">
                              {customer.name?.charAt(0)?.toUpperCase() || "C"}
                            </span>

                            <span className="customer-option-details">
                              <b>{customer.name}</b>
                              <small>{customer.phone}</small>
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="customer-option-message">
                          No matching customer found.
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <small className="walk-in-hint">
              {selectedCustomer
                ? "Selected customer will be attached to this sale."
                : "No customer selected — this sale will be recorded as Walk-in Customer."}
            </small>
          </div>

          <div className="sale-customer-field">
            <label>Payment method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="mpesa">M-PESA</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div className="sale-customer-field">
            <label>Amount paid</label>
            <input
              type="number"
              min={total}
              step="0.01"
              placeholder={String(total)}
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
          </div>

          <div className="sale-total">
            <span>Total payable</span>
            <strong>{money(total)}</strong>
          </div>

          <div className="sale-total">
            <span>Change</span>
            <strong>{money(change)}</strong>
          </div>

          {errorMessage && <p className="sale-error">{errorMessage}</p>}

          {successMessage && (
            <p className="sale-success">
              <CheckCircle size={16} />
              {successMessage}
            </p>
          )}

          <button
            type="button"
            className="btn primary full"
            disabled={!cart.length || completingSale}
            onClick={handleCompleteSale}
          >
            {completingSale ? (
              <>
                <Loader2 size={17} className="spin" />
                Processing sale...
              </>
            ) : (
              <>
                <CreditCard size={17} />
                Complete sale
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sales history */}
      <div className="panel">
        <div className="panel-head">
          <h3>
            <FileText /> Sales history
          </h3>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {salesLoading ? (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    Loading sales...
                  </td>
                </tr>
              ) : sales.length ? (
                sales.map((sale) => (
                  <tr key={sale._id}>
                    <td>{sale.reference}</td>
                    <td>{formatDate(sale.createdAt)}</td>
                    <td>{sale.customerName}</td>
                    <td>{sale.items?.length || 0}</td>
                    <td>{money(sale.totalAmount)}</td>
                    <td>{String(sale.paymentMethod || "").toUpperCase()}</td>
                    <td>
                      <span className="pill green-pill">{sale.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    No sales recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
