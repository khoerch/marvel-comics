'use strict';

//Should I create an object with API endpoints and keys as key value pairs?
const apiKeyYoutube = 'AIzaSyCjJlcZ8mjV7x4ZMHjBJ-FisBk_K2hZeG0';
const apiKeyMarvel = 'e7fbac215917563a2dd01a2a025fdada';
const apiKeyComicVine = 'db461332518168bcf3a79484a73ad6fb11f7dc5b';

function displayOrigin(characterInfo) {
    //Display the origin for the searched character from Comic Vine's API
    console.log(characterInfo);
    $('.origin').empty();
    $('.origin').append(`
        <h3>${characterInfo.name}</h3>
        <p>${characterInfo.bio}</p>
        <p>Aliases: ${characterInfo.aliases}</p>
        <ul class="aliases">

        </ul>
        <img src="${characterInfo.image}" alt="character image">
        <h3>Origin</h3>
        <p>${characterInfo.description}</p>
        <p>Learn more at <a href="${characterInfo.sourceUrl}" target="_blank">ComicVine.com</a>.</p>
    `);
}

function displayVideos(videoJson) {
    //Display videos from YouTube based on the searched character
    console.log(videoJson);
    $('#video-results').empty();
    for (let i = 0; i < videoJson.items.length; i++) {
        $('#video-results').append(`
        <li>
            <p>${videoJson.items[i].snippet.title}</p>
            <a href="https://www.youtube.com/channel/${videoJson.items[i].snippet.channelId}" target="_blank">${videoJson.items[i].snippet.channelTitle}</a>
            <p>${videoJson.items[i].snippet.description}</p>
            <iframe src="https://www.youtube.com/embed/${videoJson.items[i].id.videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </li>
        `);
    }
}

function displayComics(comicJson) {
    //Edits the DOM to add collection of comics based on the unique ID of the character
    console.log(comicJson);
    $('#js-comics').empty();
    for (let i=0; i<comicJson.length; i++) {
      $('#js-comics').append(`
      <li>
        <p>${comicJson[i].title}</p>
        <a href="${comicJson[i].urls[0].url}" target="_blank"><img src="${comicJson[i].images[0].path}.${comicJson[i].images[0].extension}" alt="Issue cover"/></a>
        <a href="${comicJson[i].urls[0].url}" target="_blank">Start Reading!</a>
      </li>
    `)
    }
}

function getOrigin(searchTerm) {
    //Calls the Comicvine api to return background information on the character
    const url = "https://comicvine.gamespot.com/api/";

    const params = $.param({
        query: searchTerm,
        limit: 1,
        resources: 'character',
        api_key: apiKeyComicVine
    });

    function removeCDATA(data) {
        //This function removes a problematic CDATA tag in the XML so I can work with it. Previous attempts to convert the data to JSON were not working so switched to working with the XML directing
        return data.replace("<![CDATA[","")
                   .replace("]]>", "");
    }

    fetch(`https://cors-anywhere.herokuapp.com/${url}search?${params}`)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error(response.statusText);
        })
        .then(xmlText => {
            return $.parseXML(xmlText);
        })
        .then(xmlDoc => {
            console.log(xmlDoc);
            const characterInfo = {
                name: removeCDATA(xmlDoc.getElementsByTagName('name')[1].innerHTML),
                aliases: removeCDATA(xmlDoc.getElementsByTagName('aliases')[0].innerHTML).split("\r\n"),
                sourceUrl: removeCDATA(xmlDoc.getElementsByTagName('site_detail_url')[0].innerHTML),
                image: removeCDATA(xmlDoc.getElementsByTagName('medium_url')[0].innerHTML),
                bio: removeCDATA(xmlDoc.getElementsByTagName('deck')[0].innerHTML),
                description: xmlDoc.getElementsByTagName('description')[0].innerHTML.replace(/<[^>]*>?/gm, '').split("Creation")[0].substring(6),
            }

            displayOrigin(characterInfo);
        })
        .catch(err => console.log(err.message));
}

function getVideo(searchTerm) {
    //Based on the search term, call the separate API requests and pass JSON messages to next functions to display the results
    
    const urlVideo = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(`history of ${searchTerm} comics`)}&type=video&key=${apiKeyYoutube}`; 

    fetch(urlVideo)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayVideos(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`)
        });
}

function getComics(id) {
    //Takes the unique character ID and returns a selection of comics for readers to start with based on the character
    const urlComics = `https://gateway.marvel.com:443/v1/public/characters/${id}/comics?format=comic&formatType=comic&noVariants=true&issueNumber=1&orderBy=-onsaleDate&limit=5&apikey=${apiKeyMarvel}`;
  
    fetch(urlComics)
      .then(response => {
        if (response.ok) {
          return response.json()
        } throw new Error(response.statusText);
      })
      .then(responseJson => displayComics(responseJson.data.results))
      .catch(err => console.log(err.message));
}

function getMarvel(searchTerm) {
    //Function to return the unique character ID from Marvel in order to retrieve comics and validate the search term. 
    const urlMarvel = `https://gateway.marvel.com:443/v1/public/characters?name=${searchTerm}&limit=1&apikey=${apiKeyMarvel}`;

    fetch(urlMarvel)
        .then(response => {
        if (response.ok) {
            return response.json()
        } throw new Error(response.statusText);
        })
        .then(responseJson => {
            getComics(responseJson.data.results[0].id);
            validateSearch(responseJson.data.results[0].id);
        })
        .catch(err => console.log(err.message));
}

function validateSearch(id) {
    //Check that the search term is a valid character
    console.log(id + ' hello!');
}

function watchForm() {
    //Waits for the user to submit the form. Once they do it logs value and passes it to the next function
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#js-character-search').val();
        getOrigin(searchTerm);
        //getVideo(searchTerm);
        //getMarvel(searchTerm);
    })
}

$(watchForm);