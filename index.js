'use strict';

//Should I create an object with API endpoints and keys as key value pairs?
const apiKeyYoutube = 'AIzaSyCjJlcZ8mjV7x4ZMHjBJ-FisBk_K2hZeG0';
const apiKeyMarvel = 'e7fbac215917563a2dd01a2a025fdada';
const apiKeyComicVine = 'db461332518168bcf3a79484a73ad6fb11f7dc5b';

function displayOrigin(originJson) {
    //Display the origin for the searched character from Comic Vine's API
    console.log(originJson);
}

function displayVideos(videoJson) {
    //Display videos from YouTube based on the searched character
    console.log(videoJson);
    $('#video-results').empty();
    for (let i = 0; i < videoJson.items.length; i++) {
        $('#video-results').append(`
        <li>
            <p>${videoJson.items[i].snippet.title}</p>
            <img src='${videoJson.items[i].snippet.thumbnails.default.url}'>
        </li>
        `);
    }
}

function displayComics() {
    //Display a list of suggested comics for the searched character from Marvel's API
}

function displayForum() {
    //Based on today's date, display this weeks forum discussion from Reddit
}

function createStrings() {
    //Create url strings for GET requests for each API. Should this be split up into multiple functions?
}

function getRequests(searchTerm) {
    //Based on the search term, call the separate API requests and pass JSON messages to next functions to display the results
    const urlOrigin = `https://comicvine.gamespot.com/api/search/?api_key=${apiKeyComicVine}&format=json&resources=volume&field_list=name&query=${searchTerm}`;

    const urlVideo = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(`history of ${searchTerm} comics`)}&type=video&key=${apiKeyYoutube}`; 
    
    console.log(urlOrigin);

    //This is using the comicvine API and it is not working. Documentation is very poor. Need more info.
    /*fetch(urlOrigin)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayOrigin(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`)
        });*/

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

function validateSearch(searchTerm) {
    //Check that the search term is a valid character
    console.log(searchTerm + ' hello!');
}

function watchForm() {
    //Waits for the user to submit the form. Once they do it logs value and passes it to the next function
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#js-character-search').val();
        validateSearch(searchTerm);
        getRequests(searchTerm);
    })
}

$(watchForm);