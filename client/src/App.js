import React from 'react';
import { Route, Routes } from "react-router-dom";
import Quiz from './pages/QuizPage'
import Home from './pages/Home'
import Score from './pages/score'
import Login from './pages/login'
import Register from './pages/register'
import Principale from './pages/principale'
import Error404 from "./composant/Error404"


 
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/Score" element={<Score />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/" element={<Principale />} />
        <Route path="/Error404" element={<Error404 />} />
        
       
       
        <Route path="*" element={<Error404 />} />
       
       
      </Routes>

    </div>
  );
};

export default App;