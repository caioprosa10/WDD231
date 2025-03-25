// Atualiza o rodapé com o ano atual e data de última modificação
function updateFooter() {
  document.getElementById("current-year").textContent = new Date().getFullYear();
  document.getElementById("last-modified").textContent = document.lastModified;
}

// Alterna entre visualização Grid e Lista (para directory.html)
function initViewToggle() {
  const gridBtn = document.getElementById("grid-view");
  const listBtn = document.getElementById("list-view");
  const membersContainer = document.getElementById("members-container");

  if (gridBtn && listBtn && membersContainer) {
    gridBtn.addEventListener("click", () => {
      membersContainer.classList.remove("list");
      membersContainer.classList.add("grid");
    });

    listBtn.addEventListener("click", () => {
      membersContainer.classList.remove("grid");
      membersContainer.classList.add("list");
    });
  }
}

// Busca e exibe os membros do arquivo JSON (usado na página directory.html)
async function fetchMembers() {
  try {
    const response = await fetch("data/members.json");
    const members = await response.json();
    displayMembers(members);
  } catch (error) {
    console.error("Erro ao buscar membros:", error);
  }
}

// Exibe os membros na página (cria cards para cada membro)
function displayMembers(members) {
  const container = document.getElementById("members-container");
  if (!container) return;
  container.innerHTML = ""; // Limpa conteúdo antigo

  members.forEach(member => {
    const card = document.createElement("div");
    card.classList.add("member-card");

    // Cria os elementos com os dados do membro
    card.innerHTML = `
      <img src="images/${member.image}" alt="${member.name}" />
      <h3>${member.name}</h3>
      <p>${member.address}</p>
      <p>${member.phone}</p>
      <a href="${member.website}" target="_blank">Site</a>
      <p>Nível de Associação: ${getMembershipLevelText(member.membership)}</p>
    `;
    container.appendChild(card);
  });
}

// Converte o número do nível em texto (1=Member, 2=Silver, 3=Gold)
function getMembershipLevelText(level) {
  switch(level) {
    case "1":
      return "Member";
    case "2":
      return "Silver";
    case "3":
      return "Gold";
    default:
      return "N/A";
  }
}

// Busca dados do clima para Salt Lake City, Utah
async function fetchWeather() {
  const weatherContainer = document.getElementById("weather-info");
  if (!weatherContainer) return;

  const apiKey = "262b12be8583f7ebd38c830a836f7aaf"; // Insira sua API key do OpenWeatherMap aqui
  const city = "Salt Lake City,US";
  const units = "imperial"; // Para Fahrenheit (use "metric" para Celsius)
  const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`;

  try {
    const response = await fetch(weatherURL);
    const weatherData = await response.json();

    // Exibe dados atuais
    const currentTemp = weatherData.main.temp;
    const description = weatherData.weather[0].description;

    let html = `<p>Temperatura Atual: ${currentTemp}&deg;F</p>`;
    html += `<p>Descrição: ${description}</p>`;

    // Para o forecast de 3 dias, usamos o endpoint forecast (simplificado)
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastURL);
    const forecastData = await forecastResponse.json();

    // Seleciona previsões (exemplo: pegar a cada 8 intervalos para ter cerca de 3 previsões)
    html += `<h3>Previsão para os próximos 3 períodos</h3>`;
    const forecasts = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 3);
    forecasts.forEach(item => {
      const date = new Date(item.dt * 1000);
      html += `<p>${date.toLocaleDateString()}: ${item.main.temp}&deg;F, ${item.weather[0].description}</p>`;
    });

    weatherContainer.innerHTML = html;
  } catch (error) {
    console.error("Erro ao buscar dados do clima:", error);
    weatherContainer.innerHTML = "<p>Não foi possível carregar os dados do clima.</p>";
  }
}

// Exibe aleatoriamente 2-3 membros Silver/Gold na seção spotlight (usado na index.html)
async function loadSpotlightMembers() {
  try {
    const response = await fetch("data/members.json");
    const members = await response.json();

    // Filtra apenas membros Silver (2) e Gold (3)
    const spotlight = members.filter(member => member.membership === "2" || member.membership === "3");
    
    // Embaralha o array
    spotlight.sort(() => Math.random() - 0.5);
    
    // Seleciona os 3 primeiros (ou 2, se preferir)
    const selected = spotlight.slice(0, 3);

    const spotlightContainer = document.getElementById("spotlight-members");
    if (!spotlightContainer) return;
    spotlightContainer.innerHTML = ""; // Limpa conteúdo antigo

    selected.forEach(member => {
      const div = document.createElement("div");
      div.classList.add("member-card");
      div.innerHTML = `
        <img src="images/${member.image}" alt="${member.name}" />
        <h3>${member.name}</h3>
        <p>${member.phone}</p>
        <p>${member.address}</p>
        <a href="${member.website}" target="_blank">Site</a>
        <p>Nível: ${getMembershipLevelText(member.membership)}</p>
      `;
      spotlightContainer.appendChild(div);
    });
  } catch (error) {
    console.error("Erro ao carregar spotlight:", error);
  }
}

// Inicializa as funções após o carregamento da página
document.addEventListener("DOMContentLoaded", () => {
  updateFooter();
  initViewToggle();

  // Hamburger toggle para navegação responsiva
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
  }

  // Se a página tiver o container de membros, busca os membros (directory.html)
  if (document.getElementById("members-container")) {
    fetchMembers();
  }

  // Se a página tiver a seção de clima, busca os dados do clima (index.html)
  if (document.getElementById("weather-info")) {
    fetchWeather();
  }

  // Se a página tiver a seção de spotlight, carrega os membros destacados (index.html)
  if (document.getElementById("spotlight-members")) {
    loadSpotlightMembers();
  }
});
