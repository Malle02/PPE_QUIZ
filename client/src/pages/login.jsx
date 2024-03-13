import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Login = () => {
  const [userName, setuserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const seconnecterclt = () => {
    axios.post("http://localhost:3008/api/loginclient", {
      userName : userName,
      password: password
    })
      .then(response => {
        if (response.data.success) {
          
          setError("");
          navigate("/home");
        } else {
          setError("Identifiant ou mot de passe incorrect");
        }
      })
      .catch(error => {
        if (error.response && error.response.data && error.response.data.error) {
          setError("");
          setError(error.response.data.error);
        } else {
          setError("");
          setError("Identifiant ou mot de passe incorrect");
        }
      });
  };

  useEffect(() => {
    axios.get("http://localhost:3008/api/loginclient")
      .then(response => {
        const isAuthenticated = response.data.loggedIn === true;
        if (isAuthenticated) {
          setLoginStatus(response.data.user && response.data.user.userName ? response.data.user.userName : "Unknown");
          navigate("/home");
        }
      })
      .catch(error => {
        console.error("Erreur lors de la vérification de l'état de connexion:", error);
      });
  }, [navigate]);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <h2 className="text-4xl font-bold mb-4 text-center">Connexion</h2>
        <form className="bg-white p-8 rounded-lg shadow-lg">
          {error && <div className="error-message text-black text-center font-bold ">{error}</div>}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
                          name="username"
                          placeholder="username"
              value={userName}
              onChange={(e) => setuserName(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md text-black"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
                          name="password"
                          placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md text-black"
            />
          </div>
          <button
            type="button"
            onClick={seconnecterclt}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Se connecter
          </button>
        </form>
        <p className="mt-4 text-gray-200 text-center">
          Vous n'avez pas de compte ? <Link to="/register" className="underline">Inscrivez-vous ici</Link>.
        </p>
      </div>
    </div>
  );
};

export default Login;
