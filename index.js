'use strict';


// This uses the array of characters in the characters.js file to autocomplete the search term for the user
$(function characterDropDown() {
    $('#js-character-search').autocomplete({source: characters});
});


/* 
    The rest of the code below handles the API calls and displaying the 
    data coming from these sources. API keys are listed for easy access.
*/

const apiKeyYoutube = 'AIzaSyCjJlcZ8mjV7x4ZMHjBJ-FisBk_K2hZeG0';
const apiKeyMarvel = 'e7fbac215917563a2dd01a2a025fdada';
const apiKeyComicVine = 'db461332518168bcf3a79484a73ad6fb11f7dc5b';

function displayError(searchTerm) {
    // This function tells the user that their search term is invalid and encourages them to try again
    $('#js-error-message').empty().removeClass('hidden').append(`
        Whoops! The character, ${searchTerm} could not be found. Remember to use the characters from the drop-down, or to include hyphens and other characters where appropriate. 
    `);
}

function displayOrigin(characterInfo) {
    //Display the origin for the searched character from Comic Vine's API
    $('#js-error-message').empty().addClass('hidden');
    $('.origin').empty();
    $('.origin').append(`
        <h3>${characterInfo.name}</h3>
        <p>${characterInfo.bio}</p>
        <img src="${characterInfo.image}" alt="character image">
        <h3>Aliases:</h3>
        <ul class="aliases">

        </ul>
        <h3>Origin</h3>
        <p>${characterInfo.description}</p>
        <p>Learn more at <a href="${characterInfo.sourceUrl}" target="_blank">ComicVine.com</a>.</p>
    `);
    for (let i = 0; i < characterInfo.aliases.length; i++) {
        $('.aliases').append(`
            <li>${characterInfo.aliases[i]}</li>
    `)};
}

function displayVideos(videoJson) {
    //Display videos from YouTube based on the searched character
    $('#video-results').empty();
    for (let i = 0; i < videoJson.items.length; i++) {
        $('#video-results').append(`
        <li>
            <h3>${videoJson.items[i].snippet.title}</h3>
            <iframe src="https://www.youtube.com/embed/${videoJson.items[i].id.videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <p> YouTube Channel: <a href="https://www.youtube.com/channel/${videoJson.items[i].snippet.channelId}" target="_blank">${videoJson.items[i].snippet.channelTitle}</a></p>
        </li>
        `);
    }
}

function displayComics(comicJson) {
    //Edits the DOM to add collection of comics based on the unique ID of the character
    $('#js-comics').empty();
    for (let i=0; i<comicJson.length; i++) {
      $('#js-comics').append(`
      <li>
        <p>${comicJson[i].title}</p>
        <a href="${comicJson[i].urls[0].url}" target="_blank" class="cover"><img src="https${comicJson[i].images[0].path.slice(4)}.${comicJson[i].images[0].extension}" alt="Issue cover"/></a>
        <a href="${comicJson[i].urls[0].url}" target="_blank" class="red-button read-link">READ NOW</a>
      </li>
    `)
    }
}

function getOrigin(searchTerm) {
    //Calls the Comicvine api to return background information on the character
    let newTerm = searchTerm;
    // Most of the time, parenthesis after a name messes with the comicvine searches. However, its important for differentiating between the different Captain Marvel characters. This statements helps with that issue. 
    if (newTerm.slice(0, 7).toLowerCase() !== 'captain') {
        newTerm = searchTerm.replace(/\(([^)]+)\)/, '');
    }
    
    console.log('Comicvine Search: ' + newTerm);

    const url = "https://comicvine.gamespot.com/api/";

    const params = $.param({
        query: newTerm,
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
        .catch(err => console.log(err.message));
}

function getComics(id) {
    //Takes the unique character ID and returns a selection of comics for readers to start with based on the character
    const urlComics = `https://gateway.marvel.com:443/v1/public/characters/${id}/comics?`;

    console.log(id);

    const params = $.param({
        format: 'comic',
        formatType: 'comic',
        noVariants: true,
        issueNumber: 1,
        hasDigitalIssue: true,
        orderBy: 'onsaleDate',
        limit: 5,
        apikey: apiKeyMarvel,
    })
  
    fetch(urlComics + params)
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
        })
        .catch(err => console.log(err.message));
}

function validateSearch(formInput) {
    //Check that the search term is a valid character
    const searchTerm = formInput.toLowerCase();
    if (!characters.includes(searchTerm)) {
        const searchError = new Error('Character not found');
        console.log(searchError.message);
        displayError(searchTerm);
    } else {
        console.log('Character found');
        getOrigin(searchTerm);
        getVideo(searchTerm);
        getMarvel(searchTerm);
        const position = $('#scroll-to').offset();
        $('html, body').stop().animate({ scrollTop: position.top }, 2000);
    }
}

function watchForm() {
    //Waits for the user to submit the form. Once they do it logs value and passes it to the next function
    $('form').submit(event => {
        event.preventDefault();
        const formInput = $('#js-character-search').val();
        console.log('User input: ' + formInput);
        validateSearch(formInput);
    })
}

function randomClick() {
    // Watches for a user to click on the random character button and returns a random item from the characters array
    $('.js-random').click(event => {
        console.log('Random click');
        const randNum = Math.floor(Math.random() * 1491);
        console.log('Random character: ' + characters[randNum]);

        getOrigin(characters[randNum]);
        getVideo(characters[randNum]);
        getMarvel(characters[randNum]);
    })
}

function quickLink() {
    // Makes appropriate API calls and DOM manipulation if users click on one of the quick links at the top
    $('.js-quick-link').click(function() {
        let linkVal = $(this).val();
        console.log('Quick Link: ' + linkVal);

        getOrigin(linkVal);
        getVideo(linkVal);
        getMarvel(linkVal);
    })
}

function scrollTo() {
    // Scrolls the window to the results from a search, quick link, or random selection
    $('.scroll').click(function(event) {
        const position = $('#scroll-to').offset();
        $('html, body').stop().animate({ scrollTop: position.top }, 2000);
    })
}

$(quickLink);
$(randomClick);
$(watchForm);
$(scrollTo);