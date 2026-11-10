import  React from  'react'
export function field(
  key,
  label,
  placeholder,
  form,
  setForm,
  required = false,
  type = "text"
) {
  return (
    <label>
      {label}

      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={form[key] ?? ""}
        onChange={event =>
          setForm({
            ...form,
            [key]: event.target.value,
          })
        }
      />
    </label>
  );
}

export function modalTitle(type, editing) {
  return type === "medicine"
    ? editing
      ? "Edit medicine"
      : "Add medicine"
    : type === "order"
    ? "Create purchase order"
    : type === "category"
    ? "Add category"
    : type === "customer"
    ? "Add customer"
    : type === "supplier"
    ? "Add supplier"
    : "Record prescription";
}