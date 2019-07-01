'use strict';

//Should I create an object with API endpoints and keys as key value pairs?
const apiKeyYoutube = 'AIzaSyCjJlcZ8mjV7x4ZMHjBJ-FisBk_K2hZeG0';

function displayOrigin() {
    //Display the origin for the searched character from Comic Vine's API
}

function displayVideos(videoJson) {
    //Display videos from YouTube based on the searched character
    console.log(videoJson);
    $('#video-results').empty();
    $('#video-results').html(`
        <p>hello!</p>
    `);
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
    const urlVideo = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(`history of ${searchTerm}`)}&type=video&key=${apiKeyYoutube}`; 
    console.log(urlVideo);

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