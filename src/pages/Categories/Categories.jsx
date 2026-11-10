
import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Tags,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Modal from "../../components/Modal";

import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "./../../app/services/categoryApi";

const PAGE_LIMIT = 10;

function getErrorMessage(error) {
  if (!error) return "Something went wrong. Please try again.";

  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetCategoriesQuery({ page, limit: PAGE_LIMIT });

  const [createCategory, { isLoading: creating }] =
    useCreateCategoryMutation();

  const [updateCategory, { isLoading: updating }] =
    useUpdateCategoryMutation();

  const [deleteCategory, { isLoading: deleting }] =
    useDeleteCategoryMutation();

  const categories = response?.data || [];
  const pagination = response?.pagination || {};

  const total = pagination.total ?? categories.length;
  const totalPages = pagination.totalPages ?? 1;
  const currentPage = pagination.page ?? page;

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return categories;

    return categories.filter((category) =>
      `${category.name || ""} ${category.uuid || ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [categories, search]);

  const isSaving = creating || updating;

  function showMessage(text, type = "success") {
    setMessage(text);
    setMessageType(type);

    window.setTimeout(() => {
      setMessage("");
    }, 3500);
  }

  function openCreateModal() {
    setEditing(null);
    setCategoryName("");
    setModalOpen(true);
  }

  function openEditModal(category) {
    setEditing(category);
    setCategoryName(category.name || "");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setCategoryName("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const name = categoryName.trim();

    if (!name) {
      showMessage("Please enter a category name.", "error");
      return;
    }

    try {
      if (editing) {
        await updateCategory({
          id: editing._id,
          name,
        }).unwrap();

        showMessage("Category updated successfully.");
      } else {
        await createCategory({ name }).unwrap();

        showMessage("Category created successfully.");
        setPage(1);
      }

      closeModal();
    } catch (err) {
      showMessage(getErrorMessage(err), "error");
    }
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteCategory(category._id).unwrap();

      showMessage("Category deleted successfully.");

      if (categories.length === 1 && page > 1) {
        setPage((old) => old - 1);
      }
    } catch (err) {
      showMessage(getErrorMessage(err), "error");
    }
  }

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="categories-page">
      {message && (
        <div
          className={`category-message ${
            messageType === "error" ? "error" : "success"
          }`}
        >
          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Professional page header */}
      <div className="category-header">
        <div className="category-header-top">
          <div className="category-heading">
            <div className="category-heading-icon">
              <Tags size={21} />
            </div>

            <div>
              <h2>Categories</h2>
              <p>
                Manage and organise the categories used for your medicines.
              </p>
            </div>
          </div>

          <div className="category-actions">
            <button
              type="button"
              className="btn secondary category-header-btn"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                size={16}
                className={isFetching ? "spin" : ""}
              />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="btn primary category-header-btn"
              onClick={openCreateModal}
            >
              <Plus size={17} />
              <span>Add category</span>
            </button>
          </div>
        </div>

        <div className="category-header-bottom">
          <div className="category-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                className="category-search-clear"
                onClick={() => handleSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="category-summary">
            <div className="category-summary-icon">
              <Tags size={21} />
            </div>

            <div>
              <small>Total categories</small>
              <h3>{total}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Categories table */}
      <div className="panel category-panel">
        <div className="panel-header">
          <div>
            <h3>Medicine categories</h3>
            <p>Manage the categories used to organise medicines.</p>
          </div>

          {isFetching && !isLoading && (
            <span className="category-fetching">
              Updating...
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="category-loading">
            <RefreshCw size={24} className="spin" />
            <p>Loading categories...</p>
          </div>
        ) : isError ? (
          <div className="category-error">
            <p>{getErrorMessage(error)}</p>

            <button
              type="button"
              className="btn primary"
              onClick={() => refetch()}
            >
              <RefreshCw size={16} />
              <span>Try again</span>
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="category-empty">
            <div className="category-empty-icon">
              <Tags size={30} />
            </div>

            <h3>
              {search
                ? "No matching categories"
                : "No categories found"}
            </h3>

            <p>
              {search
                ? "Try another search term."
                : "Create your first medicine category to get started."}
            </p>

            {!search && (
              <button
                type="button"
                className="btn primary"
                onClick={openCreateModal}
              >
                <Plus size={17} />
                <span>Add category</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Reference</th>
                    <th>Date created</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category._id}>
                      <td>
                        <div className="category-name-cell">
                          <div className="category-row-icon">
                            <Tags size={17} />
                          </div>

                          <strong>{category.name}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="category-reference">
                          {category.uuid || category._id}
                        </span>
                      </td>

                      <td>
                        {category.createdAt
                          ? new Date(
                              category.createdAt
                            ).toLocaleDateString("en-KE", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      <td>
                        <span className="category-status">
                          Active
                        </span>
                      </td>

                      <td>
                        <div className="category-row-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            title="Edit category"
                            onClick={() => openEditModal(category)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="icon-btn danger"
                            title="Delete category"
                            onClick={() => handleDelete(category)}
                            disabled={deleting}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="category-pagination">
              <span>
                Page {currentPage} of {totalPages}
                {" · "}
                {total} categories
              </span>

              <div>
                <button
                  type="button"
                  className="icon-btn"
                  disabled={currentPage <= 1 || isFetching}
                  onClick={() =>
                    setPage((old) => Math.max(1, old - 1))
                  }
                  title="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  disabled={
                    currentPage >= totalPages || isFetching
                  }
                  onClick={() =>
                    setPage((old) =>
                      Math.min(totalPages, old + 1)
                    )
                  }
                  title="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <Modal
          title={editing ? "Edit category" : "Add category"}
          onClose={closeModal}
        >
          <form
            className="form-grid"
            onSubmit={handleSubmit}
          >
            <label>
              Category name

              <input
                type="text"
                placeholder="e.g. Dermatology"
                value={categoryName}
                onChange={(e) =>
                  setCategoryName(e.target.value)
                }
                required
                autoFocus
              />
            </label>

            {editing && (
              <div className="category-edit-reference">
                Reference: {editing.uuid || editing._id}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={closeModal}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn primary"
                disabled={isSaving || !categoryName.trim()}
              >
                {isSaving
                  ? "Saving..."
                  : editing
                    ? "Update category"
                    : "Save category"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
