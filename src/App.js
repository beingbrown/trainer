import React, {useState} from 'react';
import {Pokedex} from 'pokeapi-js-wrapper';

async function* pokeListGenerator() {
  const dex = new Pokedex({protocol: 'https'});

  let interval = {limit: 50, offset: 0};
  let curr, next;

  curr = await dex.getPokemonsList(interval);
  while(curr.next) {
    interval.offset+=interval.limit;
    next = dex.getPokemonsList(interval);
    yield await curr;
    curr = await next;
  }
};

const pokeList = pokeListGenerator();

function App() {
  const [pokes,setPokes] = useState([]);
  pokeList.next().then(setPokes);

  return (
    <div>
      <header>Pokedex</header>
      <main>
      </main>
    </div>
  );
}

export default App;
