const STORAGE_KEYS = {
  seenAnimals: "seenAnimals",
  sightings: "wilddexSightings",
  mapPins: "wilddexMapPins",
  unlockedBadges: "wilddexUnlockedBadges"
};

const regionConfig = [
  { key: "Arctic", label: "Arctic", id: "arctic" },
  { key: "Europe", label: "Europe", id: "europe" },
  { key: "Africa", label: "Africa", id: "africa" },
  { key: "NorthAmerica", label: "North America", id: "northamerica" },
  { key: "SouthAmerica", label: "South America", id: "southamerica" },
  { key: "Asia", label: "Asia", id: "asia" },
  { key: "Oceania", label: "Oceania", id: "oceania" },
  { key: "Antarctica", label: "Antarctica", id: "antarctica" },
  { key: "Ocean", label: "Ocean", id: "ocean" }
];

const categoryConfig = [
  { key: "pattedyr", label: "Mammals", containerName: "pattedyr" },
  { key: "birds", label: "Birds", containerName: "fugle" },
  { key: "fish", label: "Fish", containerName: "fisk" }
];

let seenAnimals = getStoredArray(STORAGE_KEYS.seenAnimals);
let sightings = getStoredObject(STORAGE_KEYS.sightings);
let mapPins = getStoredArray(STORAGE_KEYS.mapPins);
let unlockedBadges = getStoredArray(STORAGE_KEYS.unlockedBadges);
let selectedMapAnimalId = null;
let activeMapRegion = "Arctic";

let activeDexFilter = "all";
let activeDexSearch = "";

let wildDexMap = null;
let mapLayerGroup = null;
const regionMapConfig = {
  Arctic: {
    center: [71.7069, -42.6043],
    zoom: 3
  },
  Europe: {
    center: [54.5260, 15.2551],
    zoom: 4
  },
  Africa: {
    center: [0.0236, 20.3418],
    zoom: 3
  },
  NorthAmerica: {
    center: [54.5260, -105.2551],
    zoom: 3
  },
  SouthAmerica: {
    center: [-14.2350, -51.9253],
    zoom: 3
  },
  Asia: {
    center: [34.0479, 100.6197],
    zoom: 3
  },
  Oceania: {
    center: [-22.7359, 140.0188],
    zoom: 4
  },
  Antarctica: {
    center: [-82.8628, 135.0000],
    zoom: 3
  },
  Ocean: {
    center: [0, -30],
    zoom: 2
  }
};

/* ---------- LOCAL STORAGE ---------- */

function getStoredArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function getStoredObject(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
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

function saveUnlockedBadges() {
  localStorage.setItem(STORAGE_KEYS.unlockedBadges, JSON.stringify(unlockedBadges));
}

/* ---------- HELPERS ---------- */

function getRegionId(regionKey) {
  const region = regionConfig.find(item => item.key === regionKey);
  return region ? region.id : regionKey.toLowerCase();
}

function getAnimalSightings(animalId) {
  return sightings[animalId] || [];
}

function getSeenAnimalsByRegion(regionKey) {
  if (typeof animals === "undefined") return [];

  return animals.filter(animal =>
    animal.region === regionKey && seenAnimals.includes(animal.id)
  );
}

function getAnimalCategoryLabel(categoryKey) {
  const category = categoryConfig.find(item => item.key === categoryKey);
  return category ? category.label : categoryKey;
}

function getAnimalDexNumber(animal) {
  return animal.dexNumber ? `No. ${animal.dexNumber}` : "";
}

function getAnimalImage(animal) {
  return animal.pixelImage || animal.image;
}

function getAnimalRegionLabel(animal) {
  if (Array.isArray(animal.region)) {
    return animal.region.join(", ");
  }

  return animal.region;
}

function createUniqueId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Date.now().toString();
}

/* ---------- SEEN / SIGHTINGS ---------- */

function toggleSeen(animalId) {
  const wasSeen = seenAnimals.includes(animalId);

  if (wasSeen) {
    seenAnimals = seenAnimals.filter(id => id !== animalId);
  } else {
    seenAnimals.push(animalId);
  }

  saveSeenAnimals();
  renderPage();

  if (!wasSeen && typeof animals !== "undefined") {
    const animal = animals.find(item => item.id === animalId);

    if (animal) {
      showNewDiscoveryPopup(animal);
    }
  }

  checkForNewBadges();
}

