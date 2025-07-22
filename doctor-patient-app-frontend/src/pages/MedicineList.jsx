import React, { useEffect, useState } from "react";
import axios from "axios";
import MedicineForm from "./MedicineForm";
import "./medicineList.css";
import { notifyError, notifySuccess } from "../utils/toastUtils";

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const perPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [medicineToDelete, setMedicineToDelete] = useState(null);
const [sortField, setSortField] = useState(""); // ví dụ: "name", "dosage", "company"
const [sortOrder, setSortOrder] = useState("asc"); // "asc" hoặc "desc"




  const fetchMedicines = async () => {
    const res = await axios.get("http://localhost:5000/medicine");
    setMedicines(res.data);
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = (id) => {
  const medicine = medicines.find(m => m.id === id);
  setMedicineToDelete(medicine);
  setShowDeleteModal(true);
};
const confirmDeleteMedicine = async () => {
  if (!medicineToDelete) return;

  try {
    await axios.delete(`http://localhost:5000/medicine/${medicineToDelete.id}`);
    notifySuccess("Xoá thành công!");
    fetchMedicines();
  } catch (error) {
    console.error("Lỗi khi xoá:", error);
    notifyError("Có lỗi xảy ra khi xoá thuốc.");
  } finally {
    setShowDeleteModal(false);
    setMedicineToDelete(null);
  }
};



  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedMedicine(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    await fetchMedicines();
    setShowForm(false);
  };

  const startIndex = (page - 1) * perPage;
  const filteredMedicines = medicines.filter(m =>
  m.name.toLowerCase().includes(searchTerm.toLowerCase())
);
const sortedMedicines = [...filteredMedicines].sort((a, b) => {
  if (!sortField) return 0;

  const aValue = a[sortField]?.toString().toLowerCase();
  const bValue = b[sortField]?.toString().toLowerCase();

  if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
  if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
  return 0;
});

const currentPageData = sortedMedicines.slice(startIndex, startIndex + perPage);
const handleSort = (field) => {
  if (sortField === field) {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  } else {
    setSortField(field);
    setSortOrder("asc");
  }
};

const totalPages = Math.ceil(filteredMedicines.length / perPage);

  

  return (
    <div className="medicine-list-container">
      <div className="medicine-list-toolbar">
        <input
          type="text"
          placeholder="🔍 Tìm thuốc theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
        className="add-medicine-btn"
        onClick={handleAddNew}>➕ Thêm thuốc mới</button>
      </div>
      {showForm ? (
        <MedicineForm
          medicine={selectedMedicine}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      ) : (
        <>
          <table className="medicine-table" border="1" cellPadding="10">
         <thead>
  <tr>
    <th onClick={() => handleSort("name")}>
      Tên thuốc {sortField === "name" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}
    </th>
    <th onClick={() => handleSort("dosage")}>
      Liều lượng {sortField === "dosage" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}
    </th>
    <th>Công dụng cơ bản</th>
    <th onClick={() => handleSort("unit")}>
      Dạng {sortField === "unit" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}
    </th>
    <th>Cách sử dụng</th>
    <th onClick={() => handleSort("company")}>
      Nhà sản xuất {sortField === "company" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}
    </th>
    <th>Hành động</th>
  </tr>
</thead>

            <tbody>
              {currentPageData.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.dosage}</td>
                  <td>{m.medicine}</td>
                  <td>{m.unit}</td>
                  <td>{m.usage}</td>
                  <td>{m.company}</td>
                  <td>
                    <button className="medicine-action-btn" onClick={() => handleEdit(m)}>✏️ Sửa</button>{" "}
                    <button className="medicine-action-btn" onClick={() => handleDelete(m.id)}>🗑️ Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="medicine-pagination">
            {page > 1 && (
              <button onClick={() => setPage(page - 1)}>⬅️ Trước</button>
            )}
            <span>Trang {page}/{totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>➡️ Tiếp</button>
          </div>
        </>
      )}
      {showDeleteModal && medicineToDelete && (
  <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>Xác nhận xoá thuốc</h3>
      <p>Bạn có chắc chắn muốn xoá thuốc <strong>{medicineToDelete.name}</strong> không?</p>
      <div className="modal-actions">
        <button className="btn btn-danger" onClick={confirmDeleteMedicine}>🗑️ Xoá</button>
        <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>❌ Huỷ</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default MedicineList;
