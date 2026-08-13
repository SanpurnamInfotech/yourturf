import { useState ,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaFutbol,
} from "react-icons/fa";

import API from "../services/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [turf, setTurf] = useState(null);

useEffect(() => {

  const loadTurf = async () => {

    try {

      const response =
        await API.get("turf/");

      setTurf(response.data);

    } catch (error) {

      console.log(
        "Failed to load turf:",
        error
      );

    }

  };

  loadTurf();

}, []);

  const handleLogin = () => {
    if (
      username === "admin" &&
      password === "admin123"
    ) {
      localStorage.setItem(
        "isAdmin",
        "true"
      );

      navigate("/admin");
    } else {
      alert(
        "Invalid Username or Password"
      );
    }
  };

  return (
    <div
      className="
      min-h-screen
      bg-cover
      bg-center
      flex
      items-center
      justify-center
      relative
      "
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Login Card */}
      <div
        className="
        relative
        z-10
        bg-white/10
        backdrop-blur-lg
        border
        border-white/20
        rounded-3xl
        shadow-2xl
        p-8
        w-full
        max-w-md
        mx-4
        "
      >
        {/* Logo */}
        <div className="text-center mb-8">

          <div
            className="
            w-20
            h-20
            bg-green-500
            rounded-full
            flex
            items-center
            justify-center
            mx-auto
            mb-4
            "
          >
            <FaFutbol
              className="text-white"
              size={35}
            />
          </div>

          <h1
            className="
            text-3xl
            font-bold
            text-white
            "
          >
            {turf?.name || "Dream"} Turf
          </h1>

          <p className="text-gray-200 mt-2">
            Admin Login
          </p>

        </div>

        {/* Username */}
        <div className="mb-4 relative">

          <FaUser
            className="
            absolute
            left-4
            top-4
            text-gray-400
            "
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
            className="
            w-full
            pl-12
            pr-4
            py-3
            rounded-xl
            bg-white
            outline-none
            "
          />

        </div>

        {/* Password */}
        <div className="mb-6 relative">

          <FaLock
            className="
            absolute
            left-4
            top-4
            text-gray-400
            "
          />

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="
            w-full
            pl-12
            pr-12
            py-3
            rounded-xl
            bg-white
            outline-none
            "
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            className="
            absolute
            right-4
            top-4
            text-gray-500
            "
          >
            {showPassword ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </button>

        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="
          w-full
          bg-green-500
          hover:bg-green-600
          text-white
          py-3
          rounded-xl
          font-bold
          text-lg
          transition
          "
        >
          Login
        </button>

        {/* Back Home */}
        <button
          onClick={() =>
            navigate("/")
          }
          className="
          w-full
          mt-4
          border
          border-white
          text-white
          py-3
          rounded-xl
          hover:bg-white
          hover:text-black
          transition
          "
        >
          Back To Home
        </button>

      </div>
    </div>
  );
}

export default AdminLogin;