function addSighting(animalId, location, date, time) {
  const newSighting = {
    id: createUniqueId(),
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

  const wasSeen = seenAnimals.includes(animalId);

  if (!wasSeen) {
    seenAnimals.push(animalId);
  }

  saveSightings();
  saveSeenAnimals();
  renderPage();

  if (!wasSeen && typeof animals !== "undefined") {
    const animal = animals.find(item => item.id === animalId);

    if (animal) {
      showNewDiscoveryPopup(animal);
    }
  }

  checkForNewBadges();
}
/* ---------- ANIMAL CARDS ---------- */

function createAnimalCard(animal) {
  const isSeen = seenAnimals.includes(animal.id);
  const animalSightings = getAnimalSightings(animal.id);
  const latestSightings = animalSightings.slice(-2).reverse();
  const categoryLabel = getAnimalCategoryLabel(animal.category);

  return `
    <article class="animal ${isSeen ? "seen" : ""} ${animal.rarity === "rare" ? "rare-animal" : ""}">
      ${animal.rarity === "rare" ? `<span class="rarity-badge">Rare</span>` : ""}

	  <img src="${getAnimalImage(animal)}" alt="${animal.name}">

	  <div class="animal-info">
	    ${animal.dexNumber ? `<span class="dex-number">${getAnimalDexNumber(animal)}</span>` : ""}
	    <h3>${animal.name}</h3>
	    <p>${animal.description}</p>
	    <span class="animal-meta">${getAnimalRegionLabel(animal)} · ${categoryLabel}</span>
	  </div>

	  <div class="animal-actions">
	    <button type="button" data-action="open-animal-modal" data-id="${animal.id}">
	      Open entry
	    </button>

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

function openAnimalModal(animalId) {
  if (typeof animals === "undefined") return;

  const animal = animals.find(item => item.id === animalId);
  const modal = document.getElementById("animal-modal");
  const modalContent = document.getElementById("animal-modal-content");

  if (!animal || !modal || !modalContent) return;

  const isSeen = seenAnimals.includes(animal.id);
  const animalSightings = getAnimalSightings(animal.id);
  const latestSighting = animalSightings[animalSightings.length - 1];
  const categoryLabel = getAnimalCategoryLabel(animal.category);

  modalContent.innerHTML = `
    <div class="animal-entry ${animal.rarity === "rare" ? "rare-entry" : ""}">
      ${animal.rarity === "rare" ? `<span class="entry-rare-badge">Rare encounter</span>` : ""}

	  <div class="animal-entry-image-frame">
	    <img src="${getAnimalImage(animal)}" alt="${animal.name}">
	  </div>

	  <div class="animal-entry-info">
	    ${animal.dexNumber ? `<span class="dex-number">${getAnimalDexNumber(animal)}</span>` : ""}
	    <p class="dex-eyebrow">${getAnimalRegionLabel(animal)} · ${categoryLabel}</p>
	    <h2>${animal.name}</h2>

        <p class="animal-entry-description">
          ${animal.description}
        </p>

        <div class="animal-entry-stats">
          <div>
            <span>Status</span>
            <strong>${isSeen ? "Seen" : "Not seen yet"}</strong>
          </div>

          <div>
            <span>Sightings</span>
            <strong>${animalSightings.length}</strong>
          </div>

          <div>
            <span>Rarity</span>
            <strong>${animal.rarity ? animal.rarity : "common"}</strong>
          </div>
        </div>

        ${latestSighting ? `
          <div class="latest-sighting-box">
            <span>Latest sighting</span>
            <p>${latestSighting.location} · ${latestSighting.date} ${latestSighting.time}</p>
          </div>
        ` : `
          <div class="latest-sighting-box">
            <span>Latest sighting</span>
            <p>No sighting logged yet.</p>
          </div>
        `}

        <div class="animal-entry-actions">
          <button type="button" data-action="toggle-seen" data-id="${animal.id}">
            ${isSeen ? "Unsee animal" : "Mark as seen"}
          </button>

          <button type="button" data-action="select-map-animal" data-id="${animal.id}">
            Pin on map
          </button>

          <a href="${animal.link}#${animal.id}" class="learn-more-btn">
            Learn more
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("animal-modal-hidden");
  document.body.classList.add("modal-open");
}

function closeAnimalModal() {
  const modal = document.getElementById("animal-modal");

  if (!modal) return;

  modal.classList.add("animal-modal-hidden");
  document.body.classList.remove("modal-open");
}

function initDexTools() {
  const searchInput = document.getElementById("animal-search");
  const filterButtons = document.querySelectorAll("[data-filter]");

  if (!searchInput || filterButtons.length === 0) return;

  searchInput.addEventListener("input", event => {
    activeDexSearch = event.target.value.trim();
    renderPage();
  });

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      activeDexFilter = button.dataset.filter;

      filterButtons.forEach(item => {
        item.classList.toggle("active", item.dataset.filter === activeDexFilter);
      });

      renderPage();
    });
  });
}

function renderCategory(region, category, containerId) {
  const container = document.getElementById(containerId);

  if (!container || typeof animals === "undefined") return;

  const searchValue = activeDexSearch.toLowerCase();

  const filteredAnimals = animals.filter(animal => {
    const animalName = animal.name ? animal.name.toLowerCase() : "";
    const animalDescription = animal.description ? animal.description.toLowerCase() : "";
    const animalRegion = animal.region ? animal.region.toLowerCase() : "";
    const animalCategory = animal.category ? animal.category.toLowerCase() : "";

    const matchesRegion = animal.region === region;
    const matchesCategory = animal.category === category;

    const matchesSearch =
      animalName.includes(searchValue) ||
      animalDescription.includes(searchValue) ||
      animalRegion.includes(searchValue) ||
      animalCategory.includes(searchValue);

    const isSeen = seenAnimals.includes(animal.id);
    const isRare = animal.rarity === "rare";

    let matchesFilter = true;

    if (activeDexFilter === "seen") {
      matchesFilter = isSeen;
    }

    if (activeDexFilter === "unseen") {
      matchesFilter = !isSeen;
    }

    if (activeDexFilter === "rare") {
      matchesFilter = isRare;
    }

    return matchesRegion && matchesCategory && matchesSearch && matchesFilter;
  });

  if (filteredAnimals.length === 0) {
    container.innerHTML = `
      <div class="empty-category-message">
        No animals match this search/filter.
      </div>
    `;
    return;
  }

  container.innerHTML = filteredAnimals.map(createAnimalCard).join("");
}

function renderAllAnimals() {
  if (typeof animals === "undefined") return;

  regionConfig.forEach(region => {
    categoryConfig.forEach(category => {
      renderCategory(
        region.key,
        category.key,
        `${region.id}-${category.containerName}-list`
      );
    });
  });

  updateTracker();
  updateRegionProgress();
}

/* ---------- TRACKER ---------- */

