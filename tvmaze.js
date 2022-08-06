"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const altImg = "http://tinyurl.com/missing-tv";


/** Given a search term, search for tv shows that match that query.
 *
 * 
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const res = await axios.get("http://api.tvmaze.com/search/shows", {params: {q: term}});
  const showsArr = [];
  for (let show of res.data){ 
      showsArr.push({
        id: show.show.id,
        name: show.show.name,
        summary: show.show.summary,
        image: show.show.image ? show.show.image.medium : altImg
      })
  }
  return showsArr
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();
  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-6 col-xl-4 mb-4">
         <div class="media">
           <img 
              src=${show.image}
              alt=${show.name} 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-dark btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);
  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  const arr = [];
  for (let ep of res.data){
    arr.push({
      id: ep.id,
      name: ep.name,
      season: ep.season,
      number: ep.number
    })
  }
  return arr;
}

/** Given array of episode objects from getEpisodesOfShow, appends episode data to episode-area div */

function populateEpisodes(episodes) {
  $('#episodes-list').empty();
    for (let ep of episodes){
      const $episode = $(`<li data-episode-id="${ep.id}">${ep.name} -- Season ${ep.season}, Episode ${ep.number}</li>`);
      $('#episodes-list').append($episode);
    }
}

async function getEpisodesAndDisplay(id){
  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
  $episodesArea.show();
}

$showsList.on('click', 'button', async function (e) {
  const showId = $(e.target).closest('.Show').data('show-id');
  await getEpisodesAndDisplay(showId);
})