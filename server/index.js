import { createRequire } from "module";
const require = createRequire(import.meta.url);
const express = require('express');
const app = express();

const mysqlpromise = require('mysql2/promise');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const multer = require('multer');
const { body, validationResult } = require('express-validator');


import { Verifmdp } from "./complexitemdp.mjs";

// Configuration de Multer pour gérer le téléversement de fichiers
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Pool de connexion à la base de données MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'Dams',
  password: 'Ma606060',
  database: 'testequizdb'
});

const dc = mysqlpromise.createPool({
  host: 'localhost',
  user: 'Dams',
  password: 'Ma606060',
  database: 'testequizdb'
});

// Configuration des middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "DELETE"],
  credentials: true
}));
app.use(cookieParser());

// Configuration de la session
app.use(session({
  key: "Quizz",
  secret: "QuizzATPMISSION",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // expire dans 24 heures
    maxAge: 24 * 60 * 60 * 1000, // durée de vie maximale de la session en millisecondes
  }, 
}));






// Endpoint d'inscription d'utilisateur
app.post('/api/Register', async (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;
  const nom = req.body.nom;
  const prenom = req.body.prenom;

  // Validation des données d'entrée
  if (!userName || !password || !nom || !prenom) {
    return res.status(400).send({ error: "Tous les champs sont requis" });
  }

  if (!Verifmdp(password)) {
    return res.status(400).send({ error: "Le mot de passe ne satisfait pas les conditions de complexité." });
  }

  // Hachage du mot de passe
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Vérification si le nom d'utilisateur existe déjà
  db.query("SELECT * FROM utilisateur WHERE username = ?", [userName], (error, emailResults) => {
    if (emailResults.length > 0) {
      res.status(400).send('Un compte est déjà associé à cette adresse e-mail. L\'inscription est refusée.');
    } else {

      const insertionQuery = "INSERT INTO utilisateur (username, mot_de_passe, nom, prenom) VALUES (?, ?, ?, ?)";
      db.query(insertionQuery, [userName, hashedPassword, nom, prenom], (err, result) => {
        if (err) {
          console.error("Erreur lors de l'insertion en base de données : " + err);
          return res.status(500).json({ error: "Erreur lors de l'inscription" });
        }
        console.log("Utilisateur inscrit avec succès");
        res.status(200).json({ message: "Inscription réussie" });
      });
    }
  });
});



//  protection du tableau de bord
app.get('/home', (req, res) => {
  if (req.session.user) {
    res.json({ success: true, message: "Accès au tableau de bord réussi", user: req.session.user });
  } else {
    res.json({ success: false, message: "Accès refusé. Veuillez vous connecter." });
  }
});



// Endpoint pour vérifier l'état de connexion de l'utilisateur
app.get('/api/loginclient', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});



// Endpoint d'authentification de l'utilisateur
app.post('/api/loginclient', (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;

  // Validation des données d'entrée
  if (!userName || !password) {
    return res.status(400).send({ error: "Tous les champs sont requis" });
  }

  // Vérification si le nom d'utilisateur existe dans la base de données
  const loginQuery = "SELECT * FROM utilisateur WHERE userName = ?";
  db.query(loginQuery, [userName], (error, results) => {
    if (error) {
      return res.status(500).json({ success: false, message: "Erreur de base de données" });
    }

    if (results.length === 1) {
      const hashedPassword = results[0].mot_de_passe;

      // Comparaison du mot de passe fourni avec le mot de passe haché dans la base de données
      bcrypt.compare(password, hashedPassword, (err, passwordMatch) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Erreur de hachage de mot de passe" });
        }

        if (passwordMatch) {
          req.session.user = { ...results[0] };
          console.log("Les données dans la session après l'authentification :", req.session.user);
          return res.json({ success: true, message: "Authentification réussie", user: results[0] });
        } else {
          return res.status(401).json({ success: false, message: "Identifiant ou mot de passe incorrect" });
        }
      });
    } else {
      return res.status(401).json({ success: false, message: "Identifiant ou mot de passe incorrect" });
    }
  });
});





// -----------------------------------------------------------------------------------------------------------------------------------------------------

// tableau de board Home