function updateTracker() {
  if (typeof animals === "undefined") return;

  const validAnimalIds = animals.map(animal => animal.id);
  const validSeenAnimals = seenAnimals.filter(id => validAnimalIds.includes(id));

  const totalAnimals = animals.length;
  const seenCount = validSeenAnimals.length;
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

  if (!container || typeof animals === "undefined") return;

  const regionsWithAnimals = regionConfig.filter(region =>
    animals.some(animal => animal.region === region.key)
  );

  container.innerHTML = regionsWithAnimals.map(region => {
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

/* ---------- POKEDEX / PROGRESS PAGE ---------- */

function createPokedexCard(animal) {
  const isSeen = seenAnimals.includes(animal.id);
  const isRare = animal.rarity === "rare";

  return `
    <article class="pokedex-card ${isSeen ? "seen" : "unseen"} ${isRare ? "rare-pokedex-card" : ""}">
      ${isRare ? `<span class="pokedex-rare-badge">Rare</span>` : ""}

      <a href="${animal.link}#${animal.id}">
	  <div class="pokedex-image-frame">
	    <img src="${getAnimalImage(animal)}" alt="${isSeen ? animal.name : "Unknown animal"}">
	  </div>

	  ${animal.dexNumber ? `<span class="dex-number">${getAnimalDexNumber(animal)}</span>` : ""}
	  <p>${isSeen ? animal.name : "???"}</p>

        ${isRare && isSeen ? `
          <span class="rare-unlocked-text">Rare discovery unlocked</span>
        ` : ""}

        ${isRare && !isSeen ? `
          <span class="rare-hidden-text"></span>
        ` : ""}
      </a>
    </article>
  `;
}

function renderPokedex() {
  const container = document.getElementById("pokedex-container");

  if (!container || typeof animals === "undefined") return;

  container.innerHTML = animals.map(createPokedexCard).join("");
}

/* ---------- ACCORDIONS ---------- */

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

    title.addEventListener("click", event => {
      event.stopPropagation();

      const isOpen = content.style.display === "flex";
      content.style.display = isOpen ? "none" : "flex";
    });
  });
}

/* ---------- LEARN MORE ---------- */

function initLearnMoreRegionMenu() {
  const container = document.getElementById("learn-region-menu");

  if (!container || typeof animals === "undefined") return;

  const regionsWithAnimals = regionConfig.filter(region =>
    animals.some(animal => animal.region === region.key)
  );

  container.innerHTML = regionsWithAnimals.map(region => {
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
      const arrow = toggle.querySelector("span:last-child");

      group.classList.toggle("open");

      if (arrow) {
        arrow.textContent = group.classList.contains("open") ? "▲" : "▼";
      }
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

function initLearnMoreSearchAndControls() {
  const searchInput = document.getElementById("animal-search");
  const collapseButton = document.getElementById("collapse-all");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const searchValue = searchInput.value.toLowerCase();
      const cards = document.querySelectorAll(".field-guide-card");

      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchValue) ? "block" : "none";
      });
    });
  }

  if (collapseButton) {
    collapseButton.addEventListener("click", () => {
      document.querySelectorAll(".field-guide-card").forEach(card => {
        card.classList.remove("open", "highlighted");
        card.style.display = "block";
      });

      if (searchInput) {
        searchInput.value = "";
      }
    });
  }
}

function initFieldGuideAccordion() {
  const container = document.getElementById("field-guide-container");

  if (!container) return;

  container.addEventListener("click", event => {
    const card = event.target.closest(".field-guide-card");

    if (!card) return;

    card.classList.toggle("open");
    card.classList.remove("highlighted");
  });
}

function closeAllLearnMoreAnimals() {
  document.querySelectorAll(".mereviden, .field-guide-card").forEach(section => {
    section.classList.remove("open", "highlighted");
  });
}

function openLearnMoreAnimal(animalId) {
  const section = document.getElementById(animalId);

  if (!section) return;

  document.querySelectorAll(".field-guide-card, .mereviden").forEach(card => {
    card.classList.remove("highlighted");
  });

  section.classList.add("open", "highlighted");
  section.style.display = "block";
  section.scrollIntoView({ behavior: "smooth", block: "center" });
}

function openLearnMoreAnimalFromHash() {
  const animalId = decodeURIComponent(window.location.hash.replace("#", ""));

  if (animalId) {
    openLearnMoreAnimal(animalId);
  }
}

/* ---------- MAP ---------- */

function initMap() {
  const mapElement = document.getElementById("wild-map");
  const tabs = document.getElementById("map-region-tabs");

  if (!mapElement || !tabs) return;

  if (typeof L === "undefined") {
    console.log("Leaflet er ikke loaded. Tjek script-tagget i dexsiden.html");
    return;
  }

  if (!regionMapConfig[activeMapRegion]) {
    activeMapRegion = "Arctic";
  }

  tabs.innerHTML = regionConfig.map(region => `
    <button 
      type="button" 
      data-map-region="${region.key}" 
      class="${region.key === activeMapRegion ? "active" : ""}"
    >
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
	renderPinnedSightingsList();
  });

  wildDexMap.on("click", event => {
    if (!selectedMapAnimalId) return;

    const animal = animals.find(item => item.id === selectedMapAnimalId);
    if (!animal) return;

	const now = new Date();

	mapPins.push({
	  id: createUniqueId(),
	  animalId: animal.id,
	  animalName: animal.name,
	  region: activeMapRegion,
	  category: animal.category,
	  rarity: animal.rarity || "common",
	  lat: event.latlng.lat,
	  lng: event.latlng.lng,
	  date: now.toISOString().split("T")[0],
	  time: now.toTimeString().slice(0, 5),
	  createdAt: now.toISOString()
	});

    if (!seenAnimals.includes(animal.id)) {
      seenAnimals.push(animal.id);
      saveSeenAnimals();
    }

    saveMapPins();
    renderPage();
	showMapFeedback(`${animal.name} pinned successfully!`);
  });

  renderMapPins();
}

function showBadgePopup(badge) {
  let popup = document.getElementById("badge-popup");

  if (!popup) {
    popup = document.createElement("div");
    popup.id = "badge-popup";
    popup.className = "badge-popup";
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <div class="badge-popup-icon">${badge.emoji || "🏆"}</div>
    <div>
      <span>Congratulations!</span>
      <strong>You just earned "${badge.title}"</strong>
      <p>${badge.description}</p>
    </div>
  `;

  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 3500);
}

