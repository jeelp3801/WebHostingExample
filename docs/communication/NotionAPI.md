### notion.js
- file set up under src/api
- contains basic methods for the notion API
- please implement your function assuming these implementations work
- implementations will be tested and edited before deadline
- if you need more functions from the notion API, add it to the file and create a pull request to add it to the development branch
### IMPORTANT: create a .env file locally
- follow the format on the main and development branch
- fill in necessary information on the .env file
- never commit the .env file
- update information when necessary
- .env file for notion:
    - NOTION_API_KEY: your integration token, which you get from    Notion after creating an internal integration
    - NOTION_DATABASE_ID: The ID of the Notion database 
    - NOTION_VERSION: the version of NOTION API to use\
    ex.
    - NOTION_API_KEY: copy key from notion integration for Umi
    - NOTION_DATABASE_ID: part of the Notion URL for our database, ask chat how to get it
    - NOTION_VERSION:2022-06-28
