import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/logout")}
      className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
}
