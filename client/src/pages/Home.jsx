import { useNavigate } from "react-router-dom";
import axios from '../composant/axiosConfig';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [Quiz, setQuiz] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3008/api/loginclient")
      .then(response => {
        if (response.data.loggedIn) {
          axios.get("http://localhost:3008/api/getUserName")
            .then(response => {
              if (response.data.userName) {
                setUserName(response.data.userName);
              } else {
                console.error('Le champ "userName" n\'a pas été trouvé dans la réponse du serveur.');
              }
            })
            .catch(error => {
              setError("Erreur lors de la récupération du nom.");
              console.error('Erreur lors de la récupération du nom : ' + error);
            });
        } else {
          navigate("/");
        }
      })
      .catch(error => {
        setError("Erreur lors de la vérification de l'état de connexion.");
        console.error('Erreur lors de la vérification de l\'état de connexion : ' + error);
      });
  }, [navigate]);

  const deconnecter = () => {
    axios.post("http://localhost:3008/api/logout")
      .then(response => {
        navigate("/");
      })
      .catch(error => {
        setError("Erreur lors de la déconnexion.");
        console.error('Erreur lors de la déconnexion : ' + error);
      });
  };


  // Affichage des information des quiz

  



  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get('http://localhost:3008/api/Getquiz');
        setQuiz(response.data);
      } catch (error) {
      
        console.error('Erreur lors de la récupération des données des voitures : ' + error.message);
      }
    }
    fetchQuiz();
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-5xl lg:mx-0 text-center">
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <h2 className="text-6xl font-bold mb-4 ">Bienvenue  sur Mon Quiz</h2>
          <h3 className="text-5xl" style={{ color: 'blue', fontWeight: 'bold', }}>{userName}!</h3>
          <p className="text-lg leading-7 mb-8">
            Explorez des quizzes passionnants et mettez vos connaissances à l'épreuve. Préparez-vous pour une aventure
            intellectuelle captivante.
          </p>
        </div>
        <button onClick={deconnecter} className="bg-red-500 text-white px-4 py-2 rounded mt-4">  Déconnexion </button>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-2">
        {Quiz.map(quiz => (
          <article key={quiz.id} className="flex flex-col items-start bg-white p-6 rounded-lg shadow-md">
          
            <div className="group relative">
              <h3 className="text-xl font-semibold leading-6 text-gray-900 group-hover:text-blue-500">
                <a href="#" className="underline">
                <Link to={`/quiz/${quiz.id}`} className="underline" >
                    {quiz.titre}
                    </Link>
                </a>
              </h3>
              <p className="mt-3 text-base leading-6 text-gray-600">
              {quiz.description}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-x-4">
              <div className="text-sm leading-6">
                <p className="text-gray-900">
                 
                  {quiz.auteur}
                 
                </p>
                <p className="text-gray-600">Date de publication {quiz.Date_de_publication}</p>
              </div>
            </div>
             
          </article>
          ))}
                 </div>
      </div>
    </div>
  );
};

export default Home;