// -------------------- affichage nom des utulisateur
// Endpoint pour récupérer le nom de l'utilisateur
app.get('/api/getUserName', (req, res) => {
  try {
    if (!req.session.user || !req.session.user.username) {
      return res.status(401).send('Utilisateur non authentifié');
    }

    const userName = req.session.user.username;

    const sql = 'SELECT nom, prenom FROM utilisateur WHERE username = ?';

    db.query(sql, [userName], (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'exécution de la requête : ' + err.message);
        return res.status(500).send('Erreur du serveur');
      }

      if (result.length > 0) {
        const { nom, prenom } = result[0];
        res.json({ userName: `${nom} ${prenom}` });
      } else {
        res.status(404).send('Utilisateur non trouvé');
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du nom d\'utilisateur : ' + err.message);
    res.status(500).send('Erreur lors de la récupération du nom d\'utilisateur');
  }
});


 
 // Endpoint pour déconnecter l'utilisateur
 app.post('/api/logout', (req, res) => {
   req.session.destroy((err) => {
     if (err) {
       res.status(500).json({ success: false, message: "Erreur lors de la déconnexion" });
       return;
     }
     res.json({ success: true, message: "Déconnexion réussie" });
   });
 });



//  affichage des information de quiz 
app.get('/api/Getquiz', async (req, res) => {
  try {
    const [quizs] = await dc.query('SELECT * from quiz ');

    const Quizz = quizs.map(quiz => ({
      ...quiz,
      Date_de_publication: quiz.Date_de_publication ? new Date(quiz.Date_de_publication).toLocaleDateString() : null
  
    }));

    res.json(Quizz);
  } catch (error) {
    console.error('Erreur lors de la récupération des données : ' + error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});







// page de quiz -------------
// page de quiz -------------

app.get('/api/quiz/:quizId', async (req, res) => {
  try {
    const quizId = req.params.quizId;

   
    await dc.query('INSERT INTO examen (date_debut, id_quiz) VALUES (NOW(), ?)', [quizId]);

    const [questions] = await dc.query(`SELECT question.*
    FROM question
    JOIN association_question_quiz ON question.id = association_question_quiz.id_question
    WHERE association_question_quiz.id_quiz = ?
    ORDER BY RAND();;
    `, [quizId]);

    if (!questions || questions.length === 0) {
      console.error('Aucune question trouvée pour le quiz avec l\'ID :', quizId);
      return res.status(404).json({ error: 'Aucune question trouvée pour le quiz.' });
    }

    const formattedQuestions = [];

    for (const question of questions) {
      // Ajoutez ce log pour vérifier la valeur de question.Id
      console.log('Question ID:', question.id);
    
      const [correctAnswerIdRow] = await dc.query(
        'SELECT id_reponse ' +
        'FROM verite ' +
        'WHERE id_question = ? AND valeur = 1 ' +
        'LIMIT 1',
        [question.id]
      );
      
      const correctAnswerId = correctAnswerIdRow.length > 0 ? correctAnswerIdRow[0].id_reponse : null;
      console.log('Correct Answer ID:', correctAnswerId);
      

      const [answers] = await dc.query(
        'SELECT reponse.id, reponse.libelle, verite.valeur ' +
        'FROM reponse ' +
        'JOIN verite ON reponse.id = verite.id_reponse ' +
        'WHERE verite.id_question = ? ' +
        'ORDER BY RAND()',
        [question.id]
      );
      

  if (!answers || answers.length === 0) {
    console.error('Aucune réponse trouvée pour la question avec l\'ID :', question.id);
    return res.status(500).json({ error: 'Réponses introuvables pour la question.' });
  }

  const formattedAnswers = answers.map(answer => ({
    id: answer.id,
    text: answer.libelle,
    isCorrect: answer.valeur === 1,
  }));

  formattedQuestions.push({
    id: question.id,
    question: question.enonce,
    image: question.image ? `data:image/jpeg;base64,${question.image.toString('base64')}` : null,
    hint: "À quelle pays appartient ce drapeau ?", 
    answers: formattedAnswers,
    correctAnswerId: correctAnswerId,
  });
}

const formattedQuizData = {
  id: quizId,
  title: 'Titre du quiz', 
  questions: formattedQuestions,
};

res.json(formattedQuizData);
} catch (error) {
  console.error('Erreur lors de la récupération des données du quiz : ' + error.message);
  res.status(500).json({ error: 'Erreur serveur' });
}
});





app.get('/api/getpsuedonyme', (req, res) => {
  try {
    if (!req.session.user || !req.session.user.username) {
      return res.status(401).send('Utilisateur non authentifié');
    }

    const userName = req.session.user.username;
    res.json({ userName: userName });
  } catch (err) {
    console.error('Erreur lors de la récupération du nom d\'utilisateur : ' + err.message);
    res.status(500).send('Erreur lors de la récupération du nom d\'utilisateur');
  }
});






app.post('/api/saveUserScore', async (req, res) => {
  try {
    const { userName, quizId, userAnswers } = req.body;

    if (!userName || !quizId || !userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({ error: 'Données invalides dans la requête.' });
    }

    // Récupérer l'ID utilisateur à partir du pseudonyme dans la base de données
    const [userRow] = await dc.query('SELECT id FROM utilisateur WHERE username = ?', [userName]);

    if (!userRow || userRow.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const userId = userRow[0].id;

    const score = userAnswers.reduce((acc, answer) => {
      return acc + (answer.isCorrect ? 10 : 0);
    }, 0);
    

      
      for (const answer of userAnswers) {
        // Insérer le score utilisateur dans la table resultats
        const [lastInsertRow] = await dc.query( 'INSERT INTO resultats (id_examen, id_utilisateur, score, reponse, id_question, reponse_attendue) VALUES ((SELECT id FROM examen ORDER BY id DESC LIMIT 1), ?, ?, ?, (SELECT verite.id_question FROM verite INNER JOIN reponse ON reponse.id = ? WHERE verite.id_reponse = ?), (SELECT verite.id_reponse FROM verite WHERE verite.id_question = ( SELECT id_question FROM verite WHERE id_reponse = ?) AND verite.valeur = 1))',
          [userId, score, answer.answerId, answer.answerId, answer.answerId, answer.answerId]
        );
      }
      
       // Utiliser une table temporaire pour stocker les résultats de la sous-requête
      const [maxIdRow] = await dc.query('SELECT MAX(id) as maxId FROM examen');
      const maxId = maxIdRow[0].maxId;
  
      // Mettre à jour la date_fin de la dernière ligne de la table examen
      await dc.query(`
        UPDATE examen
        SET date_fin = NOW()
        WHERE id = ?
      `, [maxId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du score utilisateur :', error);

    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: 'Données JSON mal formatées dans la requête.' });
    }

    res.status(500).json({ error: 'Erreur serveur' });
  }
 });




// ...






// page des score
// page des score
app.get("/api/scoreTotal", async (req, res) => {
  
  try {
    const userName = req.session.user.username;

    


    const scoreQuery = `
        SELECT SUM(resultats.score) AS totalScore
        FROM resultats
        INNER JOIN utilisateur ON utilisateur.id = resultats.id_utilisateur
        INNER JOIN examen ON examen.id = resultats.id_examen
        WHERE resultats.id_utilisateur = (SELECT id FROM utilisateur WHERE username = ?)
        AND examen.id = (SELECT id FROM examen ORDER BY id DESC LIMIT 1)
    `;

    const totalScoreQuery = `
        SELECT COUNT(question.id) * 10 AS totaldesScore
        FROM question
        INNER JOIN association_question_quiz ON question.id = association_question_quiz.id_question
        INNER JOIN quiz ON quiz.id = association_question_quiz.id_quiz
        WHERE quiz.id = (
            SELECT examen.id_quiz
            FROM resultats
            INNER JOIN utilisateur ON utilisateur.id = resultats.id_utilisateur
            INNER JOIN examen ON examen.id = resultats.id_examen
            WHERE utilisateur.username = ?
            ORDER BY examen.id DESC
            LIMIT 1
        )
    `;
    db.query(scoreQuery, [userName], (err, scoreResult) => {
      if (err) {
        console.error('Erreur lors de l\'exécution de la requête : ' + err.message);
        return res.status(500).send('Erreur du serveur');
      }

      db.query(totalScoreQuery, [userName], (err, totalScoreResult) => {
        if (err) {
          console.error('Erreur lors de l\'exécution de la requête : ' + err.message);
          return res.status(500).send('Erreur du serveur');
        }

        if (scoreResult.length > 0 && totalScoreResult.length > 0) {
          const LesScore = scoreResult[0].totalScore;
          const totaldesScore = totalScoreResult[0].totaldesScore;
          res.json({ LesScore, totaldesScore });
        } else {
          res.status(404).send('score non trouvé');
        }
      });
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des score : ' + err.message);
    res.status(500).send('Erreur lors de la récupération des scores');
  }
});





app.get("/api/historiqueDesScores", async (req, res) => {
  try {
    const userName = req.session.user.username;

    const historiqueQuery = `
  SELECT 
    examen.id AS id_examen,
    quiz.titre AS titre_quiz,
    DATE_FORMAT(examen.date_debut, '%d/%m/%Y') AS date_debut,
    DATE_FORMAT(examen.date_fin, '%d/%m/%Y') AS date_fin,
    SUM(resultats.score) AS score_obtenu,
    (SELECT SUM(score) FROM resultats WHERE id_examen = examen.id) AS somme_scores_obtenus,
    COUNT(*) * (SELECT COUNT(*) FROM association_question_quiz WHERE id_quiz = examen.id_quiz) * 10 AS score_total_attendu,
    question.enonce AS question_posee,
   question.image AS imageQuestion,
    reponse.libelle AS reponse_utilisateur,
    CASE WHEN verite.valeur = 1 THEN 'Vrai' ELSE 'Faux' END AS est_correcte,
    reponse_attendue.libelle AS reponse_attendue  -- Modification ici
  FROM 
    examen
  JOIN 
    quiz ON examen.id_quiz = quiz.id
  JOIN 
    resultats ON examen.id = resultats.id_examen
  JOIN 
    question ON resultats.id_question = question.id
  JOIN 
    reponse ON resultats.reponse = reponse.id
  LEFT JOIN 
    verite ON question.id = verite.id_question AND reponse.id = verite.id_reponse
  LEFT JOIN 
    reponse AS reponse_attendue ON resultats.reponse_attendue = reponse_attendue.id  -- Modification ici
  WHERE 
    resultats.id_utilisateur = (SELECT id FROM utilisateur WHERE username = ?)
  GROUP BY 
    examen.id, quiz.titre, examen.date_debut, examen.date_fin, question.enonce, question.image, reponse.libelle, verite.valeur, reponse_attendue.libelle  -- Modification ici
  ORDER BY 
    id_examen ASC;
`;

    db.query(historiqueQuery, [userName], (err, historiqueResult) => {
      if (err) {
        console.error('Erreur lors de l\'exécution de la requête : ' + err.message);
        return res.status(500).send('Erreur du serveur');
      }

      if (historiqueResult.length > 0) {
        // Regrouper les résultats par examen
        const historiqueExamen = historiqueResult.reduce((acc, examen) => {
          const idExamen = examen.id_examen;
          if (!acc[idExamen]) {
            acc[idExamen] = {
              id_examen: idExamen,
              titre_quiz: examen.titre_quiz,
              date_debut: examen.date_debut,
              date_fin: examen.date_fin,
              score_total_attendu: examen.score_total_attendu,
              somme_scores_obtenus: examen.somme_scores_obtenus,
              questions: []
            };
          }
          acc[idExamen].questions.push({
            enonce: examen.question_posee,
            image: examen.imageQuestion ? `data:image/jpeg;base64,${examen.imageQuestion.toString('base64')}` : null,
            hint: "À quelle pays appartient ce drapeau ?",             
            reponse_utilisateur: examen.reponse_utilisateur,
            est_correcte: examen.est_correcte,
            reponse_attendue: examen.reponse_attendue,
            score_obtenu: examen.score_obtenu
          });
          return acc;
        }, {});
        // Convertir l'objet regroupé en tableau
        const historiqueExamenArray = Object.values(historiqueExamen);
        res.json(historiqueExamenArray);
      } else {
        res.status(404).send('Aucun historique trouvé');
      }
    });
    req.session.save((err) => {
      if (err) {
        console.error('Erreur lors de la sauvegarde de la session :', err);
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'historique : ' + err.message);
    res.status(500).send('Erreur lors de la récupération de l\'historique');
  }
});




// commentaire
app.post('/api/commentaire', (req, res) => {
  const commentaire = req.body.commentaire;
  const userName = req.session.user.username;

  // Validation des données d'entrée
  if (!commentaire) {
    return res.status(400).send({ error: "Tous les champs sont requis" });
  }

  const insertionQuery = 'INSERT INTO commentaire (comment, id_user) VALUES (?, (select id from utilisateur where username = ?))';
  db.query(insertionQuery, [commentaire, userName], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'insertion dans la base de données : " + err);
      return res.status(500).json({ error: "Erreur lors de l'insertion" });
    }

    req.session.save((err) => {
      if (err) {
        console.error('Erreur lors de la sauvegarde de la session :', err);
      }
    });
    res.status(200).json({ success: true, message: "Commentaire inséré avec succès" });
  });
});










app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post(
  '/api/addquestion',
  upload.single('pictureCar'),
  [
    body('goodResponse').notEmpty().withMessage('Le champ goodResponse est obligatoire'),
    body('badResponse1').notEmpty().withMessage('Le champ badResponse1 est obligatoire'),
    body('badResponse2').notEmpty().withMessage('Le champ badResponse2 est obligatoire'),
    body('badResponse3').notEmpty().withMessage('Le champ badResponse3 est obligatoire'),
    body('quizType').notEmpty().withMessage('Le champ quizType est obligatoire'),
    body('quizType').isIn(['1', '2']).withMessage('Le champ quizType doit être 1 ou 2'),
    body('newQuestion').optional().custom((value, { req }) => {
      if (req.body.quizType === '1' && !value) {
        throw new Error('Le champ newQuestion est obligatoire pour le quiz de type 1');
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      console.log('Received Request Body:', req.body);
      console.log('Received File:', req.file);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const goodResponse = req.body.goodResponse;
      const badResponse1 = req.body.badResponse1;
      const badResponse2 = req.body.badResponse2;
      const badResponse3 = req.body.badResponse3;
      const quizType = req.body.quizType;

      const pictureCar = (quizType === '2' && req.file) ? req.file.buffer : null;
      const newQuestion = (quizType === '1') ? req.body.newQuestion : null;

      const userName = req.session.user.username;

      if (!goodResponse || !badResponse1 || !badResponse2 || !badResponse3) {
        return res.status(400).json({ error: 'Veuillez fournir toutes les informations nécessaires pour ajouter une question.' });
      }

      const [existingQuestion] = await dc.query('SELECT id FROM question WHERE enonce = ?', [newQuestion]);

      if (existingQuestion.length > 0) {
        return res.status(400).send({ error: 'Cette question existe déjà.' });
      }

      let insertedQuestion;
      if (quizType === '1') {
        [insertedQuestion] = await dc.query('INSERT INTO question SET ?', { enonce: newQuestion, question_add_by: userName });
      } else {
        [insertedQuestion] = await dc.query('INSERT INTO question SET ?', { question_add_by: userName, image: pictureCar  });
      }

      const questionId = insertedQuestion.insertId;

      const [insertedGoodResponse] = await dc.query('INSERT INTO reponse (libelle) VALUES (?)', [goodResponse]);
      const [insertedBadResponse1] = await dc.query('INSERT INTO reponse (libelle) VALUES (?)', [badResponse1]);
      const [insertedBadResponse2] = await dc.query('INSERT INTO reponse (libelle) VALUES (?)', [badResponse2]);
      const [insertedBadResponse3] = await dc.query('INSERT INTO reponse (libelle) VALUES (?)', [badResponse3]);

      await dc.query('INSERT INTO verite (id_question, id_reponse, valeur) VALUES (?, ?, ?)', [questionId, insertedGoodResponse.insertId, 1]);
      await dc.query('INSERT INTO verite (id_question, id_reponse, valeur) VALUES (?, ?, ?)', [questionId, insertedBadResponse1.insertId, 0]);
      await dc.query('INSERT INTO verite (id_question, id_reponse, valeur) VALUES (?, ?, ?)', [questionId, insertedBadResponse2.insertId, 0]);
      await dc.query('INSERT INTO verite (id_question, id_reponse, valeur) VALUES (?, ?, ?)', [questionId, insertedBadResponse3.insertId, 0]);

      await dc.query('INSERT INTO association_question_quiz (id_question, id_quiz) VALUES (?, (SELECT id FROM quiz WHERE id = ?))', [questionId, quizType]);

      res.status(200).send({ success: 'Nouvelle question ajoutée avec succès.' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Une erreur s\'est produite lors de l\'ajout de la question.' });
    }
  }
);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Middleware de gestion des erreurs pour 404
app.use((req, res, next) => {
  res.status(404).redirect('/Error404');
});

// Middleware de gestion des erreurs pour d'autres erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Une erreur s\'est produite!');
});




// Serveur en écoute sur le port 3008
app.listen(3008, () => {
  console.log('Serveur en cours d\'écoute sur le port 3008');
});
