const STORAGE_KEYS = {
  seenAnimals: "seenAnimals",
  sightings: "wilddexSightings",
  mapPins: "wilddexMapPins"
};

const regionConfig = [
  { key: "Greenland", label: "Greenland" },
  { key: "Denmark", label: "Denmark" },
  { key: "Africa", label: "Africa" }
];

const categoryConfig = [
  { key: "pattedyr", containerName: "pattedyr" },
  { key: "birds", containerName: "fugle" },
  { key: "fish", containerName: "fisk" }
];

let seenAnimals = getStoredArray(STORAGE_KEYS.seenAnimals);
let sightings = getStoredObject(STORAGE_KEYS.sightings);
let mapPins = getStoredArray(STORAGE_KEYS.mapPins);
let selectedMapAnimalId = null;
let activeMapRegion = "Greenland";

let wildDexMap = null;
let mapLayerGroup = null;

const regionMapConfig = {
  Greenland: {
    center: [71.7069, -42.6043],
    zoom: 4
  },
  Denmark: {
    center: [56.2639, 9.5018],
    zoom: 6
  },
  Africa: {
    center: [0.0236, 20.3418],
    zoom: 3
  }
};


function getStoredArray(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function getStoredObject(key) {
  return JSON.parse(localStorage.getItem(key)) || {};
}

function saveSeenAnimals() {
  localStorage.setItem(STORAGE_KEYS.seenAnimals, JSON.stringify(seenAnimals));
}

function saveSightings() {
  localStorage.setItem(STORAGE_KEYS.sightings, JSON.stringify(sightings));
}

function saveMapPins() {
  localStorage.setItem(STORAGE_KEYS.mapPins, JSON.stringify(mapPins));
}

function getAnimalSightings(animalId) {
  return sightings[animalId] || [];
}

function getSeenAnimalsByRegion(region) {
  return animals.filter(animal =>
    animal.region === region && seenAnimals.includes(animal.id)
  );
}

function toggleSeen(animalId) {
  if (seenAnimals.includes(animalId)) {
    seenAnimals = seenAnimals.filter(id => id !== animalId);
  } else {
    seenAnimals.push(animalId);
  }

  saveSeenAnimals();
  renderPage();
}

function addSighting(animalId, location, date, time) {
  const newSighting = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    animalId,
    location,
    date,
    time,
    createdAt: new Date().toISOString()
  };

  if (!sightings[animalId]) {
    sightings[animalId] = [];
  }

  sightings[animalId].push(newSighting);

  if (!seenAnimals.includes(animalId)) {
    seenAnimals.push(animalId);
  }

  saveSightings();
  saveSeenAnimals();
  renderPage();
}

function createAnimalCard(animal) {
  const isSeen = seenAnimals.includes(animal.id);
  const animalSightings = getAnimalSightings(animal.id);
  const latestSightings = animalSightings.slice(-2).reverse();

  return `
    <article class="animal ${isSeen ? "seen" : ""} ${animal.rarity === "rare" ? "rare-animal" : ""}">
      ${animal.rarity === "rare" ? `<span class="rarity-badge">Rare</span>` : ""}

      <img src="${animal.image}" alt="${animal.name}">

      <div class="animal-info">
        <h3>${animal.name}</h3>
        <p>${animal.description}</p>
        <span class="animal-meta">${animal.region} · ${animal.category}</span>
      </div>

      <div class="animal-actions">
        <button type="button" data-action="toggle-seen" data-id="${animal.id}">
          ${isSeen ? "Unsee" : "Set"}
        </button>

        <button type="button" data-action="select-map-animal" data-id="${animal.id}">
          Pin on map
        </button>

        <a href="${animal.link}#${animal.id}" class="learn-more-btn">Learn more</a>
      </div>

      <form class="sighting-form" data-id="${animal.id}">
        <input type="text" name="location" placeholder="Location" required>
        <input type="date" name="date" required>
        <input type="time" name="time" required>
        <button type="submit">Log sighting</button>
      </form>

      <div class="sightings-list">
        <strong>${animalSightings.length} sightings</strong>
        ${latestSightings.map(sighting => `
          <p>${sighting.location} · ${sighting.date} ${sighting.time}</p>
        `).join("")}
      </div>
    </article>
  `;
}

function renderCategory(region, category, containerId) {
  const container = document.getElementById(containerId);

  if (!container) return;

  const filteredAnimals = animals.filter(animal =>
    animal.region === region && animal.category === category
  );

  container.innerHTML = filteredAnimals.map(createAnimalCard).join("");
}

