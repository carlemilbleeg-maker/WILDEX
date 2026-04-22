const regions = document.querySelectorAll(".region");

regions.forEach(function(region){

  const title = region.querySelector(".region-title");
  const content = region.querySelector(".region-content");
  const label = region.querySelector(".region-label");

  content.style.display = "none";

  title.addEventListener("click", function(){

    if(content.style.display === "block"){
      content.style.display = "none";
      label.textContent = label.textContent.replace("▲", "▼");
    } else {
      content.style.display = "block";
      label.textContent = label.textContent.replace("▼", "▲");
    }

  });

});

const categories = document.querySelectorAll(".category");

categories.forEach(function(category) {
  const title = category.querySelector(".category-title");
  const content = category.querySelector(".animals");

  content.style.display = "none";

  title.addEventListener("click", function() {
    if (content.style.display === "flex") {
      content.style.display = "none";
    } else {
      content.style.display = "flex";
    }
  });
});
// Kode der omhandler åben/lukke af kategorierne GRØNLAND SLUT


// Kode der omhandler åben/lukke af kategorierne DANMARK



// Kode til dyr
const animals = [
 {
	name: "Isbjørn",
	image: "Images/animals/isbjornen.png",
	category: "pattedyr",
	description: "Top rovdyr i Arktis",
	region: "Greenland",
	id: "isbjørn",
	rarity: "rare",
	link: "learnmore.html"
	 },
  {
    name: "Moskusokse",
    image: "Images/animals/moskusokse.png",
    category: "pattedyr",
	description: "Vejer 180-400 kg.",
	region: "Greenland",
	id: "moskusokse",
	rarity: "rare",
    link: "learnmore.html"
  },
  {
    name: "Polarræv",
    image: "Images/animals/polarrav.png",
    category: "pattedyr",
	description: "To slags ræv. Blåræv og hvidræv",
	region: "Greenland",
	id: "polarræv",
	rarity: "rare",
    link: "learnmore.html"
  },
  {
	name: "Rensdyr",
	image: "Images/animals/rensdyr.png",
	category: "pattedyr",
	description: "Hanner vejer op til 300 kg. Renen er den eneste hjort, hvor begge køn bærer gevir",
	region: "Greenland",
	id: "rensdyr",
	rarity: "uncommon",
	link: "learnmore.html"
  },
  {
	name: "Polarulv",
	image: "Images/animals/polarulv.png",
	category: "pattedyr",
	description: "Er en underart af grå ulv, som kun findes i Grønland og på Ellesmere Island",
	region: "Greenland",
	id: "polarulv",
	rarity: "rare",
	link: "learnmore.html"
  },
  {
   name: "Sæl (Ringsæl)",
   image: "Images/animals/ringsael.png",
   category: "pattedyr",
   description: "Den mest almindelige sæl i Grønland",
   region: "Greenland",
   id: "ringsæl",
   rarity: "uncommon",
   link: "learnmore.html"
   },
   {
   name: "Hvalros",
   image: "Images/animals/hvalros.png",
   category: "pattedyr",
   description: "Kendt for sine lange stødtænder",
   region: "Greenland",
   id: "hvalros",
   rarity: "rare",
   link: "learnmore.html"
   },
   {
   name: "Narhval",
   image: "Images/animals/narhval.png",
   category: "pattedyr",
   description: "Har en lang spiralformet tand",
   region: "Greenland",
   id: "narhval",
   rarity: "uncommon",
   link: "learnmore.html"
    },
    {
   name: "Grønlandshval",
   image: "Images/animals/gronlandshval.png",
   category: "pattedyr",
   description: "Kan blive over 200 år gammel",
   region: "Greenland",
   id: "grønlandshval",
   rarity: "uncommon",
   link: "learnmore.html"
    },

  // Fugle
  {
    name: "Jagtfalk",
    image: "Images/animals/Jagtfalken.png",
    category: "birds",
	description: "Jagtfalken er en frygtindgydende jæger",
	region: "Greenland",
	id: "jagtfalk",
	rarity: "uncommon",
    link: "learnmore.html"
  },
  {
    name: "Havørn",
    image: "Images/animals/Havorn.png",
    category: "birds",
	description: "Har et vingefang på 2,5 meter, og er Grønlands største fugl",
	region: "Greenland",
	id: "havørn",
	rarity: "common",
    link: "learnmore.html"
  },
  {
	name: "Sneugle / Uppik",
	image: "Images/animals/Sneugle.png",
	category: "birds",
	description: "Sneuglen kan svæve helt lydløst over sneen",
	region: "Greenland",
	id: "sneugle",
	rarity: "rare",
	link: "learnmore.html"
  }, 
  {
	name: "Vandrefalk / Kiinaaleeraq",
	image: "Images/animals/vandrefalk.png",
	category: "birds",
	description: "Berømt for at være verdens hurtigste dyr. Der er målt en topfart på 350 km/t.",
	region: "Greenland",
	id: "vandrefalk",
	rarity: "rare",
	link: "learnmore.html"
  },
  {
    name: "Fjeldrype / Aqisseq",
  	image: "Images/animals/Fjeldrype.png",
  	category: "birds",
  	description: "Grønlands eneste hønsefugl",
  	region: "Greenland",
  	id: "fjeldrype",
	rarity: "common",
  	link: "learnmore.html"
  },
  {
	name: "Ravn / Tulugaq",
	image: "Images/animals/ravn.png",
	category: "birds",
	description: "Ravnen er verdens største kragefugl",
	region: "Greenland",
	id: "ravn",
	rarity: "common",
	link: "learnmore.html"
  },
  {
    name: "Kongeedderfugl / Miteq Sioraki",
  	image: "Images/animals/kongeedderfugl.png",
  	category: "birds",
  	description: "Hannen har en farvestrålende yngledragt",
	regoin: "Greenland",
  	id: "kongeedderfugl",
	rarity: "uncommon",
	link: "learnmore.html"
  },
  {
      name: "Lomvie / Appa",
      image: "Images/animals/Lomvie.png",
      category: "birds",
      description: "Lever i store kolonier på fuglefjelde",
      region: "Greenland",
      id: "lomvie",
	  rarity: "common",
      link: "learnmore.html"
    },
    {
      name: "Tejst",
      image: "Images/animals/Tejst.png",
      category: "birds",
      description: "Sort fugl med hvide vingefelter",
      region: "Greenland",
      id: "tejst",
	  rarity: "common",
      link: "learnmore.html"
    },
    {
      name: "Snespurv",
      image: "Images/animals/Snespurv.png",
      category: "birds",
      description: "En af de nordligst ynglende småfugle",
      region: "Greenland",
      id: "snespurv",
	  rarity: "common",
      link: "learnmore.html"
    },
  // fisk
  {
    name: "Torsk / Saarullik",
    image: "Images/animals/Torsk.png",
    category: "fish",
	description: "Kan veje op til 15-30 kg. ",
	region: "Greenland",
	id: "torsk",
	rarity: "common",
    link: "learnmore.html"
  },
  {
	name: "Stor rødfisk / Suluppaagaq",
	image: "Images/animals/Rodfisk.png",
	category: "fish",
	description: "Stor mund med underbid og store øjne. Har 5 ugiftet pigge",
	region: "Greenland",
	id: "rødfisk",
	rarity: "common",
	link: "learnmore.html"
  },
  {
     name: "Hellefisk / Qaleralik",
     image: "Images/animals/Hellefisk.png",
     category: "fish",
     description: "En vigtig eksportfisk fra Grønland",
     region: "Greenland",
     id: "hellefisk",
	 rarity: "uncommon",
     link: "learnmore.html"
   },
   {
     name: "Laks",
     image: "Images/animals/Laks.png",
     category: "fish",
     description: "Vandrer mellem hav og ferskvand",
     region: "Greenland",
     id: "laks",
	 rarity: "uncommon",
     link: "learnmore.html"
   },
    {
	name: "Lion",
	image: "Images/animals/Lion.png",
	category: "pattedyr",
	description: "Største kødæder",
	region: "Africa",
	id: "Lion",
	rarity:"uncommon",
	link: "learnmore.html"
   }
   
];

