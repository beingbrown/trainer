import React from 'react';
import {Pokedex} from 'pokeapi-js-wrapper';

const dex = new Pokedex();
dex.getPokemonsList().then(console.log).catch(console.log);

function App() {
  return (
    <div>
      <header>Pokedex</header>
      <main>
      </main>
    </div>
  );
}

export default App;
