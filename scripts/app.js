const baseUrl ="https://pokeapi.co/api/v2/pokemon/";

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("search");

const pokemonName = document.getElementById("pokemonName");
const pokemonImg = document.getElementById("pokemonImg");
const imgHint = document.getElementById("imgHint");
const moveList = document.getElementById("moveList");
const abilitiesList = document.getElementById("abilitiesList");

const pokemonType = document.getElementById("pokemonType");
const pokemonLocation = document.getElementById("pokemonLocation");
const pokemonEvolution = document.getElementById("pokemonEvolution");

const favoriteBtn = document.getElementById("favoriteBtn");
const favorites = document.getElementById("favorites");

let normalSprite = "";
let shinySprite = "";
let isShiny = "";

//favorites array
let favoritesList = [];

//track current pokemon
let currentPokemon = "";

//------------load favorites--------

const savedFavorites = localStorage.getItem("favoritesList");

if(savedFavorites){
    favoritesList = JSON.parse(savedFavorites);
    renderFavorites();
}


//---------- EVENTS--------
//Button Click
searchBtn.addEventListener("click", searchPokemon);

//Image click event
pokemonImg.addEventListener("click", () => {
    if(normalSprite === "" || shinySprite === "")
        return;    

    //Switch between shiny and normal
    if(isShiny === false){
        pokemonImg.src = shinySprite;
        imgHint.textContent ="Normal";
        isShiny = true;
    } else {
        pokemonImg.src = normalSprite;
        imgHint.textContent = "Shiny";
        isShiny = false;
    }    
});        

    //Click favorite button
    favoriteBtn.addEventListener("click", () => {
        if(currentPokemon === "") return;

        //prevent duplicates
        if(favoritesList.includes(currentPokemon)) return;

        favoritesList.push(currentPokemon);

        //Save
        localStorage.setItem("favoritesList", JSON.stringify(favoritesList));

        //Update UI
        renderFavorites();
    });

    //-------------FUNCTIONS------------------


    //Favorites Function
    function renderFavorites(){
        //clear box
        favorites.innerHTML = "";

        //show each favorite
        for(let i = 0; i < favoritesList.length; i++){
            favorites.innerHTML += `<p>${favoritesList[i]}<p>`;
        }
    }

async function searchPokemon(){
    const userSearch = searchInput.value.toLowerCase().trim();

    if(userSearch === ""){
        return;
    }    
    
    //Clear old data
    pokemonName.textContent = "Loading...";
    pokemonImg.src = "";
    imgHint.textContent = "";
    pokemonType.textContent = "";
    pokemonLocation.textContent = "";
    pokemonEvolution.textContent = "";
    moveList.textContent = "";
    abilitiesList.textContent = "";
    
    
    // 1) FetchPokemon
    const pokemonResponse = await fetch(baseUrl + userSearch);
    
    //If not found
    if(pokemonResponse.status !== 200){
        pokemonName.textContent = "Not found";
        imgHint.textContent = "Try: pikachu, charmander, bulbasaur...";
        return;
    }    
    
    const pokemonData = await pokemonResponse.json();
    currentPokemon = pokemonData.name;
    
    //Name
    pokemonName.textContent = pokemonData.name;

    //Sprites (normal/shiny)
    normalSprite = pokemonData.sprites.front_default;
    shinySprite = pokemonData.sprites.front_shiny;
    isShiny = false;
    
    //Image
    pokemonImg.src = pokemonData.sprites.front_default;
    imgHint.textContent = "";
    
    //Type (first type only, beginner friendly)
    pokemonType.textContent = pokemonData.types[0].type.name;
    
    //Moves(first 5)
    let movesText = "";
    for(let i = 0; i < 5; i++){
        movesText += pokemonData.moves[i].move.name + ", ";
        
    }    
    movesText = movesText.slice(0, -2);
    moveList.textContent = movesText;

    //Abilities
    let abilitiesText = "";

for (let i = 0; i < pokemonData.abilities.length; i++) {
  abilitiesText += pokemonData.abilities[i].ability.name + ", ";
}

abilitiesText = abilitiesText.slice(0, -2);
abilitiesList.textContent = abilitiesText;
    
    // 2) Fetch Location (encounters)
    const locationResponse = await fetch(baseUrl + pokemonData.id + "/encounters");
    const locationData = await locationResponse.json();
    
    if(locationData.length === 0){
        pokemonLocation.textContent ="No location found.";
    } else {
        pokemonLocation.textContent = locationData[0].location_area.name;
    }    
    
    
    // 3) Fetch Evolution (species -> evolution chain)
    const speciesResponse = await fetch(pokemonData.species.url);
    const speciesData = await speciesResponse.json();
    
    const evoResponse = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoResponse.json();
    
    // Evolution chain (simple version)
    let evoText = evoData.chain.species.name;
    
    if(evoData.chain.evolves_to.length > 0){
        evoText += " -> " + evoData.chain.evolves_to[0].species.name;
    }    
    
    if(
        evoData.chain.evolves_to.length > 0 &&
        evoData.chain.evolves_to[0].evolves_to.length > 0
    ){
        evoText += " -> " + evoData.chain.evolves_to[0].evolves_to[0].species.name;
    }    
    pokemonEvolution.textContent = evoText;    

}