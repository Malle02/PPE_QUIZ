import assert from "assert"
import {Verifmdp} from "../complexitemdp.mjs";



it('test de la longueur' , ()=> {
    assert.equal(Verifmdp("Azerty8"),false)
})

it('test majuscule KO' , ()=> {
    assert.equal(Verifmdp("a@fhdsjhkjzerty8"),false)
})

it('test majuscule OK' , ()=> {
    assert.equal(Verifmdp("ABCDEFG@Hfhdsjhkjzerty8"),true)
})

it('test spécial' , ()=> {
    assert.equal(Verifmdp("ABCDEFGHfhdsjhkjzerty8"),false)
})
