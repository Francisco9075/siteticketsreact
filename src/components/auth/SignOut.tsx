import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("keepLoggedIn");
    localStorage.removeItem("userEmail");

    navigate("/login");
  }, []);

  return null;
}
