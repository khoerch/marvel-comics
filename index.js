'use strict';


function displayOrigin() {
    //Display the origin for the searched character from Comic Vine's API
}

function displayVideos() {
    //Display videos from YouTube based on the searched character
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

function getRequests() {
    //Based on the search term, call the separate API requests and pass JSON messages to next functions to display the results
}

function watchForm() {
    //Waits for the user to submit the form. Once they do it logs value and passes it to the next function
}

$(watchForm);