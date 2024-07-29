require("dotenv").config();
const OpenAI = require("openai")
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const { sites, headersList } = require('./career_pages')
const app = express()
const options = {
    origin: ['http://localhost:3000', 'http://localhost:8080'],
}
app.use(cors(options))
const api_key = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: api_key });
const cheerio = require('cheerio');
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const uploadToDB = async (obj) => {
    const database = client.db('companies')
    const collection = database.collection('jobs')
    try{
        const result = await collection.insertOne(obj);
        console.log("uploaded", result)
    }
    catch(e){
        console.log("Error uploading ", obj, e)
    }
}

async function cleanHTML(htmlContent) {
    const $ = cheerio.load(htmlContent);
    $('script, style, noscript, img, svg, link, meta').remove();
    $('*').contents().each(function () {
        if (this.nodeType === 8) { // Node.COMMENT_NODE
            $(this).remove();
        }
    });
    return $.html();
}




const closeResumeUploadPopup = async (page) => {

    const closeButtonSelectors = [
        'button#close-popup',
        'button.close-modal-button',
        'button.close-button',
        'button:has-text("Close")',
        'button:has-text("Dismiss")',
        'button[aria-label*="close"]',
        '[aria-label*="close"]'
    ];
    try {
        for (let closeSelector of closeButtonSelectors) {
            const closeButton = await page.$(closeSelector);
            if (closeButton) {
                try{
                    await closeButton.first().click();
                    console.log(`Closed resume upload popup with selector: ${closeSelector}`);
                }
                catch(e){
                    console.log("lmao nvm again")
                }
                break;
            }
        }
    }
    catch (e) {
        return;
    }



}


function isAbsoluteUrl(url) {
    // Basic check, might need refinement for specific use cases
    return /^https?:\/\//.test(url);
}

function mergeStrings(s1, s2) {
    let maxOverlap = 0;
    // Find the maximum overlap
    for (let i = 1; i <= Math.min(s1.length, s2.length); i++) {
        if (s1.slice(-i) === s2.slice(0, i)) {
            maxOverlap = i;
        }
    }
    // Merge the strings with the overlapping part occurring only once
    let mergedString = s1 + s2.slice(maxOverlap);
    return mergedString;
}

function updateURL(url) {
    const targetString = "https://careers.microsoft.com/v2/global";
    const replaceString = "/v2";
    
    // Check if the URL contains the target string
    if (url.includes(targetString)) {
      // Replace /v2 with an empty string
      return url.replace(replaceString, "");
    }
    
    // If the URL does not contain the target string, return the original URL
    return url;
  }

function toAbsoluteUrls(urls, currentUrl) {
    const urlParser = new URL(currentUrl);
    const baseUrl = `${urlParser.protocol}//${urlParser.host}`;
    const basePath = urlParser.pathname.replace(/\/[^\/]*$/, ''); // Remove the last segment of the path

    return urls.map(url => {
        if (isAbsoluteUrl(url)) {
            return updateURL(url)
        } else if (url.startsWith('/')) {
            return baseUrl + url;
        } else if (url.startsWith('./')) {
            return baseUrl + url.substring(1);
        } else {
            // Ensure no duplicate base path
            return mergeStrings(baseUrl + basePath, url)
        }
    });
}
const getJobLinks = async (htmlContent, cur_url, requirements, page) => {
    console.log("started")
    const tools = [
        {
            type: 'function',
            function: {
                name: 'gotoLinks',
                description: 'Go to each link',
                parameters: {
                    type: 'object',
                    properties: {
                        url_array: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'An array of job urls in string format extracted from current page'
                        }
                    }
                },
                required: ["url_array"]
            }
        },
    ]
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: `You are an assistant that gives a list of job links from the given job search page as an array of urls. The urls should be exactly the same as present in html. Don't make any modifications.` },
            { role: "user", content: ` current HTML content of the page: ${htmlContent}` },
        ],
        tools: tools,
        tool_choice: "required",
    });
    const args = await JSON.parse(response.choices[0].message.tool_calls[0].function.arguments)


    const urls = toAbsoluteUrls(args.url_array, cur_url)
    console.log(urls)
    const checkEachUrl = async () => {
        for (const url of urls) {
            let retries = 3; // Number of retries
            while (retries > 0) {
                try {
                    await page.goto(url);
                    try {
                        await page.waitForLoadState('networkidle', {timeout: 4000});
                    }
                    catch (e) {
                    }
                    if (await page.getByText('human').first().isVisible() === true) {
                        await page.waitForTimeout(6000);
                        try {
                            await page.waitForLoadState('networkidle', {timeout: 4000});
                        }
                        catch (e) {
                        }
                    }
                    try{
                        const curhtmlContent = await page.content();
                        const curcleanedHTML = await cleanHTML(curhtmlContent);
                        await analyzeCurPage(curcleanedHTML, requirements, url, page);
                    }
                    catch(e){}
                    break; // Break the loop if successful
                } catch (error) {
                    console.error(`Failed to load ${url}: ${error.message}`);
                    retries--;
                    if (retries === 0) {
                        console.error(`Giving up on ${url} after 3 attempts`);
                    } else {
                        console.log(`Retrying ${url} (${3 - retries} of 3)`);
                    }
                }
            }
        }
    }

    await checkEachUrl();
}

