// In order to validate the data from a user's search term, I used an array of all the possible characters accessible on Marvel's API to cross check that a search would return a valid character. There is a limit on how many characters you can call using this API, so we needed a program to call and collect all of these details. The code below does not run on the page, but I'm including it here for future reference and understanding on where the character array came from. My mentor helped me to figure this out. I'm including his notes on promises and more as well. 

'use strict'

const baseUrl = "https://gateway.marvel.com:443/v1/public/";
const apikey = "e7fbac215917563a2dd01a2a025fdada";
const total = 1491; // Total from the API responses

/*
  the value of fetch("some url") is always a promise, which means it has the
  .then method that allows us to pass a function of what to do with the result
  once it's done, but it's also a value that we can store it in a variable and
  pass its value around and do the .then anywhere we want, for example, we could do:

  let promise = fetch("www.someapi.com/api/character");

  promise.then(console.log);

  ---

  Likewise, we can create a function like this:

  function fetchWithName(name) {
     return fetch("www.someapi.com/api/character?name="+name)
                  .then(r => r.json());
  }

  (the .then also returns a promise, allowing us to chain more things to it if we want)

  and then we can do:

  fetchWithName("Spider-man").then( ... );
  fetchWithName("Venom").then(...);

   using the promise that is returned by the function.


  This is what I'm doing in the function below, but with "offset" as the parameter instead of the name.
*/


function fetchData(offset) {
  const params = $.param({ apikey, limit: 100, offset: offset });
  return fetch(`${baseUrl}characters?${params}`).then(
    r => r.json()
  );
}

/*

   Since the promises are values, it means we can also put them in arrays, so this would be fine:

   let promises = [fetchData(0), fetchData(100), fetchData(200)];


   The problem is that we want to wait for all of them to complete before we aggregate the result
   and if we apply .then to each one of those promises in the array each one will be done at a different time.

   That's what Promise.all() is for. Promise.all(arrayOfPromises) will generate a promise that resolves to
   an array with the results of all the promises, it's .then will execute only after all of them are complete.

   For example:

   Promises.all([fetchData(0), fetchData(100), fetchData(200)]).then(
     results => {
     // results will be:
     // [result from fetchData(0), result from fetchData(100), result from fetchData(200)]
   });
*/

// this is to create an array with the offsets, this will generate
// [0, 100, 200, 300, ...]
let offsets = [];

for (let i=0; i<total; i+=100) { 
  offsets.push(i);
}

Promise.all(offsets.map(o => fetchData(o))).then(
  r => {
    let characters = [];
    for (const result of r) {
      for (const character of result.data.results) {
        characters.push(character.name.toLowerCase());
      }
    }

    // This is to store on the windows localStorage, easiest
    // way I could think of to copy the data when running this
    // on the browser.
    localStorage.setItem('marvelCharacters', JSON.stringify(characters));
    console.log("done!");
  }
);