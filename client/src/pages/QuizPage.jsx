

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../composant/axiosConfig';
import '../style/style.QuizPage.css';
import image from '../images/abstract.svg';

const QuizPage = () => {
  const { quizId } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [progress, setProgress] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [userName, setUserName] = useState('');
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();



  useEffect(() => {
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
  

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.get(`http://localhost:3008/api/quiz/${quizId}`);
        const data = response.data;

        const total = data.questions.reduce((acc, question) => acc + 10, 0);
        setTotalScore(total);

        setQuizData(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données du quiz : ' + error.message);
      }
    };

    fetchQuizData();
  }, [quizId]);

  useEffect(() => {
    if (quizData && quizData.questions) {
      const currentQuestion = quizData.questions[currentQuestionIndex];
      const shuffled = currentQuestion ? [...currentQuestion.answers].sort(() => Math.random() - 0.5) : [];
      setShuffledAnswers(shuffled);

      const newProgress = (score / totalScore) * 100;
      setProgress(newProgress);
    }
  }, [quizData, currentQuestionIndex, score, totalScore]);

  const handleAnswerClick = (answerId) => {
    setSelectedAnswer(answerId);
  };

  const handleNextQuestion = async () => {
    if (!quizData || !quizData.questions || !quizData.questions[currentQuestionIndex]) {
      console.error('Données du quiz ou question actuelle non définies.');
      return;
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];

    const isCorrect = selectedAnswer === currentQuestion.correctAnswerId;

    // Enregistrez la réponse de l'utilisateur
    try {
      await axios.post("http://localhost:3008/api/saveUserScore", {
        userName: userName,
        quizId: quizId,
        userAnswers: [{
          questionId: currentQuestion.id,
          answerId: selectedAnswer,
          isCorrect: isCorrect,
        }],
      }, { withCredentials: true })
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du score de l'utilisateur :", error);

      if (error.response) {
        console.error('Réponse du serveur :', error.response.data);
      }
    }

    // Mettez à jour le score et les compteurs de réponses correctes et incorrectes
    if (isCorrect) {
      setScore(score + 10);
      setIsAnswerCorrect(true);
      setCorrectAnswersCount(correctAnswersCount + 1);
    } else {
      setIsAnswerCorrect(false);
      setIncorrectAnswersCount(incorrectAnswersCount + 1);
    }

    // Attendez un court délai avant de passer à la question suivante
    setTimeout(() => {
      setIsAnswerCorrect(null);
      setCurrentQuestionIndex(currentQuestionIndex + 1);

      if (currentQuestionIndex + 1 === quizData.questions.length) {
        
        navigate(`/Score`);
        return;
      }

      setSelectedAnswer(null);
    }, 2000);
  };

  if (!quizData || !quizData.questions || !quizData.questions[currentQuestionIndex]) {
    return <div>Loading...</div>;
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];

  if (!currentQuestion || !currentQuestion.answers) {
    return <div>Fin du quiz</div>;
  }

  const currentAnswers = shuffledAnswers;

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="relative overflow-hidden bg-white container shadow-lg rounded-lg px-8 py-6">
        <img src={image} alt="" className="absolute -top-12 left-0 object-none w-90" />

        <div className="relative z-20 ">
          <h1 className='text-center font-bold '>Session de {userName}</h1>
          <div className="text-right text-gray-800 ">
            <p className="text-sm leading-3 relative">Score</p>
            <p className="font-bold">{score} / {totalScore}</p>
            <p className="text-sm leading-3 relative">Réponses correctes</p>
            <p className="font-bold">{correctAnswersCount}</p>
            <p className="text-sm leading-3 relative">Réponses incorrectes</p>
            <p className="font-bold">{incorrectAnswersCount}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-200 to-purple-200 shadow-lg p-1 rounded-full w-full h-5 mt-4">
          <div className="bg-blue-700 rounded-full w-11/12 h-full" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="bg-white shadow-lg p-6 rounded-lg text-center text-gray-800 mt-8 ">
  {quizId !== '1' && currentQuestion.image ? (
     <>
       {currentQuestion.hint && <h1 className="text-lg text-black-500 mb-5 font-bold">{currentQuestion.hint}</h1>}
      <img src={currentQuestion.image} alt={`Question ${currentQuestion.image}`}  className="max-w-full mb-4 ml-8" />
    </>
  ) : (
    <p className="text-lg font-bold text-black">{currentQuestion.question}</p>
  )}
</div>


        <div className="mt-8">
          {currentAnswers.map(answer => (
            <div
              key={answer.id}
              className={`rounded-lg font-bold flex cursor-pointer transition duration-300 transform hover:scale-105 items-center ${
                selectedAnswer === answer.id ? 'bg-blue-300' : ''
              }`}
              onClick={() => handleAnswerClick(answer.id)}
            >
              <div className="p-4 w-80 mb-2 rounded-lg bg-blue-700 text-white">{answer.text}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          {isAnswerCorrect === true && <div className="text-green-500">Correct !</div>}
          {isAnswerCorrect === false && <div className="text-red-500">Incorrect !</div>}
          <button
            onClick={handleNextQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            Question suivante
          </button>
        </div>

        <div className="mt-8 text-center">
          <div className="h-1 w-12 bg-gray-800 rounded-full mx-auto"></div>
          <p className="font-bold text-gray-800">{`${currentQuestionIndex + 1}/${quizData.questions.length}`}</p>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
