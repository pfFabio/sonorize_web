export const card = {
  padding: 20,
  margin: "10px auto",
  width: "100%",
  maxWidth: 600,
  borderRadius: 15,
  backgroundColor: "#f9f9f9",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  textAlign: "center",
  boxSizing: "border-box",
};

export const authCard = {
  width: "100%",
  maxWidth: 400,
  padding: "40px 30px",
  borderRadius: 15,
  backgroundColor: "#ffffff",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  textAlign: "center",
};

export const button = {
  backgroundColor: "#007bff",
  color: "white",
  padding: "15px 20px",
  border: "none",
  borderRadius: 5,
  fontSize: 16,
  cursor: "pointer",
  margin: "10px 0",
  width: "100%",
};

export const disabledButton = {
  ...button,
  backgroundColor: "#6c757d",
  cursor: "not-allowed",
};

export const startButton = {
  ...button,
  backgroundColor: "#28a745",
};

export const stopButton = {
  ...button,
  backgroundColor: "#dc3545",
};

export const aiButton = {
  ...button,
  backgroundColor: "#28a745",
  fontWeight: "bold",
};

export const textInput = {
  width: "100%",
  border: "1px solid #ccc",
  padding: 10,
  marginTop: 10,
  minHeight: 100,
  textAlign: "left",
  fontFamily: "sans-serif",
  fontSize: 16,
  boxSizing: "border-box",
  borderRadius: 8,
};

export const input = {
  padding: "12px 15px",
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 16,
  outline: "none",
};

export const label = {
  fontSize: 14,
  fontWeight: "bold",
  color: "#444",
  marginBottom: 8,
};

export const inputGroup = {
  display: "flex",
  flexDirection: "column",
  textAlign: "left",
};

export const title = {
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 20,
};

export const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

export const modalContent = {
  backgroundColor: "white",
  padding: "20px 40px",
  borderRadius: 10,
  boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  textAlign: "center",
};

export const modalTitle = {
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 20,
};

export const modalButton = {
  backgroundColor: "#007bff",
  color: "white",
  padding: "10px 20px",
  border: "none",
  borderRadius: 5,
  fontSize: 16,
  cursor: "pointer",
  margin: "5px 0",
  width: "100%",
};
