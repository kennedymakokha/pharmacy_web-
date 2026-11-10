
import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  ShieldCheck,
  X,
  Loader2,
  FileText,
  CalendarDays,
  User,
  Pill,
  CheckCircle,
} from "lucide-react";

import { useGetMedicinesQuery } from "../../app/services/medicineApi";

import {
  useGetPrescriptionsQuery,
  useCreatePrescriptionMutation,
  useVerifyPrescriptionMutation,
} from "../../app/services/prescriptionApi";

function PrescriptionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    patient: "",
    medicine: "",
    notes: "",
  });

  const {
    data: prescriptionResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetPrescriptionsQuery({
    page: 1,
    limit: 100,
    search,
    status: statusFilter === "All" ? "" : statusFilter,
  });

  const prescriptions = prescriptionResponse?.data || [];

  const {
    data: medicineResponse,
    isLoading: medicinesLoading,
  } = useGetMedicinesQuery({
    page: 1,
    limit: 1000,
    search: "",
  });

  const medicines = useMemo(() => {
    if (Array.isArray(medicineResponse)) return medicineResponse;
    if (Array.isArray(medicineResponse?.data)) return medicineResponse.data;
    if (Array.isArray(medicineResponse?.medicines)) {
      return medicineResponse.medicines;
    }
    return [];
  }, [medicineResponse]);

  const [createPrescription, { isLoading: isCreating }] =
    useCreatePrescriptionMutation();

  const [verifyPrescription, { isLoading: isVerifying }] =
    useVerifyPrescriptionMutation();

  const pendingCount = prescriptions.filter(
    (item) => item.status === "Pending"
  ).length;

  const verifiedCount = prescriptions.filter(
    (item) => item.status === "Verified"
  ).length;

  const resetForm = () => {
    setForm({
      patient: "",
      medicine: "",
      notes: "",
    });
    setErrorMessage("");
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.patient.trim() || !form.medicine) {
      setErrorMessage("Patient name and medicine are required.");
      return;
    }

    try {
      await createPrescription({
        patient: form.patient.trim(),
        medicine: form.medicine,
        notes: form.notes.trim(),
      }).unwrap();

      closeModal();
      setSuccessMessage("Prescription recorded successfully.");
    } catch (error) {
      setErrorMessage(
        error?.data?.message || "Unable to record prescription."
      );
    }
  };

  const handleVerify = async (prescription) => {
    const confirmed = window.confirm(
      `Verify prescription ${prescription.reference} for ${prescription.patient}?`
    );

    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await verifyPrescription(prescription._id).unwrap();
      setSuccessMessage("Prescription verified successfully.");
    } catch (error) {
      setErrorMessage(
        error?.data?.message || "Unable to verify prescription."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="panel prescriptions-page">
      <div className="toolbar">
        <div>
          <p className="muted">
            Record prescriptions and verify them before dispensing.
          </p>
        </div>

        <button
          className="btn primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={17} />
          New prescription
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

      {/* SUMMARY */}
      <div className="prescription-stats">
        <div className="prescription-stat">
          <span className="prescription-stat-icon">
            <FileText size={19} />
          </span>
          <div>
            <small>Total loaded</small>
            <strong>{prescriptions.length}</strong>
          </div>
        </div>

        <div className="prescription-stat">
          <span className="prescription-stat-icon pending-icon">
            <CalendarDays size={19} />
          </span>
          <div>
            <small>Pending</small>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="prescription-stat">
          <span className="prescription-stat-icon verified-icon">
            <CheckCircle size={19} />
          </span>
          <div>
            <small>Verified</small>
            <strong>{verifiedCount}</strong>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="prescription-filters">
        <div className="supplier-search prescription-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search reference, patient or medicine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {isFetching && <Loader2 size={16} className="spin" />}
        </div>

        <select
          className="prescription-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All prescriptions</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Patient</th>
              <th>Medicine</th>
              <th>Date recorded</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="empty-cell">
                  <Loader2 size={20} className="spin" />
                  Loading prescriptions...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="empty-cell">
                  Failed to load prescriptions. Please refresh.
                </td>
              </tr>
            ) : prescriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-cell">
                  No prescriptions found.
                </td>
              </tr>
            ) : (
              prescriptions.map((prescription) => (
                <tr key={prescription._id}>
                  <td>
                    <strong>{prescription.reference}</strong>
                  </td>

                  <td>{prescription.patient}</td>

                  <td>
                    {prescription.medicineName ||
                      prescription.medicine?.name ||
                      "—"}
                  </td>

                  <td>{formatDate(prescription.createdAt)}</td>

                  <td>
                    <span
                      className={`pill ${
                        prescription.status === "Verified"
                          ? "green-pill"
                          : "orange-pill"
                      }`}
                    >
                      {prescription.status}
                    </span>
                  </td>

                  <td>
                    {prescription.status === "Pending" ? (
                      <button
                        className="btn small secondary"
                        disabled={isVerifying}
                        onClick={() => handleVerify(prescription)}
                      >
                        {isVerifying ? (
                          <Loader2 size={14} className="spin" />
                        ) : (
                          <ShieldCheck size={14} />
                        )}
                        Verify
                      </button>
                    ) : (
                      <span className="muted verified-label">
                        <CheckCircle size={14} />
                        Verified
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD PRESCRIPTION MODAL */}
      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="modal prescription-modal">
            <div className="modal-header">
              <div>
                <h3>New prescription</h3>
                <p className="muted">
                  Record a patient's prescription for verification.
                </p>
              </div>

              <button
                type="button"
                className="icon-btn"
                onClick={closeModal}
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
              <div className="form-group">
                <label>Patient name *</label>
                <div className="prescription-input">
                  <User size={17} />
                  <input
                    name="patient"
                    value={form.patient}
                    onChange={handleChange}
                    placeholder="Enter patient full name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Medicine *</label>
                <div className="prescription-input">
                  <Pill size={17} />

                  <select
                    name="medicine"
                    value={form.medicine}
                    onChange={handleChange}
                    required
                    disabled={medicinesLoading}
                  >
                    <option value="">
                      {medicinesLoading
                        ? "Loading medicines..."
                        : "Select medicine"}
                    </option>

                    {medicines.map((medicine) => (
                      <option
                        key={medicine._id}
                        value={medicine._id}
                      >
                        {medicine.name}
                        {medicine.batch ? ` - ${medicine.batch}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {!medicinesLoading && medicines.length === 0 && (
                  <small className="muted">
                    No medicines available. Register a medicine first.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Prescription notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Dosage, instructions or additional notes..."
                  rows={4}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={closeModal}
                  disabled={isCreating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn primary"
                  disabled={
                    isCreating ||
                    medicinesLoading ||
                    medicines.length === 0
                  }
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Saving...
                    </>
                  ) : (
                    "Save prescription"
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

export default PrescriptionsPage;
