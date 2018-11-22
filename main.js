'use strict';
//recommended book names
let bookData = [];
let bookInfo = [];
let searchTerm = [];

//format url
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

//get data for recommended books
function getTasteApi(searchTerm) {
    //Get TasteDiveApi
    const keyTaste = '323255-booksapi-OHI8K83G';
    const tasteURL = 'https://tastedive.com/api/similar';
    const params = {
        k: keyTaste,
        type: 'books',
        q: searchTerm,
        limit: 3,
        info: 1
    }
    const queryString = formatQueryParams(params);
    const url = `${tasteURL}?${queryString}`;

    

    $.ajax({
        dataType: "jsonp",
        url: url,
        data: queryString,
        success: function (responseJson) {
            //displayTasteImages(searchTerm)
            const booksName = responseJson.Similar.Results;
            for (let i = 0; i < booksName.length; i++) {
                bookData.push(booksName[i].Name)
            }
            getGoogleApi(searchTerm);
        }
    });
}

//get google books api for the picture and data
function getGoogleApi(searchTerm) {
    
    const keyGoogle = 'AIzaSyA8VKI7V3csSpGGiqz2bNyjEOzaTzn30Tc';
    const googleURL = 'https://www.googleapis.com/books/v1/volumes';
    const params = {
        q: searchTerm,
        key: keyGoogle
    }
    const queryString = formatQueryParams(params);
    const url = `${googleURL}?${queryString}`;
    

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json(searchTerm);
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            //display search term book image
            displayImages(responseJson,searchTerm);
            //activates lightbox when clicked
            $(".mainbook").on("click", "img", event => {
                getAmazonApi(searchTerm);
                firstTextPopup(responseJson);
                firstLightbox();
            })
        })
        .then(() => {
        if (bookData.length === 0) {
            return $('.matchbook').text("We don't have the recommended book at this time.")
        }   
        for(let i = 0; i < bookData.length; i++){
            $('.matchbook').text("")
            getGoogleTasteApi(bookData[i], i);
            }
        })

        .catch(err => {
            $('.mainbook').text(`Something went wrong: ${err.message}`);
        });
}

//run a for loop outside of getGoogleTasteApi

function getGoogleTasteApi(bookData,index,searchTerm) {
    //Googlebooks api
   
    
    const keyGoogle = 'AIzaSyA8VKI7V3csSpGGiqz2bNyjEOzaTzn30Tc';
    const googleURL = 'https://www.googleapis.com/books/v1/volumes';
    const uniqueId= index;
    const params = {
        q: bookData,
        key: keyGoogle
    }
       
   
    const queryString = formatQueryParams(params);
    const url = `${googleURL}?${queryString}`;
   

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            
            displayTasteImages(responseJson, uniqueId);
        
            bookInfo[bookInfo.length] = {
                bookImage: responseJson.items[0].volumeInfo.imageLinks.smallThumbnail,
                bookTitle: responseJson.items[0].volumeInfo.title,
                bookDescription: responseJson.items[0].volumeInfo.description,
                averageRating: responseJson.items[0].volumeInfo.averageRating,
                amazonURL: getAmazonApi(searchTerm)
            }
            //console.log(bookInfo)
        })
        .catch(err => {
            $('.mainbook').text(`Something went wrong: ${err.message}`);
        });
}

function getAmazonApi(searchTerm){
    //Amazonlink
   
    const AmazonURL = 'https://www.amazon.com/s/ref=nb_sb_noss_1';
    const params = {
         url: 'search-alias%3Dstripbooks',
        "field-keywords": searchTerm
    };
    const queryString = formatQueryParams(params);
    const url = `${AmazonURL}?${queryString}`;
  
    return url;
}

function displayImages(responseJson,searchTerm) {
   
    $('.mainbook').empty();
    const bookImage = responseJson.items[0].volumeInfo.imageLinks.smallThumbnail;
    const bookTitle = responseJson.items[0].volumeInfo.title;
    const displayImage = `<div id="inline-popups">
        <a href="#test-popup" data-effect="mfp-zoom-in">
        <img src=${bookImage} width="100" alt=${bookTitle}>
        </a>
        </div>`;
    $(displayImage).appendTo($('.mainbook'));
    // lightbox();
    // textPopup(responseJson, searchTerm);
    // getAmazonApi(searchTerm);
  
}

function displayTasteImages(responseJson, uniqueId,searchTerm){
    //comment out the if statement to see what is causing the problem
    bookData = [];
    
    
    const bookImage = responseJson.items[0].volumeInfo.imageLinks.smallThumbnail;
    const bookTitle = responseJson.items[0].volumeInfo.title;

    const displayImage = `<div class="inline-popups">
        <a href="#test-popup" data-effect="mfp-zoom-in">
        <img src=${bookImage} width="100" alt=${bookTitle} id=${uniqueId} class="match-book-img">
        </a>
        </div>`;

    $(displayImage).appendTo($('.matchbook'));
}

//responseJson will only pick up the last responseJson item and that is why it displays the last book 
function firstTextPopup(responseJson, searchTerm){
    const bookImage = responseJson.items[0].volumeInfo.imageLinks.smallThumbnail;
    const bookTitle = responseJson.items[0].volumeInfo.title;
    const bookDescription = responseJson.items[0].volumeInfo.description;
    const averageRating = responseJson.items[0].volumeInfo.averageRating;
    getAmazonApi(searchTerm);
    const amazonURL = getAmazonApi(searchTerm);

    $('.test-popup-img').attr('src',`${bookImage}`);
    $('.test-popup-title').html(`<h1>${bookTitle}</h1>`);
    $('.test-popup-description').html(`<h2>Book Summary</h2>${bookDescription}`);
    $('.test-popup-averageRating').html(`<h2>Average Rating on Google Reviews: ${averageRating}/5</h2>`);
    $('.test-popup-amazon').html(`<h2><a href="${amazonURL}" target="_blank">Buy on Amazon</a></h2>`);
}

function textPopup(index){
    console.log(index)
    $('.test-popup-img').attr('src',`${bookInfo[index].bookImage}`);
    $('.test-popup-title').html(`<h1>${bookInfo[index].bookTitle}</h1>`);
    $('.test-popup-description').html(`<h2>Book Summary</h2>${bookInfo[index].bookDescription}`);
    $('.test-popup-averageRating').html(`<h2>Average Rating on Google Reviews: ${bookInfo[index].averageRating}/5</h2>`);
    $('.test-popup-amazon').html(`<h2><a href="${bookInfo[index].amazonURL}" target="_blank">Buy on Amazon</a></h2>`);
}

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        searchTerm = $('.search-input-js').val();
        getTasteApi(searchTerm);
    })
    $(".matchbook").on("click", "a > img", event => {
        let bookId = $(event.currentTarget).attr('id');
        //console.log(responseJson)
        console.log(bookId, "bookId");
        lightbox();
        textPopup(bookId);
        getAmazonApi(searchTerm);
    })
}

$(watchForm);