function renderAllAnimals() {
  regionConfig.forEach(region => {
    categoryConfig.forEach(category => {
      renderCategory(
        region.key,
        category.key,
        `${region.key.toLowerCase()}-${category.containerName}-list`
      );
    });
  });

  updateTracker();
  updateRegionProgress();
}

function updateTracker() {
  const totalAnimals = animals.length;
  const seenCount = seenAnimals.length;
  const percent = totalAnimals === 0 ? 0 : Math.round((seenCount / totalAnimals) * 100);

  const tracker = document.getElementById("tracker");
  const progressFill = document.getElementById("progress-fill");

  if (tracker) {
    tracker.textContent = `Du har set ${seenCount} ud af ${totalAnimals} dyr (${percent}%)`;
  }

  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }
}

function updateRegionProgress() {
  const container = document.getElementById("region-progress");

  if (!container) return;

  container.innerHTML = regionConfig.map(region => {
    const total = animals.filter(animal => animal.region === region.key).length;
    const seen = getSeenAnimalsByRegion(region.key).length;
    const percent = total === 0 ? 0 : Math.round((seen / total) * 100);

    return `
      <div class="region-progress-card">
        <div>
          <strong>${region.label}</strong>
          <span>${seen}/${total} animals</span>
        </div>
        <div class="mini-progress">
          <div style="width: ${percent}%"></div>
        </div>
      </div>
    `;
  }).join("");
}

function createPokedexCard(animal) {
  const isSeen = seenAnimals.includes(animal.id);

  return `
    <article class="pokedex-card ${isSeen ? "seen" : "unseen"} ${animal.rarity === "rare" ? "rare-animal" : ""}">
      <a href="${animal.link}#${animal.id}">
        <img src="${animal.image}" alt="${isSeen ? animal.name : "Unknown animal"}">
        <p>${isSeen ? animal.name : "???"}</p>
      </a>
    </article>
  `;
}

function renderPokedex() {
  const container = document.getElementById("pokedex-container");

  if (!container) return;

  container.innerHTML = animals.map(createPokedexCard).join("");
}

function initAccordions() {
  document.querySelectorAll(".region").forEach(region => {
    const title = region.querySelector(".region-title");
    const content = region.querySelector(".region-content");
    const label = region.querySelector(".region-label");

    if (!title || !content || !label) return;

    content.style.display = "none";

    title.addEventListener("click", () => {
      const isOpen = content.style.display === "block";

      content.style.display = isOpen ? "none" : "block";
      label.textContent = isOpen
        ? label.textContent.replace("▲", "▼")
        : label.textContent.replace("▼", "▲");
    });
  });

  document.querySelectorAll(".category").forEach(category => {
    const title = category.querySelector(".category-title");
    const content = category.querySelector(".animals");

    if (!title || !content) return;

    content.style.display = "none";

    title.addEventListener("click", () => {
      const isOpen = content.style.display === "flex";
      content.style.display = isOpen ? "none" : "flex";
    });
  });
}

