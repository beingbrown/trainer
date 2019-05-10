import React, {useState, useEffect} from 'react';
import {Pokedex} from 'pokeapi-js-wrapper';

import './App.css';

async function* pokeListGenerator() {
  const dex = new Pokedex({protocol: 'https'});

  let interval = {limit: 100, offset: 0};
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
  let call = false;

  const getNextPokes = (currPokes) => () => {
    if(!call && document.body.clientHeight <= window.pageYOffset + 2 * document.documentElement.clientHeight) {
      call = true;
      pokeList.next().then(rsp => {
        setPokes([...currPokes, ...rsp.value]);
        call = false;
      });
    }
  }

  useEffect(() => {
    let pokeRetrieve = getNextPokes(pokes);
    window.addEventListener('scroll', pokeRetrieve);
    return () => window.removeEventListener('scroll', pokeRetrieve);
  }, [pokes]);

  useEffect(() => {
    getNextPokes(pokes)();
  }, []);

  return (
    <div class="App">
      <header class="App-header">Pokedex</header>
      <main>
        <ul>
          {pokes.filter((poke, idx) => idx < 802).map(poke => <li><img src={poke.sprites.front_default} alt={poke.name} />{`${poke.id}: ${poke.name}`}</li>)}
        </ul>
      </main>
    </div>
  );
}

export default App;
