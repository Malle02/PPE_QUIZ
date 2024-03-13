import React, { useState, useEffect } from 'react';
import axios from '../composant/axiosConfig';

import { useNavigate } from 'react-router-dom';
const ScorePage = () => {

  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
 
  const [scores, setScores] = useState({});
  const [commentaire, setcommentaire] = useState('');

 


 
  const navigate = useNavigate();



  useEffect(() => {

    // verification de la connexion 
  
    const fetchUserData = async () => {
      try {
        const loginCheckResponse = await axios.get("http://localhost:3008/api/loginclient");
        if (loginCheckResponse.data.loggedIn) {
          const userNameResponse = await axios.get("http://localhost:3008/api/getpsuedonyme");
          if (userNameResponse.data.userName) {
            setUserName(userNameResponse.data.userName);
          } else {
            setError("Le champ 'Pseudonyme' n'a pas été trouvé dans la réponse du serveur.");
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        setError("Erreur lors de la récupération du nom d'utilisateur : " + (error.response?.data || error.message));
      }
    };
  
    fetchUserData();
  }, [navigate]);
  

  // score et tatal des score
  
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get('http://localhost:3008/api/scoreTotal'); 
        setScores(response.data);
      } catch (error) {
      
        console.error('Erreur lors de la récupération des données des scores : ' + error.message);
      }
    }
  


  fetchScores();

  }, []);

  
     // historique de l'utulisatuer

const [historique, setHistorique] = useState([]);
useEffect(() => {
  async function fetchHistorique() {
    try {
      const response = await axios.get('http://localhost:3008/api/historiqueDesScores');
     
      const historiqueWithShowQuestions = response.data.map(quiz => ({ ...quiz, showQuestions: false }));
      setHistorique(historiqueWithShowQuestions);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique : ', error);
    }
  }

  fetchHistorique();
}, []);

const toggleQuestions = (index) => {
  const newHistorique = [...historique];
  newHistorique[index].showQuestions = !newHistorique[index].showQuestions;
  setHistorique(newHistorique);
};


  // commentaire de l'user 

  const envoie_Commentaire = () => {
    axios.post("http://localhost:3008/api/commentaire",  {
      commentaire: commentaire
    }, { withCredentials: true })
      .then(response => {
        if (response.data.success) {
          setError("commentaire envoyé avec succes je prendrais note de vos suggesctions")
          setcommentaire(''); 
          setTimeout(() => {
            
            setError('');
        }, 2000);
        } else {
          setError("une erreur s'est peoduite merci de reesayé plus tard");
          setcommentaire('');
        }
      })
      .catch(error => {
        if (error.response && error.response.data && error.response.data.error) {
          setError("");
          setError(error.response.data.error);
        } else {
          setError("");
        }
      });
  };
  

  const addQuestion = (e) => {
   
  };
  


  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 text-center">
          <h2 className="text-4xl font-bold mb-4">Votre Historique de Quiz {userName}</h2>
          <p className="text-lg leading-7 mb-8">
            Découvrez vos performances passées et suivez votre progression.
          </p>
        </div>

        {/* Affichage du score total */}
        <div className="bg-white overflow-hidden p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-black">votre score sur ce quiz Score Total</h3>
          <p className="text-4xl font-bold text-gray-800"> {scores.LesScore}/{scores.totaldesScore}</p>
        </div>


{/* Affichage de l'historique des scores */}
<div className="mt-8"> 
    <ul className="bg-white overflow-hidden p-6 rounded-lg shadow-lg divide-y divide-gray-200">
    <h3 className="text-3xl font-bold text-center mb-6 text-purple-600">🚀 Explorez votre Historique de Quiz</h3> 
    {historique.map((quiz, index) => (
      <li key={index} className="py-4">
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start">
          <div className="mb-4 lg:mb-0">
            <p className="text-xl font-bold text-gray-800">{quiz.titre_quiz}</p>
            <p className="text-lg text-gray-600">Commencé le: {quiz.date_debut}</p>
            {quiz.date_fin && <p className="text-lg text-gray-600">Terminé le: {quiz.date_fin}</p>}
            <p className="text-lg text-gray-600">{quiz.type_quiz}</p>
            {/* Affichage des badges et récompenses en fonction du score */}
            {quiz.somme_scores_obtenus >= 90 ? (
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <span className="bg-yellow-500 text-black px-6 py-2 rounded-full text-xl font-semibold">
                  🏆 Badge Or
                </span>
                <span className="text-gray-700 text-lg ml-4">Félicitations ! Vous avez décroché le Badge d'Or. Un véritable champion !</span>
              </div>
            ) : quiz.somme_scores_obtenus >= 40 ? (
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <span className="bg-gray-400 text-black px-6 py-2 rounded-full text-xl font-semibold">
                  🥈 Badge Argent
                </span>
                <span className="text-gray-700 text-lg ml-4">Bravo ! Vous avez mérité le Badge d'Argent. Excellente performance !</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <span className="bg-orange-800 text-white px-6 py-2 rounded-full text-xl font-semibold">
                  🥉 Badge Bronze
                </span>
                    <span className="text-gray-700 text-lg ml-4">Pas mal du tout ! Vous avez remporté le Badge de Bronze. Continuez comme ça !</span>
                    
                   
                    
              </div>
            )}
          </div>
          <button className='bg-blue-500 text-white px-3 mr-20 py-1 rounded-full text-base text-center font-semibold hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue active:bg-blue-800' onClick={() => toggleQuestions(index)}>Découvrir les Questions</button>
          <div className="flex items-center">
            <p className="text-2xl font-bold text-blue-500 ml-4">{quiz.somme_scores_obtenus}/{quiz.score_total_attendu}</p>
          </div>
          
        </div>
        {/* Affichage des détails des questions du les reponse donnée  quiz a voir*/}
    
      </li>
    ))}
  </ul>
</div>

      
        {/* Formulaire pour envoyer un commentaire */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-center mb-4">Envoyer un Commentaire</h3>
          <form onSubmit={(e) => { e.preventDefault(); envoie_Commentaire(); }}>
          {error && <div className="error-message text-black text-center font-bold ">{error}</div>}
            <textarea
              className="w-full p-4 border text-black rounded-md"
              placeholder="Votre commentaire..."
              name="commentaire"
              value={commentaire}
              onChange={(e) => setcommentaire(e.target.value)}
              
            />
            <button type="submit" className="mt-4 bg-blue-700 text-white py-2 px-4 rounded-md">Envoyer</button>
          </form>
        </div>

        {/* Formulaire pour ajouter une nouvelle question   a voire   */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-center mb-4">Ajouter une Nouvelle Question</h3>
          <form onSubmit={addQuestion}>
       
        <button type="submit" className="mt-4 bg-blue-700 text-white py-2 px-4 rounded-md ">Ajouter</button>
      </form>
        </div>
      </div>
    </div>
  );
};

export default ScorePage;
