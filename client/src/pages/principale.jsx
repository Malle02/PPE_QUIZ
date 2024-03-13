import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        
        <div className="flex flex-col items-center mb-8">
          <button onClick={() => navigate("/Login")} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
            Connexion
          </button>

         
        </div>

        <div className="mx-auto max-w-5xl lg:mx-0 text-center">
          <h2 className="text-6xl font-bold mb-4">Bienvenue sur Mon Quiz</h2>
          <p className="text-lg leading-7 mb-8">
            Explorez des quizzes passionnants et mettez vos connaissances à l'épreuve. Préparez-vous pour une aventure intellectuelle captivante.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <article className="flex flex-col items-start bg-white p-6 rounded-lg shadow-md">
            <div className="group relative">
              <h3 className="text-xl font-semibold leading-6 text-gray-900 group-hover:text-blue-500">
                <a href="/login" className="underline">
                Quiz sur l'histoire du monde
                </a>
              </h3>
              <p className="mt-3 text-base leading-6 text-gray-600">
              Découvrez les récits fascinants qui tissent l'histoire de ce monde, explorant ses moments héroïques et ses évolutions culturelles. Une plongée captivante dans un passé riche en enseignements.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-x-4">
              <div className="text-sm leading-6">
                <p className="text-gray-900">
                  <a href="#" className="underline">
                    Mallé TRAORE
                  </a>
                </p>
                <p className="text-gray-600">24/01/2024</p>
              </div>
            </div>
          </article>

          <article className="flex flex-col items-start bg-white p-6 rounded-lg shadow-md">
            <div className="group relative">
              <h3 className="text-xl font-semibold leading-6 text-gray-900 group-hover:text-blue-500">
                <a href="/login" className="underline">
                 (A vénir )La Géographie - Drapeaux du Monde
                </a>
              </h3>
              <p className="mt-3 text-base leading-6 text-gray-600">
              Voyagez à travers le monde en découvrant les drapeaux qui représentent chaque nation. Une aventure géographique qui élargira vos horizons et vous permettra de reconnaître les symboles uniques de diverses cultures.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-x-4">
              <div className="text-sm leading-6">
                <p className="text-gray-900">
                  <a href="#" className="underline">
                  Mallé TRAORE
                  </a>
                </p>
                <p className="text-gray-600">30/01/2023</p>
              </div>
            </div>
          </article>
         
        </div>
      </div>
    </div>
  );
};

export default Home;