function showNewDiscoveryPopup(animal) {
  let popup = document.getElementById("new-discovery-popup");

  if (!popup) {
    popup = document.createElement("div");
    popup.id = "new-discovery-popup";
    popup.className = "new-discovery-popup";
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <div class="new-discovery-image">
      <img src="${getAnimalImage(animal)}" alt="${animal.name}">
    </div>

    <div>
      <span>New WildDex entry!</span>
      <strong>${animal.name}</strong>
      <p>${animal.dexNumber ? getAnimalDexNumber(animal) + " · " : ""}${animal.rarity || "common"}</p>
    </div>
  `;

  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 3500);
}

function openMap() {
  const mapSection = document.getElementById("map-section");

  if (!mapSection) return;

  mapSection.classList.remove("map-section-hidden");

  setTimeout(() => {
    if (wildDexMap) {
      wildDexMap.invalidateSize();
    }

    mapSection.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, 100);
}

function closeMap() {
  const mapSection = document.getElementById("map-section");

  if (!mapSection) return;

  mapSection.classList.add("map-section-hidden");
}

function moveMapToRegion(regionKey) {
  if (!wildDexMap || !regionMapConfig[regionKey]) return;

  wildDexMap.setView(
    regionMapConfig[regionKey].center,
    regionMapConfig[regionKey].zoom
  );
}

function selectAnimalForMap(animalId) {
  if (typeof animals === "undefined") return;

  const animal = animals.find(item => item.id === animalId);
  const selectedText = document.getElementById("map-selected-animal");
  const tabs = document.getElementById("map-region-tabs");

  if (!animal || !selectedText) return;

  selectedMapAnimalId = animal.id;
  activeMapRegion = animal.region;

  selectedText.textContent = `Selected: ${animal.name}`;

  openMap();

  if (tabs) {
    tabs.querySelectorAll("button").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.mapRegion === activeMapRegion);
    });
  }

  moveMapToRegion(activeMapRegion);
  renderMapPins();

  setTimeout(() => {
    if (wildDexMap) {
      wildDexMap.invalidateSize();
    }
  }, 150);
}

function renderMapPins() {
  if (!wildDexMap || !mapLayerGroup || typeof animals === "undefined") return;

  mapLayerGroup.clearLayers();

  const visiblePins = mapPins.filter(pin =>
    pin.region === activeMapRegion &&
    typeof pin.lat === "number" &&
    typeof pin.lng === "number"
  );

  visiblePins.forEach(pin => {
    const animal = animals.find(item => item.id === pin.animalId);
    if (!animal) return;

    const categoryLabel = getAnimalCategoryLabel(animal.category);
    const rarityLabel = animal.rarity ? animal.rarity : "common";

    L.marker([pin.lat, pin.lng])
      .addTo(mapLayerGroup)
      .bindPopup(`
        <div class="map-popup">
          <strong>${animal.name}</strong>
          <span>${animal.region} · ${categoryLabel}</span>
          <span>Rarity: ${rarityLabel}</span>
          <span>Date: ${pin.date || "Unknown"}</span>
          <span>Time: ${pin.time || "Unknown"}</span>
        </div>
      `);
  });
}

function getAnimalFieldValue(animal, key) {
  return animal[key] ? animal[key] : "Unknown";
}

function showMapFeedback(message) {
  const feedback = document.getElementById("map-feedback");

  if (!feedback) return;

  feedback.textContent = message;
  feedback.classList.add("show");

  setTimeout(() => {
    feedback.classList.remove("show");
  }, 2500);
}

function renderPinnedSightingsList() {
  const container = document.getElementById("pinned-sightings-list");

  if (!container || typeof animals === "undefined") return;

  const visiblePins = mapPins
    .filter(pin => pin.region === activeMapRegion)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (visiblePins.length === 0) {
    container.innerHTML = `<p>No animals pinned in this region yet.</p>`;
    return;
  }

  container.innerHTML = visiblePins.map(pin => {
    const animal = animals.find(item => item.id === pin.animalId);

    if (!animal) return "";

    const categoryLabel = getAnimalCategoryLabel(animal.category);
    const rarityLabel = animal.rarity ? animal.rarity : "common";

    return `
      <article class="pinned-sighting-card">
        <img src="${animal.image}" alt="${animal.name}">

        <div class="pinned-sighting-info">
          <strong>${animal.name}</strong>
          <span>${pin.region} · ${categoryLabel}</span>
          <span>${pin.date || "Unknown date"} · ${pin.time || "Unknown time"}</span>
        </div>

        <div class="pinned-sighting-actions">
          ${rarityLabel === "rare" ? `<span class="pinned-rare-chip">Rare</span>` : ""}
          <button type="button" data-action="delete-map-pin" data-pin-id="${pin.id}">
            Delete
          </button>
        </div>
      </article>
    `;
  }).join("");
}
/* ---------- EVENTS ---------- */

function initEvents() {
  document.addEventListener("click", event => {
    const seenButton = event.target.closest("[data-action='toggle-seen']");
    const mapButton = event.target.closest("[data-action='select-map-animal']");
    const modalButton = event.target.closest("[data-action='open-animal-modal']");
    const closeModalButton = event.target.closest("[data-action='close-animal-modal']");
    const deletePinButton = event.target.closest("[data-action='delete-map-pin']");
	const resetSeenButton = event.target.closest("[data-action='reset-seen']");
	const resetPinsButton = event.target.closest("[data-action='reset-pins']");
	const resetBadgesButton = event.target.closest("[data-action='reset-badges']");
	const resetAllButton = event.target.closest("[data-action='reset-all']");

    if (seenButton) {
      toggleSeen(seenButton.dataset.id);
    }

    if (mapButton) {
      closeAnimalModal();
      selectAnimalForMap(mapButton.dataset.id);
    }

    if (modalButton) {
      openAnimalModal(modalButton.dataset.id);
    }

    if (closeModalButton) {
      closeAnimalModal();
    }

    if (deletePinButton) {
      deleteMapPin(deletePinButton.dataset.pinId);
    }
	if (resetSeenButton) {
	  resetSeenAnimals();
	}

	if (resetPinsButton) {
	  resetMapPins();
	}

	if (resetBadgesButton) {
	  resetBadges();
	}

	if (resetAllButton) {
	  const confirmed = confirm("Reset all WildDex save data?");
	  if (confirmed) {
	    resetAllSaveData();
	  }
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

    form.reset();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeAnimalModal();
    }
  });
}

function deleteMapPin(pinId) {
  mapPins = mapPins.filter(pin => pin.id !== pinId);

  saveMapPins();
  renderPage();

  showMapFeedback("Pin deleted.");
}
/* ---------- RENDER PAGE ---------- */

function renderPage() {
  if (document.querySelector(".animals")) {
    renderAllAnimals();
  }

  if (document.getElementById("field-guide-container")) {
    renderFieldGuide();
  }

  if (document.getElementById("pokedex-container")) {
    renderPokedex();
  }

  if (document.getElementById("regional-pokedex-container")) {
    renderRegionalPokedex();
  }

  if (document.getElementById("rare-progress-text")) {
    updateRareProgress();
  }

  if (document.getElementById("badges-container")) {
    renderBadges();
    checkForNewBadges();
  }

  if (document.getElementById("recent-discoveries")) {
    renderRecentDiscoveries();
  }

  if (document.getElementById("wild-map")) {
    renderMapPins();
  }

  if (document.getElementById("pinned-sightings-list")) {
    renderPinnedSightingsList();
  }

  updateTracker();
}

function renderSaveFile() {
  const container = document.getElementById("save-file-stats");

  if (!container || typeof animals === "undefined") return;

  const totalAnimals = animals.length;
  const caughtAnimals = seenAnimals.filter(id =>
    animals.some(animal => animal.id === id)
  ).length;

  const rareAnimals = animals.filter(animal => animal.rarity === "rare");
  const caughtRareAnimals = rareAnimals.filter(animal =>
    seenAnimals.includes(animal.id)
  ).length;

  const unlockedBadgeCount = badgeConfig.filter(badge => badge.isUnlocked()).length;

  container.innerHTML = `
    <div>
      <span>Caught</span>
      <strong>${caughtAnimals} / ${totalAnimals}</strong>
    </div>

    <div>
      <span>Rare</span>
      <strong>${caughtRareAnimals} / ${rareAnimals.length}</strong>
    </div>

    <div>
      <span>Badges</span>
      <strong>${unlockedBadgeCount} / ${badgeConfig.length}</strong>
    </div>

    <div>
      <span>Map pins</span>
      <strong>${mapPins.length}</strong>
    </div>
  `;
}

function showSaveFileFeedback(message) {
  const feedback = document.getElementById("save-file-feedback");

  if (!feedback) return;

  feedback.textContent = message;

  setTimeout(() => {
    feedback.textContent = "";
  }, 2500);
}

function resetSeenAnimals() {
  seenAnimals = [];
  saveSeenAnimals();
  renderPage();
  showSaveFileFeedback("Caught animals reset.");
}

function resetMapPins() {
  mapPins = [];
  saveMapPins();
  renderPage();
  showSaveFileFeedback("Map pins reset.");
}

function resetBadges() {
  unlockedBadges = [];
  saveUnlockedBadges();
  renderPage();
  showSaveFileFeedback("Badge unlock history reset.");
}

function resetAllSaveData() {
  seenAnimals = [];
  sightings = {};
  mapPins = [];
  unlockedBadges = [];

  saveSeenAnimals();
  saveSightings();
  saveMapPins();
  saveUnlockedBadges();

  renderPage();
  showSaveFileFeedback("All WildDex save data reset.");
}
/* ---------- START ---------- */

function setTheme(region) {
  document.body.classList.remove(
    "theme-arctic",
    "theme-africa",
    "theme-europe",
    "theme-northamerica",
    "theme-southamerica",
    "theme-asia",
    "theme-oceania",
    "theme-antarctica",
    "theme-ocean"
  );

  document.body.classList.add("theme-" + region);

  localStorage.setItem("wilddexTheme", region);
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("wilddexTheme");

  if (savedTheme) {
    setTheme(savedTheme);
  }

  renderPage();
  initAccordions();
  initEvents();
  initDexTools();
  initMap();
  initLearnMoreRegionMenu();
  initLearnMoreSearchAndControls();
  initFieldGuideAccordion();
  renderHomeCollectorGreeting();

  window.addEventListener("hashchange", openLearnMoreAnimalFromHash);
});

function renderRecentDiscoveries() {
  const container = document.getElementById("recent-discoveries");

  if (!container) return;

  const allSightings = Object.values(sightings)
    .flat()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (allSightings.length === 0) {
    container.innerHTML = `<p>No discoveries logged yet.</p>`;
    return;
  }

  container.innerHTML = allSightings.map(sighting => {
    const animal = animals.find(item => item.id === sighting.animalId);

    if (!animal) return "";

    return `
      <div class="recent-discovery-card">
       <img src="${getAnimalImage(animal)}" alt="${animal.name}">
        <div>
          <strong>${animal.name}</strong>
          <span>${sighting.location} · ${sighting.date} ${sighting.time}</span>
        </div>
        ${animal.rarity === "rare" ? `<span class="recent-rare-chip">Rare</span>` : ""}
      </div>
    `;
  }).join("");
}

function updateRareProgress() {
  if (typeof animals === "undefined") return;

  const rareAnimals = animals.filter(animal => animal.rarity === "rare");
  const seenRareAnimals = rareAnimals.filter(animal => seenAnimals.includes(animal.id));

  const rareText = document.getElementById("rare-progress-text");

  if (rareText) {
    rareText.textContent = `${seenRareAnimals.length} / ${rareAnimals.length} rare animals discovered`;
  }
}

function getSeenAnimalsByCategory(categoryName) {
  return animals.filter(animal =>
    animal.category === categoryName && seenAnimals.includes(animal.id)
  );
}

function getSeenRareAnimalsByRegion(regionName) {
  return animals.filter(animal =>
    animal.region === regionName &&
    animal.rarity === "rare" &&
    seenAnimals.includes(animal.id)
  );
}

function getSeenAnimalsByRegionAndCategory(regionName, categoryName) {
  return animals.filter(animal =>
    animal.region === regionName &&
    animal.category === categoryName &&
    seenAnimals.includes(animal.id)
  );
}

const badgeConfig = [
  {
    id: "first-discovery",
    title: "First Discovery",
    description: "See your first animal.",
    emoji: "🦊",
    isUnlocked: () => seenAnimals.length >= 1
  },
  {
    id: "rare-hunter",
    title: "Rare Hunter",
    description: "Discover your first rare animal.",
    emoji: "✨",
    isUnlocked: () => animals.some(animal =>
      animal.rarity === "rare" && seenAnimals.includes(animal.id)
    )
  },
  {
    id: "arctic-explorer",
    title: "Arctic Explorer",
    description: "See 3 Arctic animals.",
    emoji: "❄️",
    isUnlocked: () => getSeenAnimalsByRegion("Arctic").length >= 3
  },
  {
    id: "bird-watcher",
    title: "Bird Watcher",
    description: "See 3 birds.",
    emoji: "🪶",
    isUnlocked: () => animals.filter(animal =>
      animal.category === "birds" && seenAnimals.includes(animal.id)
    ).length >= 3
  },
  {
    id: "map-marker",
    title: "Map Marker",
    description: "Pin 3 animal sightings on the map.",
    emoji: "📍",
    isUnlocked: () => mapPins.length >= 3
  },
  {
    id: "collector",
    title: "Collector",
    description: "See 10 animals.",
    emoji: "🏆",
    isUnlocked: () => seenAnimals.length >= 10
  },
  {
    id: "europe-explorer",
    title: "Europe Explorer",
    description: "See 3 European animals.",
    emoji: "🌲",
    isUnlocked: () => getSeenAnimalsByRegion("Europe").length >= 3
  },
  {
    id: "africa-explorer",
    title: "Africa Explorer",
    description: "See 3 African animals.",
    emoji: "🦁",
    isUnlocked: () => getSeenAnimalsByRegion("Africa").length >= 3
  },
  {
    id: "arctic-tracker",
    title: "Arctic Tracker",
    description: "See 5 Arctic animals.",
    emoji: "🐾",
    isUnlocked: () => getSeenAnimalsByRegion("Arctic").length >= 5
  },
  {
    id: "europe-tracker",
    title: "Forest Tracker",
    description: "See 5 European animals.",
    emoji: "🦌",
    isUnlocked: () => getSeenAnimalsByRegion("Europe").length >= 5
  },
  {
    id: "africa-tracker",
    title: "Savannah Tracker",
    description: "See 5 African animals.",
    emoji: "🐘",
    isUnlocked: () => getSeenAnimalsByRegion("Africa").length >= 5
  },
  {
    id: "arctic-rare-find",
    title: "Arctic Rare Find",
    description: "Discover a rare Arctic animal.",
    emoji: "🧊",
    isUnlocked: () => getSeenRareAnimalsByRegion("Arctic").length >= 1
  },
  {
    id: "europe-rare-find",
    title: "Europe Rare Find",
    description: "Discover a rare European animal.",
    emoji: "🌙",
    isUnlocked: () => getSeenRareAnimalsByRegion("Europe").length >= 1
  },
  {
    id: "africa-rare-find",
    title: "Africa Rare Find",
    description: "Discover a rare African animal.",
    emoji: "🌅",
    isUnlocked: () => getSeenRareAnimalsByRegion("Africa").length >= 1
  },
  {
    id: "mammal-tracker",
    title: "Mammal Tracker",
    description: "See 5 mammals.",
    emoji: "🐺",
    isUnlocked: () => getSeenAnimalsByCategory("pattedyr").length >= 5
  },
  {
    id: "fish-finder",
    title: "Fish Finder",
    description: "See 3 fish.",
    emoji: "🐟",
    isUnlocked: () => getSeenAnimalsByCategory("fish").length >= 3
  },
  {
    id: "rare-collector",
    title: "Rare Collector",
    description: "Discover 3 rare animals.",
    emoji: "💎",
    isUnlocked: () => animals.filter(animal =>
      animal.rarity === "rare" && seenAnimals.includes(animal.id)
    ).length >= 3
  },
  {
    id: "field-logger",
    title: "Field Logger",
    description: "Pin your first animal sighting on the map.",
    emoji: "🗺️",
    isUnlocked: () => mapPins.length >= 1
  },
  {
    id: "expedition-logger",
    title: "Expedition Logger",
    description: "Pin 5 animal sightings on the map.",
    emoji: "📌",
    isUnlocked: () => mapPins.length >= 5
  },
  {
    id: "wildlife-specialist",
    title: "Wildlife Specialist",
    description: "See 20 animals.",
    emoji: "🎖️",
    isUnlocked: () => seenAnimals.length >= 20
  },
  {
    id: "global-explorer",
    title: "Global Explorer",
    description: "See animals in Arctic, Europe and Africa.",
    emoji: "🌍",
    isUnlocked: () =>
      getSeenAnimalsByRegion("Arctic").length >= 1 &&
      getSeenAnimalsByRegion("Europe").length >= 1 &&
      getSeenAnimalsByRegion("Africa").length >= 1
  },
  {
    id: "balanced-collector",
    title: "Balanced Collector",
    description: "See at least one mammal, bird and fish.",
    emoji: "⚖️",
    isUnlocked: () =>
      getSeenAnimalsByCategory("pattedyr").length >= 1 &&
      getSeenAnimalsByCategory("birds").length >= 1 &&
      getSeenAnimalsByCategory("fish").length >= 1
  },
  
];

let showAllBadges = false;

function renderBadges() {
  const container = document.getElementById("badges-container");
  const badgesToggleBtn = document.getElementById("badgesToggleBtn");

  if (!container || typeof animals === "undefined") return;

  container.innerHTML = "";

  const sortedBadges = [...badgeConfig].sort((a, b) => {
    return Number(b.isUnlocked()) - Number(a.isUnlocked());
  });

  const visibleBadges = showAllBadges
    ? sortedBadges
    : sortedBadges.slice(0, 6);

  container.innerHTML = visibleBadges.map(badge => {
    const unlocked = badge.isUnlocked();

    return `
      <article class="badge-card ${unlocked ? "unlocked" : "locked"}">
        <div class="badge-icon">${badge.emoji}</div>
        <div>
          <h3>${badge.title}</h3>
          <p>${badge.description}</p>
          <span>${unlocked ? "Unlocked" : "Locked"}</span>
        </div>
      </article>
    `;
  }).join("");

  if (badgesToggleBtn) {
    badgesToggleBtn.textContent = showAllBadges
      ? "Show Fewer Badges"
      : `View All Badges (${badgeConfig.length})`;

    badgesToggleBtn.style.display = badgeConfig.length > 6
      ? "inline-block"
      : "none";
  }
}

function toggleBadgesView() {
  showAllBadges = !showAllBadges;
  renderBadges();
}

function checkForNewBadges() {
  if (typeof animals === "undefined") return;

  badgeConfig.forEach(badge => {
    const isUnlockedNow = badge.isUnlocked();
    const wasAlreadyUnlocked = unlockedBadges.includes(badge.id);

    if (isUnlockedNow && !wasAlreadyUnlocked) {
      unlockedBadges.push(badge.id);
      saveUnlockedBadges();
      showBadgePopup(badge);
    }
  });
}

function renderRegionalPokedex() {
  const container = document.getElementById("regional-pokedex-container");

  if (!container || typeof animals === "undefined") return;

  const regionsWithAnimals = regionConfig.filter(region =>
    animals.some(animal => animal.region === region.key)
  );

  container.innerHTML = regionsWithAnimals.map(region => {
    const regionAnimals = animals.filter(animal => animal.region === region.key);
    const seenInRegion = regionAnimals.filter(animal => seenAnimals.includes(animal.id)).length;
    const totalInRegion = regionAnimals.length;
    const percent = totalInRegion === 0 ? 0 : Math.round((seenInRegion / totalInRegion) * 100);

    return `
      <section class="regional-pokedex-group">
        <div class="regional-pokedex-header">
          <div>
            <p class="dex-eyebrow">${region.label}</p>
            <h2>${seenInRegion} / ${totalInRegion} discovered</h2>
          </div>

          <div class="regional-percent">${percent}%</div>
        </div>

        <div class="regional-progress-bar">
          <div style="width: ${percent}%"></div>
        </div>

        <div class="pokedex-grid">
          ${regionAnimals.map(createPokedexCard).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function createFieldGuideCard(animal) {
  const categoryLabel = getAnimalCategoryLabel(animal.category);
  const isRare = animal.rarity === "rare";

  return `
    <article class="field-guide-card ${isRare ? "rare-field-guide-card" : ""}" id="${animal.id}">
      ${isRare ? `<span class="field-rare-badge">Rare encounter</span>` : ""}

      <div class="field-guide-top">
	  <div class="field-guide-image-frame">
	    <img src="${getAnimalImage(animal)}" alt="${animal.name}">
	  </div>

	  <div class="field-guide-main">
	    ${animal.dexNumber ? `<span class="dex-number">${getAnimalDexNumber(animal)}</span>` : ""}
	    <p class="dex-eyebrow">${getAnimalRegionLabel(animal)} · ${categoryLabel}</p>
	    <h2>${animal.name}</h2>
	    <p class="field-description">${animal.description}</p>
          <div class="field-tags">
            <span>${animal.rarity || "common"}</span>
            <span>${categoryLabel}</span>
           <span>${getAnimalRegionLabel(animal)}</span>
          </div>
        </div>
      </div>

      <div class="field-guide-grid">
        <div class="field-info-box">
          <span>Habitat</span>
          <p>${getAnimalFieldValue(animal, "habitat")}</p>
        </div>

        <div class="field-info-box">
          <span>Diet</span>
          <p>${getAnimalFieldValue(animal, "diet")}</p>
        </div>

        <div class="field-info-box">
          <span>Size / weight</span>
          <p>${getAnimalFieldValue(animal, "size")}</p>
        </div>

        <div class="field-info-box">
          <span>Behaviour</span>
          <p>${getAnimalFieldValue(animal, "behaviour")}</p>
        </div>

        <div class="field-info-box">
          <span>Best season</span>
          <p>${getAnimalFieldValue(animal, "bestSeason")}</p>
        </div>

        <div class="field-info-box">
          <span>Best place</span>
          <p>${getAnimalFieldValue(animal, "bestPlace")}</p>
        </div>
      </div>

      <div class="field-fun-fact">
        <span>Fun fact</span>
        <p>${getAnimalFieldValue(animal, "funFact")}</p>
      </div>

      <div class="field-conservation">
        <span>Conservation status</span>
        <strong>${getAnimalFieldValue(animal, "conservation")}</strong>
      </div>
    </article>
  `;
}

function renderFieldGuide() {
  const container = document.getElementById("field-guide-container");

  if (!container || typeof animals === "undefined") return;

  container.innerHTML = animals.map(createFieldGuideCard).join("");
}

console.log("function.js loaded");
console.log("animals:", typeof animals !== "undefined" ? animals.length : "animals is undefined");

/* ================================
   PROFESSOR INTRO / COLLECTOR PROFILE
================================ */

const COLLECTOR_PROFILE_KEY = "collectorProfile";

document.addEventListener("DOMContentLoaded", () => {
  initProfessorIntro();
  renderCollectorProfile();
  renderHomeCollectorGreeting();
  renderFirstMission();
});

function initProfessorIntro() {
  const professorIntro = document.getElementById("professorIntro");

  if (!professorIntro) return;

  const existingProfile = getCollectorProfile();

  if (existingProfile) {
    professorIntro.classList.add("hidden");
    return;
  }

  professorIntro.classList.remove("hidden");

  const professorText = document.getElementById("professorText");

  const introStepOne = document.getElementById("introStepOne");
  const introStepTwo = document.getElementById("introStepTwo");
  const introStepThree = document.getElementById("introStepThree");
  const introStepFour = document.getElementById("introStepFour");

  const introNextBtn = document.getElementById("introNextBtn");
  const saveNameBtn = document.getElementById("saveNameBtn");
  const collectorNameInput = document.getElementById("collectorNameInput");
  const finalIntroText = document.getElementById("finalIntroText");
  const startExpeditionBtn = document.getElementById("startExpeditionBtn");

  let temporaryProfile = {
    name: "",
    startingRegion: "",
    favoriteCategory: "",
    joinedAt: new Date().toISOString()
  };

  introNextBtn?.addEventListener("click", () => {
	professorSay(
	  "Your quest is simple: explore wild regions, log real sightings, unlock badges and complete your personal WildDex."
	);

    showIntroStep(introStepOne, introStepTwo);
    collectorNameInput?.focus();
  });

  saveNameBtn?.addEventListener("click", () => {
    const collectorName = collectorNameInput.value.trim();

	if (!collectorName) {
	  professorSay("Every great collector needs a name. What should I call you?");
	  collectorNameInput.focus();
	  return;
	}

    temporaryProfile.name = collectorName;

	professorSay(
	  `Excellent, ${collectorName}. Now choose where your expedition begins.`
	);

    showIntroStep(introStepTwo, introStepThree);
  });

  const regionButtons = document.querySelectorAll(".region-choice");

  regionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedRegion = button.dataset.region;

      temporaryProfile.startingRegion = selectedRegion;

	  professorSay(
	    `${temporaryProfile.name}, your first expedition will begin in ${selectedRegion}.`
	  );

		finalIntroText.textContent =
		  "Your WildDex has been created. Step outside, stay curious, and begin your first discovery.";

      showIntroStep(introStepThree, introStepFour);
    });
  });

  startExpeditionBtn?.addEventListener("click", () => {
    saveCollectorProfile(temporaryProfile);
    professorIntro.classList.add("hidden");
    renderCollectorProfile();
    renderHomeCollectorGreeting();
    renderFirstMission();
  });
}

