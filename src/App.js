import React, {useState} from 'react';
import {Pokedex} from 'pokeapi-js-wrapper';

async function* pokeListGenerator() {
  const dex = new Pokedex({protocol: 'https'});

  let interval = {limit: 50, offset: 0};
  let curr, next;

  curr = await dex.getPokemonsList(interval);
  while(curr.next) {
/**
 * the downside of placing this in the while loop is that it increases the
 * wait time to the moment of request, rather than capitalizing on pre-fetch
**/
    curr = curr.results.map(poke => fetch(poke.url).then(rsp => rsp.json()));
    curr = await Promise.all(curr);

    interval.offset+=interval.limit;
    next = dex.getPokemonsList(interval);
    yield await curr;
    curr = await next;
  }
};

const pokeList = pokeListGenerator();

function App() {
  const [pokes,setPokes] = useState([]);
//  pokeList.next().then(setPokes);

  return (
    <div>
      <header>Pokedex</header>
      <main>
        <ul>
          {pokes.map(poke => <li>{poke.name}</li>)}
        </ul>
        <button onClick={() => pokeList.next().then(rsp => setPokes([...pokes, ...rsp.value]))}>
          Get Pokemon!
        </button>
      </main>
    </div>
  );
}

export default App;