const analyzeCurPage = async (htmlContent, requirements, cur_url, page) => {
    const tools = [
        {
            type: 'function',
            function: {
                name: 'CheckJobRelevant',
                description: `Analyze the job description from the current page. If the job is relevant for ${requirements}, isRelevant must be true and jd should be {id: job id, title: job title, url: link to the job, company: company name}. Otherwise, isRelevant must be false and jd should be null`,
                parameters: {
                    type: 'object',
                    properties: {
                        isRelevant: {
                            type: 'boolean',
                            description: 'If the job is relevant, then true. Otherwise false.'
                        },
                        jd: {
                            type: 'object',
                            description: 'if the job is relevant, it should contain the job id, job title and job url',
                            properties: {
                                id: {
                                    type: 'string',
                                    description: 'job id'
                                },
                                title: {
                                    type: 'string',
                                    description: 'job title'
                                },
                                url: {
                                    type: 'string',
                                    description: 'job url'
                                },
                                company: {
                                    type: 'string',
                                    description: 'company name'
                                }
                            }
                        }
                    }
                },
                required: ["isRelevant"]
            }
        },
    ]
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: `You are an assistant that is given a job description. Now, check if the job description is relevant for ${requirements}. If it is relevant, the function should be called for isRelevant = true. Otherwise isRelevant = false. The current url is ${cur_url}` },
            { role: "user", content: ` current HTML content of the page: ${htmlContent}` },
        ],
        tools: tools,
        tool_choice: "required",
    });
    const args = await JSON.parse(response.choices[0].message.tool_calls[0].function.arguments)
    if(args.isRelevant){
        uploadToDB({...args.jd, _id: args.jd.id, date: (new Date()).toUTCString()})
    }
}

const acceptCookies = async (page) => {
    const cookieButtonSelectors = [
        'button#acceptCookies', // Example ID selector
        'button.cookie-consent-accept', // Example Class selector
        'button[data-consent="accept"]', // Example Data attribute selector
        'button:has-text("Accept")', // Example text selector (Playwright specific)
        'button:has-text("I agree")' // Another example text selector
    ];

    // Loop through the selectors until we find one that exists and is visible
    for (let selector of cookieButtonSelectors) {
        const acceptButton = await page.$(selector);
        if (acceptButton) {
            try{
                await acceptButton.first().click();
                console.log(`Clicked cookie acceptance button with selector: ${selector}`);
            }
            catch(e){
                console.log("nvm")
            }
            break;
        }
    }
}

const { chromium } = require('playwright');
(async () => {
    const userRequirements = "software engineering fresher openings for only 0 years of experience in Hyderabad/bangalore/gurgaon/pune in India. No diversity or women only hiring. No senior positions. No out of india locations. Usually sde 2, sde II, Leads, sde 3, sde III, mts 2, mts II, seniors, managers, engineer II are senior positions and are NOT for freshers. I don't need them";
    for(const site in sites){
        console.log(sites[site].company)
        const browser = await chromium.launch({
            headless: false
        });
        const context = await browser.newContext();
        await context.route('**/*', (route) => {
            const headers = headersList[Math.floor(Math.random() * headersList.length)];
            route.continue({ headers: { ...route.request().headers(), ...headers } });
          });

        const page = await context.newPage();
    
        page.setDefaultTimeout(0)
        await page.goto(sites[site].url)

        try{
            await page.waitForTimeout(2000);
            await acceptCookies(page)
        }
        catch{}
        try{
            await page.waitForTimeout(2000);
            await closeResumeUploadPopup(page)
        }
        catch{}
        if(sites[site].code !== undefined && sites[site].code !== null){
            await new Function('page', `return (async () => { ${sites[site].code} })()`)(page);
        }
        try{
            await page.waitForLoadState('networkidle', {timeout: 4000});
        }
        catch(e){}
        const htmlContent = await page.content();
        const cleanedHTML = await cleanHTML(htmlContent);
        await getJobLinks(cleanedHTML, sites[site].url, userRequirements, page)
        await page.close()
    }
    console.log('done')
    return;
    

})();;