function showIntroStep(currentStep, nextStep) {
  currentStep.classList.add("hidden");
  nextStep.classList.remove("hidden");
}

function getCollectorProfile() {
  const profile = localStorage.getItem(COLLECTOR_PROFILE_KEY);

  if (!profile) return null;

  try {
    return JSON.parse(profile);
  } catch (error) {
    console.error("Could not parse collector profile:", error);
    return null;
  }
}

function saveCollectorProfile(profile) {
  localStorage.setItem(COLLECTOR_PROFILE_KEY, JSON.stringify(profile));
}

function resetCollectorProfile() {
  localStorage.removeItem(COLLECTOR_PROFILE_KEY);
  location.reload();
}

function renderCollectorProfile() {
  const profile = getCollectorProfile();

  const nameElement = document.getElementById("collectorDisplayName");
  const regionElement = document.getElementById("collectorDisplayRegion");

  if (!nameElement || !regionElement) return;

  if (!profile) {
    nameElement.textContent = "Unknown Collector";
    regionElement.textContent = "Starting Region: Unknown";
    return;
  }

  nameElement.textContent = profile.name;
  regionElement.textContent = `Starting Region: ${profile.startingRegion}`;
}

function renderHomeCollectorGreeting() {
  const greetingElement = document.getElementById("homeCollectorGreeting");
  if (!greetingElement) return;

  const profile = getCollectorProfile();

  if (!profile) {
    greetingElement.textContent = "Begin your expedition";
    return;
  }

  greetingElement.textContent = `Welcome back, Collector ${profile.name}`;
}

