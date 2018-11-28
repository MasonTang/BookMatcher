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
        limit: 6,
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
            firstTextPopup(responseJson);
            firstLightbox();
            
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
function getGoogleTasteApi(bookData,searchTerm) {
    //Googlebooks api
    const keyGoogle = 'AIzaSyA8VKI7V3csSpGGiqz2bNyjEOzaTzn30Tc';
    const googleURL = 'https://www.googleapis.com/books/v1/volumes';
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
            
            displayTasteImages(responseJson,searchTerm);
        
            bookInfo[bookInfo.length] = {
                bookImage: responseJson.items[0].volumeInfo.imageLinks.smallThumbnail,
                bookTitle: responseJson.items[0].volumeInfo.title,
                bookDescription: responseJson.items[0].volumeInfo.description,
                averageRating: responseJson.items[0].volumeInfo.averageRating,
                amazonURL: getAmazonApi(responseJson.items[0].volumeInfo.title)
            }
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

//display first book Images
function displayImages(responseJson) {

    $('.mainbook').empty();
    const bookImage = responseJson.items[0].volumeInfo.imageLinks.smallThumbnail;
    const bookTitle = responseJson.items[0].volumeInfo.title;
    const displayImage = `<div id="inline-popups" class="center">
        <a href="#test-popup" data-effect="mfp-zoom-in">
        <img class="main-img" src=${bookImage} width="100" alt=${bookTitle}>
        </a>
        </div>`;
    $('.mainbook').append(displayImage);
   
}

//displays recommended book Images 
function displayTasteImages(responseJson){
    //
    bookData = [];
    let bookInfoIndex = bookInfo.length 
    
    const bookImage = responseJson.items[0].volumeInfo.imageLinks.smallThumbnail;
    const bookTitle = responseJson.items[0].volumeInfo.title;
    const displayImage = `<div class="inline-popups">
        <a href="#test-popup" data-effect="mfp-zoom-in">
        <img src=${bookImage} width="100" alt=${bookTitle} id=${bookInfoIndex} class="match-book-img">
        </a>
        </div>`;

    $(displayImage).appendTo($('.matchbook'));
}

//lightbox for the first book image
function firstTextPopup(responseJson, searchTerm){
    const bookTitle = responseJson.items[0].volumeInfo.title;
    const bookDescription = responseJson.items[0].volumeInfo.description;
    const averageRating = responseJson.items[0].volumeInfo.averageRating;
    const amazonURL = getAmazonApi(bookTitle);

   
    $('.test-popup-title').html(`<h2>${bookTitle}</h2>`);
    $('.test-popup-description').html(`<h3>Book Summary</h3>${bookDescription}`);
    $('.test-popup-averageRating').html(`<h4>Average Rating on Google Reviews: ${averageRating}/5</h4>`);
    $('.test-popup-amazon').html(`<h3><a href="${amazonURL}" target="_blank">Buy on Amazon</a></h3>`);
}

//lightbox for the recommended book image
function textPopup(index){
    console.log(index)
    $('.test-popup-title').html(`<h2>${bookInfo[index].bookTitle}</h2>`);
    $('.test-popup-description').html(`<h3>Book Summary</h3>${bookInfo[index].bookDescription}`);
    $('.test-popup-averageRating').html(`<h4>Average Rating on Google Reviews: ${bookInfo[index].averageRating}/5</h4>`);
    $('.test-popup-amazon').html(`<h3><a href="${bookInfo[index].amazonURL}" target="_blank">Buy on Amazon</a></h3>`);
}


function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        searchTerm = $('.search-input-js').val();
        getTasteApi(searchTerm);
    })
    //when the recommended bookimage is hovered over, it grabs the id for lightbox
    $(".matchbook").on("mouseenter","img", event => {
        let bookId = $(event.currentTarget).attr('id');
        lightbox();
        textPopup(bookId);
        getAmazonApi(searchTerm);
    })
}

$(watchForm);

