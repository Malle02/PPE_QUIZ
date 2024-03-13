function Verifmdp(motDePasse) {

    const longueurMinimale = 8;


    if (motDePasse.length < longueurMinimale) {
        return false;
    }


    const regexMajuscule = /[A-Z]/;
    if (!regexMajuscule.test(motDePasse)) {
        return false;
    }


    const regexMinuscule = /[a-z]/;
    if (!regexMinuscule.test(motDePasse)) {
        return false;
    }


    const regexChiffre = /[0-9]/;
    if (!regexChiffre.test(motDePasse)) {
        return false;
    }

    const caracspecial = /[^A-Za-z0-9]/;
    if (!caracspecial.test(motDePasse)) {
        return false;
    }
 


    return true;
}


export {Verifmdp}