function renderFirstMission() {
  const firstMissionCard = document.getElementById("firstMissionCard");
  const firstMissionText = document.getElementById("firstMissionText");
  const firstMissionBtn = document.getElementById("firstMissionBtn");

  if (!firstMissionCard || !firstMissionText || !firstMissionBtn) return;

  const caughtAnimals = JSON.parse(localStorage.getItem("seenAnimals")) || [];

  if (caughtAnimals.length === 0) {
    firstMissionText.textContent =
      "Register your first animal to begin your WildDex journey.";

    firstMissionBtn.textContent = "Find First Animal";
    firstMissionBtn.href = "dexsiden.html";
  } else {
    firstMissionText.textContent =
      "Mission complete. You have registered your first animal. Keep exploring to complete your WildDex.";

    firstMissionBtn.textContent = "View Progress";
    firstMissionBtn.href = "Progress.html";
  }
}

const PROFESSOR_IDLE_SPRITE = "Images/Images/Aldor/Aldoridle.png";
const PROFESSOR_TALK_SPRITE = "Images/Images/Aldor/Aldortalk.png";

let professorTalkInterval = null;

function startProfessorTalking() {
  const professorSpriteImg = document.getElementById("professorSpriteImg");

  if (!professorSpriteImg) return;

  stopProfessorTalking();

  let isTalkingFrame = false;

  professorTalkInterval = setInterval(() => {
    isTalkingFrame = !isTalkingFrame;

    professorSpriteImg.src = isTalkingFrame
      ? PROFESSOR_TALK_SPRITE
      : PROFESSOR_IDLE_SPRITE;
  }, 220);
}

function stopProfessorTalking() {
  const professorSpriteImg = document.getElementById("professorSpriteImg");

  if (professorTalkInterval) {
    clearInterval(professorTalkInterval);
    professorTalkInterval = null;
  }

  if (professorSpriteImg) {
    professorSpriteImg.src = PROFESSOR_IDLE_SPRITE;
  }
}

function professorSay(text) {
  const professorText = document.getElementById("professorText");

  if (!professorText) return;

  professorText.textContent = text;

  startProfessorTalking();

  const talkingDuration = Math.min(2600, Math.max(1200, text.length * 35));

  setTimeout(() => {
    stopProfessorTalking();
  }, talkingDuration);
}