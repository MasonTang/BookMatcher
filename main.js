'use strict';

let bookData = [];
//responseJson.Similar.Results[i].name

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

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

    console.log(url);

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

function getGoogleApi(searchTerm) {
    //Googlebooks api
    console.log(searchTerm);
    const keyGoogle = 'AIzaSyA8VKI7V3csSpGGiqz2bNyjEOzaTzn30Tc';
    const googleURL = 'https://www.googleapis.com/books/v1/volumes';
    const params = {
        q: searchTerm,
        key: keyGoogle
    }
    const queryString = formatQueryParams(params);
    const url = `${googleURL}?${queryString}`;
    console.log(url)

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json(searchTerm);
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayImages(responseJson,searchTerm))
        //cancel out the second then when you don't need it.
        .then(() => {
        if (bookData.length === 0) {
            return $('.matchbook').text("We don't have the recommended book at this time.")
        }   
        for(let i = 0; i < bookData.length; i++){
            $('.matchbook').text("")
            getGoogleTasteApi(bookData[i], i);
        }
        console.log(bookData);
        })
        .catch(err => {
            $('.mainbook').text(`Something went wrong: ${err.message}`);
        });
}

//run a for loop outside of getGoogleTasteApi

function getGoogleTasteApi(bookData,index) {
    //Googlebooks api
    console.log(bookData);
    
    const keyGoogle = 'AIzaSyA8VKI7V3csSpGGiqz2bNyjEOzaTzn30Tc';
    const googleURL = 'https://www.googleapis.com/books/v1/volumes';
    const uniqueId= index;
    const params = {
        q: bookData,
        key: keyGoogle
    }
       
    console.log(params);
    const queryString = formatQueryParams(params);
    const url = `${googleURL}?${queryString}`;
    console.log(url);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayTasteImages(responseJson, uniqueId))
        .catch(err => {
            $('.mainbook').text(`Something went wrong: ${err.message}`);
        });
}

function getAmazonApi(searchTerm){
    //Amazonlink
    console.log(searchTerm);
    const AmazonURL = 'https://www.amazon.com/s/ref=nb_sb_noss_1';
    const params = {
         url: 'search-alias%3Dstripbooks',
        "field-keywords": searchTerm
    };
    const queryString = formatQueryParams(params);
    const url = `${AmazonURL}?${queryString}`;
    console.log(url);
    return url;
}

function displayImages(responseJson,searchTerm) {
    console.log(searchTerm);
    $('.mainbook').empty();
    const bookImage = responseJson.items[0].volumeInfo.imageLinks.smallThumbnail;
    const bookTitle = responseJson.items[0].volumeInfo.title;
    const displayImage = `<div id="inline-popups">
        <a href="#test-popup" data-effect="mfp-zoom-in">
        <img src=${bookImage} width="100" alt=${bookTitle}>
        </a>
        </div>`;
    $(displayImage).appendTo($('.mainbook'));
    lightbox();
    textPopup(responseJson, searchTerm);
    getAmazonApi(searchTerm);
    console.log(getAmazonApi(searchTerm))
    console.log(displayImage);
}

function displayTasteImages(responseJson, uniqueId){
    //comment out the if statement to see what is causing the problem
    bookData = [];
    console.log(bookData)
    if( $('.matchbook-img').length > 2 ){
        
        $('.matchbook').empty();
    }
    const bookImage = responseJson.items[0].volumeInfo.imageLinks.smallThumbnail;
    const bookTitle = responseJson.items[0].volumeInfo.title;
    const displayImage =
            $('<img>',
            {
                class: 'matchbook-img',
                id: uniqueId,
                src: bookImage,
                alt: bookTitle
            })
            .appendTo($('.matchbook'))
    console.log(displayImage)  
}

function textPopup(responseJson,searchTerm){
    const bookImage = responseJson.items[0].volumeInfo.imageLinks.smallThumbnail;
    const bookTitle = responseJson.items[0].volumeInfo.title;
    const bookDescription = responseJson.items[0].volumeInfo.description;
    const averageRating = responseJson.items[0].volumeInfo.averageRating;
    getAmazonApi(searchTerm);
    const amazonURL = getAmazonApi(searchTerm);
    console.log(amazonURL);
    $('.test-popup-img').attr('src',`${bookImage}`);
    $('.test-popup-title').html(`<h1>${bookTitle}</h1>`);
    $('.test-popup-description').html(`<h2>Book Summary</h2>${bookDescription}`);
    $('.test-popup-averageRating').html(`<h2>Average Rating on Google Reviews: ${averageRating}/5</h2>`);
    $('.test-popup-amazon').html(`<h2><a href="${amazonURL}" target="_blank">Buy on Amazon</a></h2>`);
}



function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('.search-input-js').val();
        getTasteApi(searchTerm);
    })
}

$(watchForm);