function initLearnMoreRegionMenu() {
  const container = document.getElementById("learn-region-menu");

  if (!container || typeof animals === "undefined") return;

  container.innerHTML = regionConfig.map(region => {
    const regionAnimals = animals.filter(animal => animal.region === region.key);

    return `
      <div class="learn-region-group">
        <button type="button" class="learn-region-toggle">
          <span>${region.label}</span>
          <span>▼</span>
        </button>

        <div class="learn-animal-menu">
          ${regionAnimals.map(animal => `
            <a href="#${animal.id}" class="learn-animal-link" data-learn-animal="${animal.id}">
              ${animal.name}
            </a>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");

  container.addEventListener("click", event => {
    const toggle = event.target.closest(".learn-region-toggle");
    const animalLink = event.target.closest("[data-learn-animal]");

    if (toggle) {
      const group = toggle.closest(".learn-region-group");
      group.classList.toggle("open");

      const arrow = toggle.querySelector("span:last-child");
      arrow.textContent = group.classList.contains("open") ? "▲" : "▼";
    }

    if (animalLink) {
      openLearnMoreAnimal(animalLink.dataset.learnAnimal);
    }
  });

  document.querySelectorAll(".mereviden").forEach(section => {
    const title = section.querySelector("h2");

    if (!title) return;

    title.addEventListener("click", () => {
      section.classList.toggle("open");
      section.classList.remove("highlighted");
    });
  });

  openLearnMoreAnimalFromHash();
}

function closeAllLearnMoreAnimals() {
  document.querySelectorAll(".mereviden").forEach(section => {
    section.classList.remove("open", "highlighted");
  });
}

function openLearnMoreAnimal(animalId) {
  const section = document.getElementById(animalId);

  if (!section) return;

  closeAllLearnMoreAnimals();
  section.classList.add("open", "highlighted");
  section.scrollIntoView({ behavior: "smooth", block: "center" });
}

function openLearnMoreAnimalFromHash() {
  const animalId = decodeURIComponent(window.location.hash.replace("#", ""));

  if (animalId) {
    openLearnMoreAnimal(animalId);
  }
}

function initMap() {
  const mapElement = document.getElementById("wild-map");
  const tabs = document.getElementById("map-region-tabs");

  if (!mapElement || !tabs) return;

  if (typeof L === "undefined") {
    console.log("Leaflet er ikke loaded. Tjek script-tagget i dexsiden.html");
    return;
  }

  tabs.innerHTML = regionConfig.map(region => `
    <button type="button" data-map-region="${region.key}" class="${region.key === activeMapRegion ? "active" : ""}">
      ${region.label}
    </button>
  `).join("");

  const startRegion = regionMapConfig[activeMapRegion];

  wildDexMap = L.map("wild-map").setView(startRegion.center, startRegion.zoom);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(wildDexMap);

  mapLayerGroup = L.layerGroup().addTo(wildDexMap);

  tabs.addEventListener("click", event => {
    const button = event.target.closest("[data-map-region]");
    if (!button) return;

    activeMapRegion = button.dataset.mapRegion;

    tabs.querySelectorAll("button").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.mapRegion === activeMapRegion);
    });

    moveMapToRegion(activeMapRegion);
    renderMapPins();
  });

  wildDexMap.on("click", event => {
    if (!selectedMapAnimalId) return;

    const animal = animals.find(item => item.id === selectedMapAnimalId);
    if (!animal) return;

    mapPins.push({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      animalId: animal.id,
      region: activeMapRegion,
      lat: event.latlng.lat,
      lng: event.latlng.lng,
      createdAt: new Date().toISOString()
    });

    if (!seenAnimals.includes(animal.id)) {
      seenAnimals.push(animal.id);
      saveSeenAnimals();
    }

    saveMapPins();
    renderPage();
  });

  renderMapPins();
}

function moveMapToRegion(region) {
  if (!wildDexMap || !regionMapConfig[region]) return;

  wildDexMap.setView(
    regionMapConfig[region].center,
    regionMapConfig[region].zoom
  );
}

function selectAnimalForMap(animalId) {
  const animal = animals.find(item => item.id === animalId);
  const selectedText = document.getElementById("map-selected-animal");
  const mapSection = document.querySelector(".map-section");
  const tabs = document.getElementById("map-region-tabs");

  if (!animal || !selectedText) return;

  selectedMapAnimalId = animal.id;
  activeMapRegion = animal.region;

  selectedText.textContent = `Selected: ${animal.name}`;

  if (tabs) {
    tabs.querySelectorAll("button").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.mapRegion === activeMapRegion);
    });
  }

  moveMapToRegion(activeMapRegion);
  renderMapPins();

  if (mapSection) {
    mapSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function renderMapPins() {
  if (!wildDexMap || !mapLayerGroup) return;

  mapLayerGroup.clearLayers();

  const visiblePins = mapPins.filter(pin =>
    pin.region === activeMapRegion &&
    typeof pin.lat === "number" &&
    typeof pin.lng === "number"
  );

  visiblePins.forEach(pin => {
    const animal = animals.find(item => item.id === pin.animalId);
    if (!animal) return;

    L.marker([pin.lat, pin.lng])
      .addTo(mapLayerGroup)
      .bindPopup(`
        <strong>${animal.name}</strong>
        <span>${animal.region} · ${animal.category}</span>
      `);
  });
}

function initEvents() {
  document.addEventListener("click", event => {
    const seenButton = event.target.closest("[data-action='toggle-seen']");
    const mapButton = event.target.closest("[data-action='select-map-animal']");

    if (seenButton) {
      toggleSeen(seenButton.dataset.id);
    }

    if (mapButton) {
      selectAnimalForMap(mapButton.dataset.id);
    }
  });

  document.addEventListener("submit", event => {
    const form = event.target.closest(".sighting-form");
    if (!form) return;

    event.preventDefault();

    const formData = new FormData(form);

    addSighting(
      form.dataset.id,
      formData.get("location"),
      formData.get("date"),
      formData.get("time")
    );
  });
}

function renderPage() {
  if (document.querySelector(".animals")) {
    renderAllAnimals();
  }

  if (document.getElementById("pokedex-container")) {
    renderPokedex();
  }

  if (document.getElementById("wild-map")) {
    renderMapPins();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initAccordions();
  initEvents();
  initMap();
  initLearnMoreRegionMenu();
  renderPage();

  window.addEventListener("hashchange", openLearnMoreAnimalFromHash);
});

