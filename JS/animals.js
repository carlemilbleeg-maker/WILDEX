const seenAnimals = JSON.parse(localStorage.getItem("seenAnimals")) || [];

function createPokedexCard(animal) {
  const isSeen = seenAnimals.includes(animal.id);

  return `
    <div class="pokedex-card ${isSeen ? "seen" : "unseen"}">
      <a href="${animal.link}#${animal.id}">
        <img src="${animal.image}" alt="${isSeen ? animal.name : "Ukendt dyr"}">
        <p>${isSeen ? animal.name : "???"}</p>
      </a>
    </div>
  `;
}

function renderPokedex() {
  const container = document.getElementById("pokedex-container");

  if (!container) {
    console.log("Container ikke fundet");
    return;
  }

  if (!Array.isArray(animals)) {
    console.log("animals findes ikke eller er ikke et array");
    return;
  }

  container.innerHTML = animals.map(createPokedexCard).join("");
}

document.addEventListener("DOMContentLoaded", renderPokedex);