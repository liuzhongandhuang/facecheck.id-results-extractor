// ==UserScript==
// @name         Base64 URL Extractor for FaceCheck Results with Delayed User Input
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Asks the user how many base64 background image URLs to extract (up to 20) after the results page is detected, and displays them in a popup
// @author       vin31_
// @match        https://facecheck.id/*
// @grant        unsafeWindow
// @require      https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js
// ==/UserScript==

(function () {
    'use strict';
    //add a window to show the link
    setTimeout(function () {
        $("body").append(" <div id='image-link' style='left: 10px;top: 70px;background: #daff94;color:#000000;opacity: 0.5;overflow: auto;z-index: 9999;position: fixed;padding:5px;text-align:left;width: 180px;height: 200px;border-bottom-left-radius: 4px;border-bottom-right-radius: 4px;border-top-left-radius: 4px;border-top-right-radius: 4px;'></div>");
    }, 500);



    // Function to check if the current page is a results page
    function isResultsPage() {
        return window.location.href.match(/https:\/\/facecheck\.id\/zh\#.+/);
    }

    // Function to ask user input once the results page is detected
    function askForNumberOfUrls() {
        return parseInt(prompt("How many URLs would you like to extract? (Enter a number between 1 and 20)", "20"), 10);
    }

    // Function to loop through the results and extract URLs
    function findElementsAndExtractUrls(maxResults) {
        let foundUrls = []; // Array to store all found URLs

        // Loop through the results (fimg0, fimg1, etc.) up to maxResults
        for (let i = 0; i < maxResults; i++) {
            let fimgElement = document.querySelector(`#fimg${i}`);

            if (fimgElement) {
                // Get the CSS background-image value
                let backgroundImage = window.getComputedStyle(fimgElement).getPropertyValue('background-image');

                // Extract the base64 string from the background-image
                let base64String = backgroundImage.match(/base64,(.*)"/);
                if (base64String && base64String[1]) {
                    // Decode the base64 string
                    let decodedString = atob(base64String[1]);

                    // Search for a URL in the decoded string
                    let urlMatch = decodedString.match(/https?:\/\/[^\s"]+/);

                    if (urlMatch) {
                        let extractedUrl = urlMatch[0];
                        // Add the found URL to the array
                        foundUrls.push(`${extractedUrl}`);
                    }
                }
            }
        }

        // If URLs are found, display them in a window
        if (foundUrls.length > 0) {
            for (let i = 0; i < foundUrls.length; i++) {
                // add html link
                document.getElementById("image-link").innerHTML += '<li><a href="' + foundUrls[i] + '" target="_blank" >' + (i + 1) + '</a></li>';
            }
        } else {
            //
            document.getElementById("image-link").innerText = "no found urls"
        }
    }

    // Function to start the URL extraction after results are loaded
    function initiateUrlExtraction() {
        // Check if we're on a result page
        if (isResultsPage()) {
            // After 1 second delay, ask the user how many URLs they want to extract
            setTimeout(function () {
                const userCount = askForNumberOfUrls();
                // Validate user input, default to 20 if input is invalid
                const maxResults = (isNaN(userCount) || userCount < 1 || userCount > 20) ? 20 : userCount;

                // After 1 seconds, start extracting the URLs
                setTimeout(function () {
                    findElementsAndExtractUrls(maxResults);
                }, 1000); // 1 seconds delay for URL extraction
            }, 1000); // 1 second delay before asking for URLs
        }
    }

    // Use setInterval to check every 1000 ms (1 second) if the results page is detected
    const checkResultsPage = setInterval(function () {
        if (isResultsPage()) {
            initiateUrlExtraction(); // Start the process when the results page is detected
            clearInterval(checkResultsPage); // Stop checking once the results page is found
        }
    }, 1000); // Delay is set to 1000ms (1 second)

})();
