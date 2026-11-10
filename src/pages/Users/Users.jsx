
import React, { useMemo, useState } from "react";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Phone,
  Mail,
  Briefcase,
  AlertCircle,
} from "lucide-react";

import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../../app/services/userApi";

const ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "receptionist", label: "Receptionist" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "patient", label: "Patient" },
  { value: "lab_tech", label: "Lab Technician" },
  { value: "finance", label: "Finance" },
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "on-leave", label: "On Leave" },
  { value: "inactive", label: "Inactive" },
];

const initialForm = {
  name: "",
  phone_number: "",
  email: "",
  password: "",
  role: "nurse",
  specialty: "",
  qualification: "",
  experience: 0,
  status: "active",
  schedule: "",
};

const getRoleLabel = (role) =>
  ROLES.find((item) => item.value === role)?.label || role || "N/A";

const getStatusClass = (status) => {
  switch (status) {
    case "active":
      return "status-active";
    case "on-leave":
      return "status-warning";
    default:
      return "status-inactive";
  }
};

const getErrorMessage = (error) =>
  error?.data?.message ||
  error?.data?.error ||
  error?.error ||
  "Something went wrong. Please try again.";

function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  const limit = 10;

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search,
      role: roleFilter,
    }),
    [page, search, roleFilter]
  );

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetUsersQuery(queryParams);

  const [createUser, { isLoading: creating }] =
    useCreateUserMutation();

  const [updateUser, { isLoading: updating }] =
    useUpdateUserMutation();

  const [deleteUser, { isLoading: deleting }] =
    useDeleteUserMutation();

  const users = response?.data || [];
  const pagination = response?.pagination || {
    total: 0,
    page: 1,
    limit,
    totalPages: 1,
  };

  const isSaving = creating || updating;

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(initialForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      name: user.name || "",
      phone_number: user.phone_number || "",
      email: user.email || "",
      password: "",
      role: user.role || "nurse",
      specialty: user.specialty || "",
      qualification: user.qualification || "",
      experience: user.experience || 0,
      status: user.status || "active",
      schedule: user.schedule || "",
    });

    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;

    setModalOpen(false);
    setEditingUser(null);
    setForm(initialForm);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "experience" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Staff member name is required.");
      return;
    }

    if (!form.phone_number.trim()) {
      setFormError("Phone number is required.");
      return;
    }

    if (!editingUser && !form.password.trim()) {
      setFormError(
        "Password is required. Leave it blank only when editing an existing account."
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone_number: form.phone_number.trim(),
      email: form.email.trim(),
      role: form.role,
      specialty: form.specialty.trim(),
      qualification: form.qualification.trim(),
      experience: Number(form.experience) || 0,
      status: form.status,
      schedule: form.schedule.trim(),
    };

    if (form.password.trim()) {
      payload.password = form.password;
    }

    try {
      if (editingUser) {
        await updateUser({
          id: editingUser.uuid,
          ...payload,
        }).unwrap();
      } else {
        await createUser(payload).unwrap();
      }

      setModalOpen(false);
      setEditingUser(null);
      setForm(initialForm);
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${user.name}?`
    );

    if (!confirmed) return;

    try {
      await deleteUser(user.uuid).unwrap();

      if (users.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      }
    } catch (err) {
      window.alert(getErrorMessage(err));
    }
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleRoleFilter = (event) => {
    setRoleFilter(event.target.value);
    setPage(1);
  };

  return (
    <div className="users-page">
      <div className="panel">
        <div className="panel-head">
          <h3>
            <Users />
            Staff accounts and roles
          </h3>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateModal}
          >
            <Plus size={17} />
            Add staff
          </button>
        </div>

        <div className="users-toolbar">
          <div className="users-search">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search by name, phone, email or ID..."
              value={search}
              onChange={handleSearch}
            />
          </div>

          <select
            value={roleFilter}
            onChange={handleRoleFilter}
            className="users-filter"
          >
            <option value="">All roles</option>

            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-outline"
            onClick={refetch}
            disabled={isFetching}
            title="Refresh staff"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "spin" : ""}
            />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="users-state">
            <RefreshCw className="spin" size={28} />
            <p>Loading staff accounts...</p>
          </div>
        ) : isError ? (
          <div className="users-state users-error">
            <AlertCircle size={30} />
            <p>{getErrorMessage(error)}</p>

            <button
              type="button"
              className="btn btn-outline"
              onClick={refetch}
            >
              Try again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="users-state">
            <Users size={34} />
            <h3>No staff accounts found</h3>
            <p>
              {search || roleFilter
                ? "Try changing your search or role filter."
                : "Add your first staff account to get started."}
            </p>

            {!search && !roleFilter && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={openCreateModal}
              >
                <Plus size={16} />
                Add staff
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Staff member</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Staff ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.uuid || user._id}>
                      <td>
                        <div className="staff-name-cell">
                          <div className="staff-avatar">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div>
                            <strong>{user.name}</strong>
                            {user.specialty && (
                              <small>{user.specialty}</small>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="staff-contact">
                          <span>
                            <Phone size={13} />
                            {user.phone_number || "N/A"}
                          </span>

                          {user.email && (
                            <span>
                              <Mail size={13} />
                              {user.email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="role-label">
                          <ShieldCheck size={14} />
                          {getRoleLabel(user.role)}
                        </span>
                      </td>

                      <td>
                        {typeof user.department === "object"
                          ? user.department?.name || "N/A"
                          : "N/A"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            user.status
                          )}`}
                        >
                          {user.status || "Unknown"}
                        </span>
                      </td>

                      <td>{user.uuid || "N/A"}</td>

                      <td>
                        <div className="staff-actions">
                          <button
                            type="button"
                            className="icon-action"
                            title="Edit staff"
                            onClick={() => openEditModal(user)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="icon-action danger"
                            title="Deactivate staff"
                            disabled={deleting}
                            onClick={() => handleDelete(user)}
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

            <div className="users-pagination">
              <span>
                Showing {users.length} of {pagination.total} staff members
              </span>

              <div>
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((previous) => previous - 1)}
                >
                  <ChevronLeft size={17} />
                </button>

                <span>
                  Page {pagination.page || page} of{" "}
                  {Math.max(pagination.totalPages || 1, 1)}
                </span>

                <button
                  type="button"
                  className="pagination-btn"
                  disabled={
                    page >= (pagination.totalPages || 1) || isFetching
                  }
                  onClick={() => setPage((previous) => previous + 1)}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div className="users-modal-overlay" onMouseDown={closeModal}>
          <div
            className="users-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="users-modal-header">
              <div>
                <h3>
                  {editingUser ? "Edit staff account" : "Add staff member"}
                </h3>

                <p>
                  {editingUser
                    ? "Update staff information and account role."
                    : "Create a new staff account for your pharmacy."}
                </p>
              </div>

              <button
                type="button"
                className="icon-action"
                onClick={closeModal}
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="users-form-grid">
                <label>
                  Full name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </label>

                <label>
                  Phone number *
                  <input
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleChange}
                    placeholder="07XXXXXXXX"
                    required
                  />
                </label>

                <label>
                  Email address
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="staff@example.com"
                  />
                </label>

                <label>
                  Role *
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Password {!editingUser && "*"}
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current password"
                        : "Enter initial password"
                    }
                    required={!editingUser}
                    autoComplete="new-password"
                  />
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Specialty
                  <input
                    name="specialty"
                    value={form.specialty}
                    onChange={handleChange}
                    placeholder="e.g. Clinical pharmacy"
                  />
                </label>

                <label>
                  Qualification
                  <input
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    placeholder="e.g. BSc Pharmacy"
                  />
                </label>

                <label>
                  Experience (years)
                  <input
                    type="number"
                    min="0"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Work schedule
                  <input
                    name="schedule"
                    value={form.schedule}
                    onChange={handleChange}
                    placeholder="e.g. Monday - Friday"
                  />
                </label>
              </div>

              {formError && (
                <div className="users-form-error">
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}

              <div className="users-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingUser ? (
                        <Pencil size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                      {editingUser ? "Save changes" : "Create account"}
                    </>
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

export default UsersPage;
