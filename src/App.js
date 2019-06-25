import React, {useState, useEffect} from 'react';
import {createPortal} from 'react-dom';
import {Pokedex} from 'pokeapi-js-wrapper';

import './App.css';

async function* pokeListGenerator() {
  const dex = new Pokedex({protocol: 'https'});

  let interval = {limit: 100, offset: 0};
  let curr, next;

  const getHydratedPokes = interval =>
    dex.getPokemonsList(interval).then(({results, ...rest}) =>
      ({...rest, results: Promise.all(results.map(poke =>
        fetch(poke.url).then(rsp => rsp.json())
                       .then(mon => fetch(mon.species.url).then(rsp => rsp.json())
                         .then(speciesData => ({...mon, species: speciesData})) //)
                         .then(pokemon => fetch(pokemon.sprites.front_default).then(rsp => rsp.blob())
                           .then(img => ({...pokemon, sprites: {front_default: URL.createObjectURL(img)}}))))
      ))})
    );

  curr = await getHydratedPokes(interval);

  while(!curr.done) {
    interval.offset+=interval.limit;
    next = getHydratedPokes(interval);
    yield await curr.results;
    curr = await next;
  }
};

const pokeList = pokeListGenerator();

function Modal({children,closeBehavior}) {
  return createPortal(
    <div onClick={closeBehavior}>
      <div>{children}</div>
    </div>,
    document.getElementById('modal-root')
  );
}

const pokeCallManager = call => (currPokes, setPokes) => () => {
  if(!call && document.body.clientHeight <= window.pageYOffset + 2 * document.documentElement.clientHeight) {
    call = true;
    pokeList.next().then(rsp => {
      setPokes([...currPokes, ...rsp.value]);
    });
  }
}

function App() {
  const [pokes,setPokes] = useState([]);
  const [activePoke, setActivePoke] = useState();

  let call = false;

  const getNextPokes = pokeCallManager(call);

  useEffect(() => {
    let pokeRetrieve = getNextPokes(pokes, setPokes);
    window.addEventListener('scroll', pokeRetrieve);
    return () => window.removeEventListener('scroll', pokeRetrieve);
  }, [pokes]);

  useEffect(() => {
    getNextPokes(pokes, setPokes)();
  }, []);

  return (
    <div class="App">
      <header class="App-header">Pokedex</header>
      <main>
        <ul>
          {pokes.filter(poke => poke.id < 803).map(poke => <li onClick={event => setActivePoke(poke)}><img src={poke.sprites.front_default} alt={poke.name} />{`${poke.id}: ${poke.name}`}</li>)}
        </ul>
      </main>
      { activePoke &&
        <Modal closeBehavior={event => setActivePoke()}>
          <h2>{`${activePoke.species.genera.filter(gen => gen.language.name === "en")[0].genus} ${activePoke.name}`}</h2>
          <img src={activePoke.sprites.front_default} />
          <h3>Stats</h3>
           <dl>
             <dt>Height:</dt><dd>{activePoke.height} decimeters</dd>
             <dt>Weight:</dt><dd>{activePoke.weight} hectograms</dd>
           </dl>
          <h3>Types</h3>
          <ul>
            {activePoke.types.map(type => <li>{type.type.name}</li>)}
          </ul>
          <p>{activePoke.species.flavor_text_entries.filter(flavor => flavor.language.name === "en")[0].flavor_text}</p>
        </Modal>
      }
    </div>
  );
}

export default App;
