//DOM anchor
const app = document.getElementById('app');
//State
let state = {
    movieData:[],
    liked:[],
    selectedTerm:'',
    selectedList:[],
    sortedMovieData:[],
    views: true
}
const setState =(newState)=>{
    state = {...state, ...newState};
    render(state);
    checkMovieListLiked();
    modalPerf();
    starButtons();
    crossButtons();
}
//API & Request
const API = "https://my-json-server.typicode.com/moviedb-tech/movies/list";
document.addEventListener('DOMContentLoaded', function() {
   fetchMovie(API);
}, false);

const fetchMovie = async (url)=> {
    await fetch(url)
        .then(res => res.json())
        .then((data)=>{
            setState({
                movieData: data
            })
            let optList = [];
            const opList = state.movieData.forEach(i=>{optList.push(...i.genres)});
            const register = optList.map(w => w.toLowerCase());
            const uniqSelectedList = [...new Set(register)];
            setState({
                selectedList: uniqSelectedList,
                sortedMovieData: state.movieData,
                liked: JSON.parse(localStorage.getItem("likes")) || []
            })
        })
            .catch((err) => {console.log(err)});
};
// Templates
const movieTemplate = (movie, star= true)=> {
    return (`
        <div class="movie" data-key="${movie.id}" >
         <img id='img' src="${movie.img}" alt="${movie.name}" />
        <div class="movie-info">
        <div style="display: flex">
         <div>
          <h3>${movie.name}</h3>
          <h3>${movie.year}</h3>
         </div>
         <div>
         <button id="open-modal" class="btn-modal" data-id="${movie.id}">More...</button>
         </div>
         ${star ? `<div>
          <div class="star"  data-id="${movie.id}"></div>
         </div>` : `<div>
          <div class="cross"  data-id="${movie.id}">X</div>
         </div>` }
        </div>
        </div>           
        </div>`
    );
}
const movieTemplateBig =(movie)=>{
    const starring = movie.starring;
    const  newStaring = starring.map((star, index)=> index == starring.length -1 ? star+'.' : star+",").join(' ');
    const genres = movie.genres;
    const newGenres = genres.map(genre=>`<li id='${genre}' class='list-item'>${genre}</li>`).join('');
    return (
        `<div class="modal-grid-big">
            <div class="modal-flex-big"> 
                <div class="flex-item-big">
                 <div class="star position" id="modal" data-id="${movie.id}"></div>
                <img id='img-g' src="${movie.img}" alt="${movie.name}" />
                </div>
                <div class="flex-item-second-big">
                <div style="display: flex"><h3>${movie.name}</h3><h3> - ${movie.year} </h3></div>
                <div>
                 <p>${movie.description}</p>
                 <h3>Director: ${movie.director}</h3>
                 <p>Starring: ${newStaring}</p>
                 <ul class="genre-list">Genres: ${newGenres}</ul>
                </div>
                </div>
            </div>  
        </div>`);
}
const modalTemplate =(movie)=>{
    const starring = movie.starring;
    const  newStaring = starring.map((star, index)=> index == starring.length -1 ? star+'.' : star+",").join(' ');
    const genres = movie.genres;
    const newGenres = genres.map(genre=>`<li id='${genre}' class='list-item'>${genre}</li>`).join('');
    return (
        `<div class="modal-grid">
            <div class="modal-flex"> 
                <div class="flex-item">
                <img id='img-m' src="${movie.img}" alt="${movie.name}" />
                </div>
                <div class="flex-item-second">
                <h3>${movie.name}</h3>
                <p>${movie.description}</p>
                </div>
            </div>
            <div class="modal-flex"> 
                 <div class="flex-item">
                 <div class="star-container">
                 <div class="star" id="modal" data-id="${movie.id}"></div>
                   <h3>Year: ${movie.year}</h3>
                </div> 
                <ul class="genre-list">Genres: ${newGenres}</ul>
                </div> 
                 <div class="flex-item-second">
                 <h3>Director: ${movie.director}</h3>
                 <p>Starring: ${newStaring}</p>
                </div>
            </div>   
        </div>`);
}
const selectTemplate =(label)=> {
    return (
       `<div class="option">
            <input
                type="radio"
                class="radio"
                id="${label}"
                name="category"/>
            <label for="${label}">${label[0].toUpperCase()+ label.substring(1).toLocaleLowerCase()}</label>
        </div>`
    );
}
//Service functions
const checkMovieListLiked =()=> {
    const stars = document.querySelectorAll('.star');
    const check =(str)=> {
        const starsDom = Array.from(str);
        let clStars = state.liked;
        let starsId = []
        clStars.forEach((item)=> {
            starsId.push(item.id)
        })
        for(let i=0; i<starsId.length; i++){
            starsDom.forEach(item=>{item.dataset.id == starsId[i]? item.classList.add('liked') : ''})
        }
    }
    check(stars);
}
const starButtons = ()=> {
    const starButtons = document.querySelectorAll('.star');
    starButtons.forEach((button)=> {
        button.addEventListener('click', ()=>{
            const { id } = button.dataset;
            const movie = state.movieData.find(item => item.id == id);
            const stars = document.querySelectorAll('.star');
            const starsDom = Array.from(stars);
            const starID = button.dataset.id;
            const star = starsDom.find(star => star.dataset.id === starID)
            likedAction(star, movie, id);
        })
    })
}
const crossButtons = ()=> {
    const crossButtons = document.querySelectorAll('.cross');
    crossButtons.forEach((button)=> {
        button.addEventListener('click', ()=>{
            const { id } = button.dataset;
            const crosses = document.querySelectorAll('.cross');
            const crossDom = Array.from(crosses);
            const crossID = button.dataset.id;
            const cross = crossDom.find(star => star.dataset.id === crossID)
            if(cross.classList.contains('cross')){
                const lcLiked = state.liked;
                for(let i=0; i<lcLiked.length; i++){
                    if (lcLiked[i].id == id){
                        let index = lcLiked.map(x => { return x.id});
                        const removeItem=(ind)=>{
                            setState({
                                liked:[...state.liked.splice(ind,1)]
                            })
                        }
                        removeItem(index)
                        localStorage.setItem("likes", JSON.stringify(state.liked));
                    }
                }
            }
        })
    })
};
const modalPerf =()=> {
    let btnModal = document.querySelectorAll('#open-modal');
    btnModal.forEach((button)=> {
        button.addEventListener('click', ()=>{
            const { id } = button.dataset;
            const movie = state.movieData.find(item => item.id == id);
            let modal = document.getElementById("modal-container");
            modal.style.display = "block";
            let content = document.getElementById("modal-text");
            while (content.firstChild) {
                content.removeChild(content.lastChild);
            }
            const modalItem = document.createElement('div');
            modalItem.innerHTML = modalItem.innerHTML + modalTemplate(movie, true)
            content.appendChild(modalItem);
            checkMovieListLiked();
            starButtons();
        })
    })
    let closeModal = document.getElementsByClassName("close")[0];
    closeModal.addEventListener('click', ()=>{
        modal.style.display = "none";
    });
    let modal = document.getElementById("modal-container");
    document.addEventListener('onclick', function(event) {
        if (event.target !== modal) {
            modal.style.display = "none";
        }
    }, false);
}
const likedAction = (star, movie, id)=>{
    if(star.classList.contains('liked')) {
        const lcLiked = state.liked;
        for(let i=0; i<lcLiked.length; i++){
            if (lcLiked[i].id == id){
                star.classList.remove('liked');
                let index = lcLiked.map(x => { return x.id});
                const removeItem=(ind)=>{
                    setState({
                        liked:[...state.liked.splice(ind,1)]
                    })
                }
                removeItem(index)
                localStorage.setItem("likes", JSON.stringify(state.liked));
            }
        }
    } else {
        star.classList.add('liked');
        setState({
            liked:[...state.liked, movie]
        })
        localStorage.setItem("likes", JSON.stringify(state.liked));
    }
}
const openShort =()=>{
    setState({
        views:true
    })
};
const openLong =()=>{
    setState({
        views:false
    })
};
const selectedElement =()=> {
    const selected = document.querySelector('.selected');
    const optionsContainer = document.querySelector('.options-container');
    const optionsList = document.querySelectorAll('.option');
    selected.addEventListener('click', ()=>{
        optionsContainer.classList.toggle('active');
    })
    optionsList.forEach(option=>{
        option.addEventListener('click', ()=>{
            selected.innerHTML = option.querySelector('label').innerHTML;
            optionsContainer.classList.remove('active');
            setState({
                selectedTerm: selected.innerHTML
            })
            setState({
                sortedMovieData: state.movieData.filter(m=> m.genres.includes(state.selectedTerm))
            })
        })
    })
}
//Render App
function render(state){
    app.innerHTML = `
    <div id="modal-container" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <div id="modal-text"></div>
    </div>
    </div>
    <div id="main">
    <div>
        <div style="display: flex">
        <h1 class="main-title"> Movies Gallery </h1>
        ${state.views !== true ? 
        `<div class="container" onclick="selectedElement()">
        <div class="select-box">
        <div class="options-container">   
         ${state.selectedList.reduce((html, label)=>{
            return html + selectTemplate(label)}, '')}
        </div>
         <div class="selected">
        ${state.selectedTerm || "Select genre"}
        <svg xmlns="http://www.w3.org/2000/svg" style="margin-left: 30px" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
         <path d="M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
        </svg></div>   
        </div>
        </div>` : ''
        } 
        <div class="views" style="display: flex">
         <div class="main-title" id="short" style="cursor: pointer" onclick="openShort()">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-grid-3x3-gap-fill" viewBox="0 0 16 16">
        <path d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2z"/>
        </svg></div>
        <div class="main-title" id="big" style="cursor: pointer; margin-top: 3px" onclick="openLong()">
        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35   " fill="currentColor" class="bi bi-list-ul" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
        </svg></div>
        </div>   
        </div>
        ${state.views === true ?
        `<div id="gallery">
            ${state.movieData.reduce((html, movie)=>{
            return html + movieTemplate(movie, true)}, '')}
        </div>` :
        `<div id="gallery-big">
            ${state.sortedMovieData.reduce((html, movie)=>{
            return html + movieTemplateBig(movie, true)}, '')}
        </div>`
        }   
        </div>
         <div>
         <h1 class="main-title"> Favorite List </h1>
         <div id="favorite">
        ${state.liked.reduce((html, movie)=>{
        return html + movieTemplate(movie, false)}, '')} 
    </div>
    </div>
    </div>`
}