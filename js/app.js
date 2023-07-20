//
//  app.js
//  altsource-viewer (https://github.com/therealFoxster/altsource-viewer)
//
//  Copyright (c) 2023 Foxster.
//  MIT License.
//

import { urlSearchParams, formatString, sourceURL } from "./utilities.js";
import { main } from "./main.js";

if (!urlSearchParams.has('id')) exit();
const bundleId = urlSearchParams.get('id');

(function () {
    // Hide/show navigation bar title & install button
    let hidden = false;
    window.onscroll = function (e) {
        const appName = document.querySelector(".app-header .text>.title");
        const title = document.getElementById("title");
        const button = document.querySelector("#nav-bar .install");

        if (hidden && appName.getBoundingClientRect().y >= 72) { // App name not visible
            hidden = false;
            title.classList.add("hidden");
            button.classList.add("hidden");
            button.disaled = true;
        } else if (!hidden && appName.getBoundingClientRect().y < 72) {
            hidden = true;
            title.classList.remove("hidden");
            button.classList.remove("hidden");
            button.disaled = false;
        }
    }
})();

main((json) => {
    const app = getAppWithBundleId(bundleId);
    if (!app) exit();

    // If has multiple versions, show the latest one
    if (app.versions) {
        const latestVersion = app.versions[0];
        app.version = latestVersion.version;
        app.versionDate = latestVersion.date;
        app.versionDescription = latestVersion.localizedDescription;
        app.downloadURL = latestVersion.downloadURL;
        app.size = latestVersion.size;
    }

    // Set tab title
    document.title = `${app.name} - ${json.name}`;

    const tintColor = `#${app.tintColor?.replaceAll("#", "")}`;
    // Set tint color
    if (tintColor) document.querySelector(':root').style.setProperty("--app-tint-color", `${tintColor}`);

    // Tint back button
    document.getElementById("back").style.color = tintColor;

    // Set up install buttons
    document.querySelectorAll("a.install").forEach(button => {
        button.href = `altstore://install?url=${app.downloadURL}`;
    });

    // Set up download button
    document.getElementById("download").href = app.downloadURL;

    // 
    // Navigation bar
    const navigationBar = document.getElementById("nav-bar");
    // Title
    navigationBar.querySelector("#title>p").textContent = app.name;
    // App icon
    navigationBar.querySelector("#title>img").src = app.iconURL;
    // Install button
    navigationBar.querySelector(".uibutton").style.backgroundColor = `${tintColor}`;

    // 
    // App header
    const appHeader = document.querySelector("#main .app-header");
    // Icon
    appHeader.querySelector("img").src = app.iconURL;
    // App name
    appHeader.querySelector(".title").textContent = app.name;
    // Developer name
    appHeader.querySelector(".subtitle").textContent = app.developerName;
    // Install button
    appHeader.querySelector(".uibutton").style.backgroundColor = tintColor;
    // Background
    appHeader.querySelector(".background").style.backgroundColor = tintColor;

    const more = `
    <a id="more" onclick="revealTruncatedText(this);">
        <button style="color: ${tintColor};">more</button>
    </a>`;

    window.revealTruncatedText = moreButton => {
        const textId = moreButton.parentNode.id;
        const text = document.getElementById(textId);
        text.style.display = "block";
        text.style.overflow = "auto";
        text.style.webkitLineClamp = "none";
        text.style.lineClamp = "none";
        text.removeChild(moreButton)
    }

    // 
    // Preview
    const preview = document.getElementById("preview");
    // Subtitle
    preview.querySelector("#subtitle").textContent = app.subtitle;
    // Screenshots
    app.screenshotURLs.forEach(url => {
        preview.querySelector("#screenshots").insertAdjacentHTML("beforeend", `<img src="${url}" alt="" class="screenshot">`);
    });
    // Description
    const previewDescription = preview.querySelector("#description");
    previewDescription.innerHTML = formatString(app.localizedDescription);
    if (previewDescription.scrollHeight > previewDescription.clientHeight)
        previewDescription.insertAdjacentHTML("beforeend", more);

    // 
    // Version info
    const versionDateElement = document.getElementById("version-date");
    const versionNumberElement = document.getElementById("version");
    const versionSizeElement = document.getElementById("version-size");
    const versionDescriptionElement = document.getElementById("version-description");
    const versionDate = new Date(app.versionDate),
        month = versionDate.toUTCString().split(" ")[2],
        date = versionDate.getDate();
    const today = new Date();
    const msPerDay = 60 * 60 * 24 * 1000;
    const msDifference = today.valueOf() - versionDate.valueOf();

    // Version date
    versionDateElement.textContent = versionDate.valueOf() ? `${month} ${date}, ${versionDate.getFullYear()}` : app.versionDate.split("T")[0];
    if (msDifference <= msPerDay && today.getDate() == versionDate.getDate())
        versionDateElement.textContent = "Today";
    else if (msDifference <= msPerDay * 2)
        versionDateElement.textContent = "Yesterday";

    // Version number
    versionNumberElement.textContent = `Version ${app.version}`;

    // Version size
    const units = ["B", "KB", "MB", "GB"];
    var appSize = app.size, i = 0;
    while (appSize > 1024) {
        i++;
        appSize = parseFloat(appSize / 1024).toFixed(1);
    }
    versionSizeElement.textContent = `${appSize} ${units[i]}`;

    // Version description
    versionDescriptionElement.innerHTML = formatString(app.versionDescription);
    if (versionDescriptionElement.scrollHeight > versionDescriptionElement.clientHeight)
        versionDescriptionElement.insertAdjacentHTML("beforeend", more);

    // 
    // Permissions
    const permissions = document.getElementById("permissions");

    // If permissions specified
    if (app.permissions) {
        // Remove placeholder permission
        permissions.querySelector(".permission").remove();

        app.permissions?.forEach(permission => {
            var permissionType, icon;
            switch (permission.type) {
                // AltStore-supported permissions
                case "background-audio":
                    permissionType = "Background Audio";
                    icon = "volume-up-fill";
                    break;
                case "background-fetch":
                    permissionType = "Background Fetch";
                    icon = "arrow-repeat"
                    break;
                case "photos":
                    permissionType = "Photos"
                    icon = "image-fill";
                    break;
                // Additional permissions
                case "camera":
                    permissionType = "Camera"
                    icon = "camera-fill";
                    break;
                case "music":
                    permissionType = "Music Library"
                    icon = "music-note-list";
                    break;
                case "location":
                    permissionType = "Location"
                    icon = "geo-alt-fill";
                    break;
                case "microphone":
                    permissionType = "Microphone"
                    icon = "mic-fill";
                    break;
                case "contacts":
                    permissionType = "Contacts"
                    icon = "people-fill";
                    break;
                case "bluetooth":
                    permissionType = "Bluetooth"
                    icon = "bluetooth";
                    break;
                case "faceid":
                    permissionType = "Face ID"
                    icon = "person-bounding-box";
                    break;
                case "network":
                    permissionType = "Network"
                    icon = "wifi";
                    break;
                case "calendar":
                case "calendars":
                    permissionType = "Calendar"
                    icon = "calendar-date";
                    break;
                case "reminders":
                    permissionType = "Reminders"
                    icon = "list-ul";
                    break;
                case "siri":
                    permissionType = "Siri"
                    icon = "gear-wide-connected";
                    break;
                case "speech-recognition":
                    permissionType = "Speech Recognition"
                    icon = "soundwave";
                    break;
                default:
                    permissionType = permission.type.replaceAll("-", " ");
                    icon = "gear-wide-connected";
                    break;
            }
            permissions.insertAdjacentHTML("beforeend", `
            <div class="permission">
                <i class="bi-${icon}" style="color: ${tintColor};"></i>
                <div class="text">
                    <p class="title">${permissionType}</p>
                    <p class="description">${permission.usageDescription ?? "No description provided."}</p>
                </div>
            </div>`);
        });
    }

    //
    // Source info
    const source = document.getElementById("source");
    const sourceContainer = source.querySelector(".container");
    const sourceTitle = source.querySelector(".row-title");
    const sourceSubtitle = source.querySelector(".row-subtitle");
    sourceTitle.innerText = json.name;
    sourceContainer.href = `index.html?source=${sourceURL}`;
    sourceSubtitle.innerText = json.description ?? "Tap to get started";
});

function exit() {
    window.location.replace(`index.html?source=${sourceURL}`);
}
