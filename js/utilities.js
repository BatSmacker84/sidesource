//
//  utilities.js
//  altsource-viewer (https://github.com/therealFoxster/altsource-viewer)
//
//  Copyright (c) 2023 Foxster.
//  MIT License.
//

import { AltStoreBanner } from "./components/AltStoreBanner.js";
import { NavigationBar } from "./components/NavigationBar.js";

export const urlSearchParams = new URLSearchParams(window.location.search);
export const sourceURL = urlSearchParams.get('source')?.replaceAll("+", "%2B");
// https://stackoverflow.com/a/8943487
export const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

export function insertAltStoreBanner(sourceName) {
    document.getElementById("top")?.insertAdjacentHTML("afterbegin", AltStoreBanner(sourceName));
}

export function insertNavigationBar(title) {
    document.getElementById("top")?.insertAdjacentHTML("beforeend", NavigationBar(title));
    setUpBackButton();
}

// https://stackoverflow.com/a/43467144/19227228
export function isValidHTTPURL(string) {
    var url;
    try {
        url = new URL(string);
    } catch (error) {
        console.error("An error occurred.", error);
        return false;
    }
    return url.protocol == "http:" || url.protocol == "https:";
}

export function formatString(string) {
    if (!string) return undefined;

    // URLs
    const urlArray = string.match(urlRegex);
    // const urlSet = [...new Set(urlArray)]; // Converting to set to remove duplicates
    var result = "";
    urlArray?.forEach(url => {
        string = string.replace(url, `<a href="${url}">${url}</a>`)
        // Remove formatted substring so it won't get formatted again (prevents <a> tag within the href attribute another <a> tag)
        let endIndexOfClosingTag = string.indexOf("</a>") + 4;
        let formattedSubstring = string.substring(0, endIndexOfClosingTag);
        result += formattedSubstring;
        string = string.replace(formattedSubstring, "");
    });

    result += string;

    // New lines
    return result.replaceAll("\n", "<br>");
}

export function setTintColor(color) {
    document.querySelector(':root')?.style.setProperty("--accent-color", `#${color}`);
}

export function setUpBackButton() {
    document.getElementById("back")?.addEventListener("click", () => history.back(1));
}

export function search() {
    window.location.replace("search.html");
}

const $ = selector => selector.startsWith("#") && !selector.includes(".") && !selector.includes(" ")
    ? document.getElementById(selector.substring(1))
    : document.querySelectorAll(selector);