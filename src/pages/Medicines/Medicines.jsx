import React, { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import {
  useGetMedicinesQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
} from "../../app/services/medicineApi";

import { useGetCategoriesQuery } from "../../app/services/categoryApi";

const money = (amount) => `KSh ${Number(amount || 0).toLocaleString("en-KE")}`;

const emptyForm = {
  name: "",
  category: "",
  manufacturer: "",
  batch: "",
  expiry: "",
  price: "",
  quantity: "",
  reorder: "10",
};

const errorMessage = (error) =>
  error?.data?.message || error?.error || "Something went wrong.";

export default function MedicinesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const limit = 10;

  // Medicines
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMedicinesQuery({
    page,
    limit,
    search,
  });

  // Existing categories API
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetCategoriesQuery();

  // Support direct arrays and common API response formats
  const categories = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : Array.isArray(categoriesResponse?.data)
      ? categoriesResponse.data
      : Array.isArray(categoriesResponse?.categories)
        ? categoriesResponse.categories
        : [];

  const [createMedicine, { isLoading: creating }] = useCreateMedicineMutation();

  const [updateMedicine, { isLoading: updating }] = useUpdateMedicineMutation();

  const [deleteMedicine, { isLoading: deleting }] = useDeleteMedicineMutation();

  const medicines = response?.data || [];

  const pagination = response?.pagination || {
    total: 0,
    page: 1,
    pages: 1,
  };

  const totalPages = Math.max(
    pagination.pages || pagination.totalPages || 1,
    1,
  );

  const openAdd = () => {
    setEditingMedicine(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (medicine) => {
    setEditingMedicine(medicine);

    setForm({
      name: medicine.name || "",
      category: medicine.category?._id || medicine.category || "",
      manufacturer: medicine.manufacturer || "",
      batch: medicine.batch || "",
      expiry: medicine.expiry
        ? new Date(medicine.expiry).toISOString().slice(0, 10)
        : "",
      price: String(medicine.price ?? ""),
      quantity: String(medicine.quantity ?? ""),
      reorder: String(medicine.reorder ?? 10),
    });

    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (creating || updating) return;

    setModalOpen(false);
    setEditingMedicine(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (
      !form.name.trim() ||
      !form.category ||
      !form.batch.trim() ||
      !form.expiry
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      manufacturer: form.manufacturer.trim(),
      batch: form.batch.trim(),
      expiry: form.expiry,
      price: Number(form.price),
      quantity: Number(form.quantity),
      reorder: Number(form.reorder),
    };

    if (
      !Number.isFinite(payload.price) ||
      !Number.isFinite(payload.quantity) ||
      !Number.isFinite(payload.reorder) ||
      payload.price < 0 ||
      payload.quantity < 0 ||
      payload.reorder < 0
    ) {
      setFormError("Enter valid non-negative price and stock values.");
      return;
    }

    try {
      if (editingMedicine) {
        await updateMedicine({
          id: editingMedicine._id,
          ...payload,
        }).unwrap();
      } else {
        await createMedicine(payload).unwrap();
      }

      setModalOpen(false);
      setEditingMedicine(null);
      setForm(emptyForm);
      setFormError("");
    } catch (err) {
      setFormError(errorMessage(err));
    }
  };

  const handleDelete = async (medicine) => {
    if (!window.confirm(`Are you sure you want to delete ${medicine.name}?`)) {
      return;
    }

    try {
      await deleteMedicine(medicine._id).unwrap();

      if (medicines.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      }
    } catch (err) {
      window.alert(errorMessage(err));
    }
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  return (
    <div className="panel">
      <div className="toolbar">
        <div className="searchbox">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search by medicine, category or batch..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <button className="btn primary" type="button" onClick={openAdd}>
          <Plus size={17} />
          Add medicine
        </button>

        <button
          className="btn"
          type="button"
          onClick={refetch}
          disabled={isFetching}
          title="Refresh medicines"
        >
          <RefreshCw size={16} className={isFetching ? "medicine-spin" : ""} />
        </button>
      </div>

      {isLoading ? (
        <div className="medicine-state">
          <RefreshCw size={25} className="medicine-spin" />
          <p>Loading medicines...</p>
        </div>
      ) : isError ? (
        <div className="medicine-state medicine-error">
          <AlertCircle size={25} />
          <p>{errorMessage(error)}</p>

          <button className="btn primary" onClick={refetch} type="button">
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  <th>Batch no.</th>
                  <th>Expiry date</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {medicines.length > 0 ? (
                  medicines.map((medicine) => (
                    <tr key={medicine._id}>
                      <td>
                        <b>{medicine.name}</b>
                      </td>

                      <td>{medicine.category?.name || "—"}</td>

                      <td>{medicine.manufacturer || "N/A"}</td>

                      <td>{medicine.batch}</td>

                      <td>
                        {medicine.expiry
                          ? new Date(medicine.expiry).toLocaleDateString(
                              "en-KE",
                            )
                          : "N/A"}
                      </td>

                      <td>{money(medicine.price)}</td>

                      <td>
                        <span
                          className={
                            Number(medicine.quantity) <=
                            Number(medicine.reorder)
                              ? "pill red-pill"
                              : "pill green-pill"
                          }
                        >
                          {medicine.quantity}
                        </span>
                      </td>

                      <td>
                        <span className="actions">
                          <button
                            type="button"
                            onClick={() => openEdit(medicine)}
                            title="Edit medicine"
                            aria-label={`Edit ${medicine.name}`}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            className="danger-icon"
                            disabled={deleting}
                            onClick={() => handleDelete(medicine)}
                            title="Delete medicine"
                            aria-label={`Delete ${medicine.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="empty-cell">
                      No medicines found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="medicine-pagination">
            <span>
              Showing {medicines.length} of {pagination.total || 0} medicines
            </span>

            <div>
              <button
                className="btn"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((previous) => previous - 1)}
              >
                Previous
              </button>

              <span>
                {page} / {totalPages}
              </span>

              <button
                className="btn"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((previous) => previous + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {modalOpen && (
        <div className="medicine-modal-overlay" onMouseDown={closeModal}>
          <div
            className="medicine-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="medicine-modal-header">
              <div>
                <h3>{editingMedicine ? "Edit medicine" : "Add medicine"}</h3>

                <p>Enter the medicine and stock information.</p>
              </div>

              <button
                type="button"
                className="medicine-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="medicine-form-grid">
                <label>
                  Medicine name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="medicine-category-field">
                  Category *
                  <div className="medicine-select-wrapper">
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      disabled={categoriesLoading || categories.length === 0}
                      className="medicine-category-select"
                    >
                      <option value="">
                        {categoriesLoading
                          ? "Loading categories..."
                          : categories.length === 0
                            ? "No categories available"
                            : "Select category"}
                      </option>

                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDown size={17} className="medicine-select-icon" />
                  </div>
                  {categoriesError && (
                    <small className="medicine-field-error">
                      Failed to load categories.
                    </small>
                  )}
                </label>

                <label>
                  Manufacturer
                  <input
                    name="manufacturer"
                    value={form.manufacturer}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Batch number *
                  <input
                    name="batch"
                    value={form.batch}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Expiry date *
                  <input
                    type="date"
                    name="expiry"
                    value={form.expiry}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Selling price (KSh) *
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Quantity *
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Reorder level *
                  <input
                    type="number"
                    name="reorder"
                    min="0"
                    value={form.reorder}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              {formError && (
                <div className="medicine-form-error">
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}

              <div className="medicine-modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={closeModal}
                  disabled={creating || updating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn primary"
                  disabled={
                    creating ||
                    updating ||
                    categoriesLoading ||
                    categoriesError ||
                    categories.length === 0
                  }
                >
                  {creating || updating
                    ? "Saving..."
                    : editingMedicine
                      ? "Save changes"
                      : "Create medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
