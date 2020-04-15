# city_explorer_api

# author: Robert Carter

## team: Olga Charnysh

### collaborators: Haley Griffin and Joe Lee

# Project Name

**Author**: Your Name Goes Here
**Version**: 1.0.0 (increment the patch/fix version number if you make more commits past your first submission)

## Overview
The purpose of this application is to provide a user with the ability to selecdt a city (Lynnwood) and get general information on it, as well as a weather report. Both are stored and accessed on a localhost server.

## Getting Started
First thing you need to do is ensure that you have npm and nodemon installed on your computer. Once that is accomplished, you need the data you will be pulling from (JSON files). Once completed, you need to create a server.js that pulls the josn information and displays it on request.

## Architecture
I use javascript, json, npm, nodemon, and git to create this application. I made a folder "data" for my weather and location data (to be pulled by my constructor funcitons). I also made a server.js file that incorporated express, dotenv, and cors to ensure functionality not only with the json info I pulled but with my capacity to host a local server and display this information.

## Change Log
First change was to get all json, gitignore, etc. (standardized) files and bring them to my repo. I then created my server.js file and added basic code (required express, cors, dotenv, added listen function). After this was accomplished I created the constructors for both location and weather as well as added in the error message function. I then created the functions that married both the constructor functions with the data on the json files so that my constructor infor was populated by json info, then ensured that this info would be shown on user request. After this I tested the local server to ensure that this info was seen at the designated routes (/weather and /location). Once done, I deployed the repo on heroku and tested it there. Finally, I deployed the heroku and local links on the City Explorer github app and verified they worked there.

04-14-2001 10:30pm - Application now has a fully-functional express server, with a GET route for the location resource.

## Credits and Collaborations
Teamed with Olga Charnysh. Collaborated with Joe Lee, Matthew Stewart, and Haley Griffin.
-->