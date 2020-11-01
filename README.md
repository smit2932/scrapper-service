# Scrap mgmt service

Scrap mgmt Service

Techical assets:
1.NodeJs
2.Express
3.MongoDb
4.Mongoose
5.Chai/Mocha
6.cheerio
7.axios

Here we have this scrap managment service in which we will scrap data from static url of E-commerce like Amazon.
We will use axios and cheerio npm packages for scrapping and querying tool to reach out at the end goal.

I have used on basic in memory cache technique to achive prompt response, it will use in memory stored scrapped data for quick results.

Flow of this microservice is devided into two diffrent endpoints.
1. Scrapper endpoint (scrap and save responsible)
2. Refresher endpoint (scrap latest data and update whole data set)
Above both the endpoints update in memory cache for fast retrival of data.

Postmen Collection:
https://web.postman.co/collections/3985211-e75eff71-e990-4878-a45f-9d49df3370b5?version=latest&workspace=e7b598ec-5ba0-4c97-816e-d1c712491927

install nodemon dev tool in global for achive contineous restarting due to changes. 
## Instructions to run
1. Install packages: `npm install`
2. Launch command in the level of package.json file: `nodemon`

## Instructions to test
1. npm run test
