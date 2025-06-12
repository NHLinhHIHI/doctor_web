import React, { useEffect, useState } from "react";
import axios from "axios";
import MedicineForm from "./MedicineForm";

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const perPage = 10;
  const [searchTerm, setSearchTerm] = useState("");


  const fetchMedicines = async () => {
    const res = await axios.get("http://localhost:5000/medicine");
    setMedicines(res.data);
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xoá thuốc này không?");
    if (!confirmDelete) return;
    try {  await axios.delete(`http://localhost:5000/medicine/${id}`);
    fetchMedicines();
    alert("Xoá thành công!");
  }catch (error) {
      console.error("Lỗi khi xoá:", error);
      alert("Có lỗi xảy ra khi xoá thuốc.");
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
const currentPageData = filteredMedicines.slice(startIndex, startIndex + perPage);
const totalPages = Math.ceil(filteredMedicines.length / perPage);

  

  return (
    
    <div> <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 20 }}>
  <input
    type="text"
    placeholder="🔍 Tìm thuốc theo tên..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{ padding: 15, width: 300 }}
  />
  <button 
  style={{ padding: 15, width: 300 }}
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
         

          <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
            <thead>
              <tr>
                <th>Tên thuốc</th>
                <th>Liều lượng </th>
                <th>Công dụng cơ bản </th>
                <th>Dạng </th>
                <th>Cách Sử dụng </th>
                <th>Nhà Sản Xuất</th>
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
                    <button onClick={() => handleEdit(m)}>✏️ Sửa</button>{" "}
                    <button onClick={() => handleDelete(m.id)}>🗑️ Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{
  position: "fixed",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 10,
  backgroundColor: "white",
  padding: "5px 15px",
  borderRadius: 10,
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  zIndex: 999
}}>
            {page > 1 && (
              <button onClick={() => setPage(page - 1)}>⬅️ Trước</button>
            )}
  <span>Trang {page}/{totalPages}</span>
  <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>➡️ Tiếp</button>
</div>

        </>
      )}
    </div>
  );
};

export default MedicineList;
