
import React, { useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Users,
  Phone,
} from "lucide-react";

import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from "../../app/services/customerApi";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
};

const getErrorMessage = (error) =>
  error?.data?.message ||
  error?.error ||
  "Something went wrong. Please try again.";

function CustomersPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    data: customersResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetCustomersQuery({
    page: 1,
    limit: 100,
    search,
  });

  const [createCustomer, { isLoading: creating }] =
    useCreateCustomerMutation();

  const [updateCustomer, { isLoading: updating }] =
    useUpdateCustomerMutation();

  const [deleteCustomer, { isLoading: deleting }] =
    useDeleteCustomerMutation();

  const customers = customersResponse?.data || [];
  const saving = creating || updating;

  const openAddForm = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const openEditForm = (customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });
    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setForm(emptyForm);
    setFormError("");
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
    };

    if (!payload.name || !payload.phone) {
      setFormError("Customer name and phone number are required.");
      return;
    }

    try {
      if (editingCustomer) {
        await updateCustomer({
          id: editingCustomer._id,
          ...payload,
        }).unwrap();

        setSuccessMessage("Customer updated successfully.");
      } else {
        await createCustomer(payload).unwrap();
        setSuccessMessage("Customer added successfully.");
      }

      closeForm();
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Delete customer "${customer.name}"?`
    );

    if (!confirmed) return;

    setSuccessMessage("");
    setFormError("");

    try {
      await deleteCustomer(customer._id).unwrap();
      setSuccessMessage("Customer deleted successfully.");
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  return (
    <div className="panel">
      <div className="toolbar">
        <p className="muted">
          Maintain customer details and purchase history.
        </p>

        <button
          type="button"
          className="btn primary"
          onClick={openAddForm}
        >
          <Plus size={17} />
          Add customer
        </button>
      </div>

      {successMessage && (
        <div className="customer-message success">
          {successMessage}
        </div>
      )}

      {formError && !showForm && (
        <div className="customer-message error">
          {formError}
        </div>
      )}

      {showForm && (
        <form className="customer-form" onSubmit={handleSubmit}>
          <div className="customer-form-heading">
            <div>
              <h3>
                {editingCustomer ? "Edit customer" : "Add new customer"}
              </h3>
              <p className="muted">
                Enter the customer's contact information.
              </p>
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={closeForm}
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>

          <div className="customer-form-grid">
            <label className="customer-field">
              <span>Full name *</span>
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Customer name"
                required
              />
            </label>

            <label className="customer-field">
              <span>Phone number *</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="e.g. 07XXXXXXXX"
                required
              />
            </label>

            <label className="customer-field">
              <span>Email address</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="customer@example.com"
              />
            </label>

            <label className="customer-field">
              <span>Address</span>
              <input
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Customer address"
              />
            </label>
          </div>

          {formError && (
            <div className="customer-message error">
              {formError}
            </div>
          )}

          <div className="customer-form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={closeForm}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingCustomer
                  ? "Save changes"
                  : "Add customer"}
            </button>
          </div>
        </form>
      )}

      <div className="customer-toolbar">
        <div className="customer-search">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn secondary"
          onClick={refetch}
          disabled={isFetching}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {isError && (
        <div className="customer-message error">
          {getErrorMessage(error)}
          <button
            type="button"
            className="btn small secondary"
            onClick={refetch}
          >
            Retry
          </button>
        </div>
      )}

      <div className="customer-result-count">
        {customers.length} customer{customers.length === 1 ? "" : "s"} found
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Visits</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="empty-cell">
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-cell">
                  <div className="customer-empty">
                    <Users size={24} />
                    <span>No customers found.</span>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <strong>{customer.name}</strong>
                  </td>

                  <td>
                    <span className="customer-phone">
                      <Phone size={14} />
                      {customer.phone}
                    </span>
                  </td>

                  <td>{customer.email || "—"}</td>
                  <td>{Number(customer.visits || 0)}</td>

                  <td>
                    <div className="customer-actions">
                      <button
                        type="button"
                        className="btn small secondary"
                        onClick={() => openEditForm(customer)}
                        title="Edit customer"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn small danger"
                        onClick={() => handleDelete(customer)}
                        disabled={deleting}
                        title="Delete customer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFetching && !isLoading && (
        <p className="muted customer-refreshing">
          Updating customers...
        </p>
      )}
    </div>
  );
}

export default CustomersPage;
