const input = document.getElementById("search");
const autocomplete = document.getElementById("autocomplete");
const repoList = document.getElementById("repo-list");

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function fetchRepos(query) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.items || [];
  } catch (err) {
    console.error("Ошибка сети:", err);
    return [];
  }
}

function renderAutocomplete(repos) {
  autocomplete.innerHTML = "";
  autocomplete.style.display = "none";

  if (repos.length === 0) {
    return;
  }

  repos.forEach((repo) => {
    const li = document.createElement("li");

    li.textContent = repo.full_name;

    li.addEventListener("click", () => {
      addRepo(repo); // <--- ИСПРАВЛЕНО ЗДЕСЬ
      input.value = "";
      autocomplete.style.display = "none";
      autocomplete.innerHTML = "";
    });

    autocomplete.appendChild(li);
  });

  autocomplete.style.display = "block";
}

const handleInput = debounce(async () => {
  const query = input.value.trim();
  if (!query) {
    autocomplete.style.display = "none";
    return;
  }

  const repos = await fetchRepos(query);

  renderAutocomplete(repos);
}, 400);

input.addEventListener("input", handleInput);

function addRepo(repo) {
  const li = document.createElement("li");
  li.className = "repo-item";

  const info = document.createElement("div");
  info.className = "repo-info";
  info.innerHTML = `
  Name: <a href="${repo.html_url}" target="_blank">${repo.name}</a><br>
  Owner: ${repo.owner.login}<br>
  Stars: ${repo.stargazers_count}
`;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "✖";

  deleteBtn.addEventListener("click", () => {
    li.remove();
  });

  li.append(info, deleteBtn);
  repoList.append(li);
}
