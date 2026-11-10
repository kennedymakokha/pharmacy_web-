import React from "react";
import { X } from "lucide-react";

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="modal-head">
          <h3>{title}</h3>

          <button className="icon-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Modal;