
import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Truck,
  Loader2,
  Mail,
  Phone,
  MapPin,
  User,
} from "lucide-react";

import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from "../../app/services/supplierApi";

function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    contactPerson: "",
    address: "",
  });

  const {
    data: supplierResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetSuppliersQuery({
    page: 1,
    limit: 100,
    search,
  });

  const suppliers = supplierResponse?.data || [];

  const [createSupplier, { isLoading: isCreating }] =
    useCreateSupplierMutation();

  const [updateSupplier, { isLoading: isUpdating }] =
    useUpdateSupplierMutation();

  const [deleteSupplier, { isLoading: isDeleting }] =
    useDeleteSupplierMutation();

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      contactPerson: "",
      address: "",
    });
    setEditingSupplier(null);
    setErrorMessage("");
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      contactPerson: supplier.contactPerson || "",
      address: supplier.address || "",
    });
    setErrorMessage("");
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.name.trim() || !form.phone.trim()) {
      setErrorMessage("Supplier name and phone are required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      contactPerson: form.contactPerson.trim(),
      address: form.address.trim(),
    };

    try {
      if (editingSupplier) {
        await updateSupplier({
          id: editingSupplier._id,
          ...payload,
        }).unwrap();

        setSuccessMessage("Supplier updated successfully.");
      } else {
        await createSupplier(payload).unwrap();
        setSuccessMessage("Supplier added successfully.");
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      setErrorMessage(
        error?.data?.message || "Unable to save supplier."
      );
    }
  };

  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${supplier.name}?`
    );

    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteSupplier(supplier._id).unwrap();
      setSuccessMessage("Supplier deleted successfully.");
    } catch (error) {
      setErrorMessage(
        error?.data?.message || "Unable to delete supplier."
      );
    }
  };

  const saving = isCreating || isUpdating;

  return (
    <div className="panel">
      <div className="toolbar">
        <div>
          <p className="muted">
            Manage supplier contact details and relationships.
          </p>
          <small className="muted">
            {suppliers.length} supplier{suppliers.length === 1 ? "" : "s"}
          </small>
        </div>

        <button className="btn primary" onClick={openAddModal}>
          <Plus size={17} />
          Add supplier
        </button>
      </div>

      {successMessage && (
        <div className="alert success-alert">
          {successMessage}
        </div>
      )}

      {errorMessage && !showModal && (
        <div className="alert error-alert">
          {errorMessage}
        </div>
      )}

      <div className="supplier-search">
        <Search size={17} />
        <input
          type="text"
          placeholder="Search suppliers by name, phone, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isFetching && <Loader2 size={16} className="spin" />}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact person</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <Loader2 size={20} className="spin" />
                  Loading suppliers...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="empty-cell">
                  Failed to load suppliers. Please refresh.
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-cell">
                  No suppliers found.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier._id}>
                  <td>
                    <div className="supplier-name-cell">
                      <span className="supplier-avatar">
                        {supplier.name?.charAt(0)?.toUpperCase() || "S"}
                      </span>
                      <strong>{supplier.name}</strong>
                    </div>
                  </td>

                  <td>{supplier.contactPerson || "—"}</td>
                  <td>{supplier.phone || "—"}</td>
                  <td>{supplier.email || "—"}</td>
                  <td>{supplier.address || "—"}</td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-btn"
                        title="Edit supplier"
                        onClick={() => openEditModal(supplier)}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        className="icon-btn danger"
                        title="Delete supplier"
                        disabled={isDeleting}
                        onClick={() => handleDelete(supplier)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          <div className="modal supplier-modal">
            <div className="modal-header">
              <div>
                <h3>
                  {editingSupplier ? "Edit supplier" : "Add supplier"}
                </h3>
                <p className="muted">
                  Enter the supplier's contact information.
                </p>
              </div>

              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <X size={19} />
              </button>
            </div>

            {errorMessage && (
              <div className="alert error-alert">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Supplier name *</label>
                  <div className="supplier-input">
                    <Truck size={17} />
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Company or supplier name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone number *</label>
                  <div className="supplier-input">
                    <Phone size={17} />
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Supplier phone number"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email address</label>
                  <div className="supplier-input">
                    <Mail size={17} />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="supplier@example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Contact person</label>
                  <div className="supplier-input">
                    <User size={17} />
                    <input
                      name="contactPerson"
                      value={form.contactPerson}
                      onChange={handleChange}
                      placeholder="Contact person's name"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Address</label>
                  <div className="supplier-input">
                    <MapPin size={17} />
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Supplier physical address"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  disabled={saving}
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Saving...
                    </>
                  ) : editingSupplier ? (
                    "Update supplier"
                  ) : (
                    "Save supplier"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuppliersPage;
