
async function getTypeList() {
  const data = await fetch('https://pokeapi.co/api/v2/type');
  const res:any = await data.json();
  return res.results;
}

type idOrName = number | string;

async function getPokeListByType(params:idOrName) {
  if (!params) return [];
  const data = await fetch(`https://pokeapi.co/api/v2/type/${params}`);
  const res:any = await data.json();
  return res.pokemon;
};

async function getPokemonInfo(params:idOrName) {
  if (!params) return [];
  const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${params}`);
  const res:any = await data.json();
  return {
    img: res.sprites.other.showdown.front_shiny || res.sprites.other.home.front_shiny,
    name:res.name,
    number: res.id,
    type: res.types.map((t: any) => t.type.name)
  };
};

async function geInitList(size: number, start = 0) {
  const data = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${size}&offset=${start}`);
  const res:any = await data.json();
  return res;
};



export {
  getTypeList,
  getPokeListByType,
  getPokemonInfo,
  geInitList
};