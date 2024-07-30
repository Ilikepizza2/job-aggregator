# Job Aggregator

Welcome to the Job Aggregator! This application uses AI to aggregate job listings from career websites.

### Instructions for running the backend:
1. Install playwright
	`npm i playwright@latest`
2. Create .env file with openai key and database url (mongodb used here)
3. `npm i`
4. `node index.js`

### Instructions for running the frontend
1. Create .env file with database url (mongodb used here)
2. `npm i`
3. `npm run dev`


## Contributing
The job urls are listed in `/backend/career_pages.js`. For the company page you want to add, just navigate to the page and select various filters and options. If the filters aren't using the url parameters, you can write custom playwright code for them. (You can look at the disney+ example for clarification).

### Customization
No nonsense customization for personal use case can be done by changing the `userRequirements` variable in `/backend/index.js`. 

### Todo
1. Add more pages
2. Add chunking to take care of context length.

## List of current companies tracked
- Linkedin
- Paypal
- Uber
- Google
- Salesforce
- Microsoft
- Amazon
- Nutanix
- Palo Alto Networks
- Mastercard
- Expedia group
- Meesho
- Sprinklr
- Airbnb
- Grab
- Adobe
- Rubrik
