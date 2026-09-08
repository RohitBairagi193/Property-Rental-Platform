import React, { useEffect } from "react";
import { CircleCheck, CircleAlert, X } from "lucide-react";

const NotificationPopup = ({ message, isOpen, onClose, type = "success" }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed top-20 z-50">
      <div className="bg-white shadow-2xl rounded-2xl px-5 py-4 min-w-80 flex gap-3">
        <div className="w-14 h-14 flex items-center justify-center">
          {isSuccess ? (
            <CircleCheck size={42} className="text-green-600" />
          ) : (
            <CircleAlert size={42} className="text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <h4
            className={`font-semibold ${
              isSuccess ? "text-green-700" : "text-red-700"
            }`}>
            {isSuccess ? "Success" : "Error"}
          </h4>

          <p className="text-sm text-gray-600 mt-1">{message}</p>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default NotificationPopup;
