import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Register = () => {
    const [userName, setUserName] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');

    const navigate = useNavigate(); 

    const handleRegister = () => {
        setMessage("");
        if (!userName || !password || !nom || !confirmPassword || !prenom) {
            setMessage("Veuillez remplir tous les champs.");
        } else if (password !== confirmPassword) {
            setMessage("Les mots de passe ne correspondent pas.");
        } else {
            axios.post('http://localhost:3008/api/register', {
                userName: userName,
                password: password,
                nom: nom,
                prenom: prenom
            })
            .then(response => {
                if (response.status === 200) {
                    setMessage("Inscription réussie ! Vous allez être redirigé vers la page de connexion.");
                    setTimeout(() => {
                        navigate("/login");
                    }, 2500); 
                }
            })
            .catch(error => {
                if (error.response && error.response.data && error.response.data.error) {
                    setMessage(error.response.data.error);
                } else {
                    setMessage("Une erreur s'est produite lors de l'inscription.");
                }
            });
        }
    };

    return (
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full">
                <h2 className="text-4xl font-bold mb-4 text-center">Inscription</h2>
                <form className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md text-black"
                            placeholder="Votre Username"
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                            Nom
                        </label>
                        <input
                            type="text"
                            id="nom"
                            name="nom"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md text-black"
                            placeholder="Votre nom"
                            onChange={(e) => setNom(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                            Prénom
                        </label>
                        <input
                            type="text"
                            id="prenom"
                            name="prenom"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md text-black"
                            placeholder="Votre prénom"
                            onChange={(e) => setPrenom(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Mot de passe
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md text-black"
                            placeholder="Mot de passe"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirmer le mot de passe
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md text-black"
                            placeholder="Retapez le mot de passe"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <label className="text-black font-bold">
                        <input
                            type="checkbox"
                            onClick={() => setShowPassword(!showPassword)}
                            
                        />
                        Afficher le mot de passe
                    </label>
                    {message && <div className="message text-black">{message}</div>}
                    <button
                        type="button"
                        onClick={handleRegister}
                        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                    >
                        S'inscrire
                    </button>
                </form>
                <p className="mt-4 text-gray-200 text-center">
                    Vous avez déjà un compte ? <Link to="/login" className="underline">Connectez-vous ici</Link>.
                </p>
            </div>
        </div>
    );
};

export default Register;
