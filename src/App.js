import React, {useState, useEffect} from 'react';
import {createPortal} from 'react-dom';
import {Pokedex} from 'pokeapi-js-wrapper';

import './App.css';

async function* pokeListGenerator() {
  const dex = new Pokedex({protocol: 'https'});

  let interval = {limit: 100, offset: 0};
  let curr, next;

  curr = await dex.getPokemonsList(interval);
  curr.results = await Promise.all(curr.results.map(poke => fetch(poke.url).then(rsp => rsp.json())));

  while(!curr.done) {
    interval.offset+=interval.limit;

    next = dex.getPokemonsList(interval).then(({results, ...rest}) => (
      {...rest, results: Promise.all(results.map(poke => fetch(poke.url).then(rsp => rsp.json())))}
    ));

    yield await curr.results;
    curr = await next;
  }
};

const pokeList = pokeListGenerator();

function Modal({poke,closeBehavior}) {
  return createPortal(<div onClick={closeBehavior}><h2>{poke.name}</h2></div>, document.getElementById('modal-root'));
}

function App() {
  const [pokes,setPokes] = useState([]);
  const [activePoke, setActivePoke] = useState();

  let call = false;

  const getNextPokes = (currPokes) => () => {
    if(!call && document.body.clientHeight <= window.pageYOffset + 2 * document.documentElement.clientHeight) {
      call = true;
      pokeList.next().then(rsp => {
        setPokes([...currPokes, ...rsp.value]);
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
          {pokes.filter(poke => poke.id < 803).map(poke => <li onClick={event => setActivePoke(poke)}><img src={poke.sprites.front_default} alt={poke.name} />{`${poke.id}: ${poke.name}`}</li>)}
        </ul>
      </main>
      { activePoke && <Modal poke={activePoke} closeBehavior={event => setActivePoke()} /> }
    </div>
  );
}

export default App;