let seenAnimals = JSON.parse(localStorage.getItem("seenAnimals")) || [];

function createAnimalCard(animal) {
  const isSeen = seenAnimals.includes(animal.id);

  return `
    <div class="animal ${isSeen ? "seen" : ""}">
      <img src="${animal.image}" alt="${animal.name}">
      <p>${animal.name}</p>
      <button onclick="toggleSeen('${animal.id}')">
        ${isSeen ? "Unsee" : "Set"}
      </button>
      <a href="${animal.link}#${animal.id}" class="learn-more-btn">Learn more!</a>
    </div>
  `;
}

function toggleSeen(id) {
  if (seenAnimals.includes(id)) {
    seenAnimals = seenAnimals.filter(animalId => animalId !== id);
  } else {
    seenAnimals.push(id);
  }

  localStorage.setItem("seenAnimals", JSON.stringify(seenAnimals));
  renderAllAnimals();
}

function renderCategory(region, category, containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.log("Container ikke fundet:", containerId);
    return;
  }

  const filteredAnimals = animals.filter(animal =>
    animal.region === region && animal.category === category
  );

  container.innerHTML = filteredAnimals.map(animal => createAnimalCard(animal)).join("");
}

function updateTracker() {
  const totalAnimals = animals.length;
  const seenCount = seenAnimals.length;
  const percent = Math.round((seenCount / totalAnimals) * 100);

  const tracker = document.getElementById("tracker");
  const progressFill = document.getElementById("progress-fill");

  if (tracker) {
    tracker.textContent = `Du har set ${seenCount} ud af ${totalAnimals} dyr (${percent}%)`;
  }

  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }
}

function renderAllAnimals() {
  renderCategory("Greenland", "pattedyr", "greenland-pattedyr-list");
  renderCategory("Greenland", "birds", "greenland-fugle-list");
  renderCategory("Greenland", "fish", "greenland-fisk-list");

  renderCategory("Africa", "pattedyr", "africa-pattedyr-list");
  renderCategory("Africa", "birds", "africa-fugle-list");
  renderCategory("Africa", "fish", "africa-fisk-list");

  renderCategory("Denmark", "pattedyr", "denmark-pattedyr-list");
  renderCategory("Denmark", "birds", "denmark-fugle-list");
  renderCategory("Denmark", "fish", "denmark-fisk-list");

  updateTracker();
}

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
    console.log("Pokedex-container ikke fundet");
    return;
  }

  container.innerHTML = animals.map(createPokedexCard).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("greenland-pattedyr-list") ||
      document.getElementById("africa-pattedyr-list") ||
      document.getElementById("denmark-pattedyr-list")) {
    renderAllAnimals();
  }

  if (document.getElementById("pokedex-container")) {
    renderPokedex();
  }
});