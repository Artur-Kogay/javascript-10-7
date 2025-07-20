const searchInput = document.getElementById('search-input');
const searchCardList = document.querySelector('.cards');
const listRepositories = document.querySelector('.main-repositories');

const URL = 'https://api.github.com/search/repositories?q=';

const repositories = [];


async function getRepositories(url, searchWord, limit) {

    try {
        const response = await fetch(`${url}${searchWord}${limit ? `&per_page=${limit}` : ''}`);

        const data = await response.json();
        return data.items;

    } catch (error) {
        throw Error(error.name);
    }

}


function debounce(fn) {

    let timeoutId;

    return function(...args) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            fn.apply(this, args);

        }, 1000);
    };
}


const debouncedSearch = debounce((e) => {

    const value = e.target.value.trim().toLowerCase();

    if(value) {
        getRepositories(URL, value, 5)
            .then(data => {
                if(data) {
                    renderSearchRepositories(data);
                }
            })
            .catch(err => err.name);
    } else {
        searchCardList.innerHTML = '';
    }
});


const renderSearchRepositories = (data) => {

    searchCardList.innerHTML = '';

    if(!data.length) {
        return;
    }

    data.map(el => {
        searchCardList.innerHTML += `
            <div class="cards_card">
                <h2>
                    ${el.name}
                </h2>
            </div>
        `;
    })
}

searchInput.addEventListener('input', debouncedSearch)

const renderRepositories = () => {

    if(!repositories.length) {
        return;
    }

    repositories.map(el => {
        listRepositories.innerHTML += `
            <div class="main-repositories_card">
                <div>
                    <h2>${el.name}</h2>
                </div>
                <div>
                    <h2>${el.score}</h2>
                </div>
                <div>
                    <h2>${el.owner.login}</h2>
                </div>
                <div>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        `;
    })
}

searchCardList.addEventListener('click', (e) => {

    const card = e.target.closest('.cards_card')
    const cardName = card.textContent.trim().toLowerCase();

    if(card) {
        getRepositories(URL, cardName, 1)
            .then(res => {
                repositories.push(res[0])
                renderRepositories();
            })
            .catch(e => e);

        searchCardList.innerHTML = '';
        searchInput.value = '';
    }
    
});

listRepositories.addEventListener('click', (e) => {

    if(e.target.classList.contains('delete-btn')) {
        const card = e.target.closest('.main-repositories_card');
        const repoName = card.querySelector('h2').textContent.trim().toLowerCase();

        card.remove();

        const indexOfRepository = repositories.findIndex(el => repoName === el.name.toLowerCase())

        if(indexOfRepository !== -1) {
            repositories.splice(indexOfRepository, 1)
        }
    }
})



