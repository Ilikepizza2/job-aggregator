const sites = [
    // { company: 'Disney+ hotstar', url: 'https://careers.hotstar.com/jobs', code: 'await page.locator(".col").first().click(); await page.getByRole("combobox").first().selectOption("01. Engineering");'}, // html doesn't update for some reason
    // { company: 'Goldman Sachs', url: 'https://www.goldmansachs.com/careers/students/programs/index.html'}, // dumb ai just uploads every link for some reason
    // { company: 'American Express', url: 'https://aexp.eightfold.ai/careers?location=india&pid=24122006&Select%20Primary%20Career%20Areas=technology&Select%20Seniority=Individual%20Contributor&domain=aexp.com&sort_by=relevance'}, // context length exceeds
    // { company: 'Adobe', url: 'https://careers.adobe.com/us/en/search-results?qcountry=India'}, // same context length exceeded
    { company: 'Linkedin', url: 'https://www.linkedin.com/jobs/search/?currentJobId=3926236738&f_C=1337%2C39939%2C2587638%2C9202023&geoId=92000000&origin=COMPANY_PAGE_JOBS_CLUSTER_EXPANSION&originToLandingJobPostings=3926236738%2C3984109877%2C3983351442%2C3967486976%2C3980673313%2C3973342095%2C3918812878%2C3854944588%2C3976068048'},
    { company: 'Paypal', url: 'https://paypal.eightfold.ai/careers?location=india&pid=274901904099&Job%20Category=Software%20Development&Employment%20Type=full%20time&domain=paypal.com&sort_by=relevance&triggerGoButton=false'},
    { company: 'Uber', url: 'https://www.uber.com/in/en/careers/list/?query=engineer&department=University' },
    { company: 'Google', url: 'https://www.google.com/about/careers/applications/jobs/results/?q=%22software%20engineer%22&location=India&target_level=EARLY' },
    { company: 'Salesforce', url: 'https://careers.salesforce.com/en/jobs/?search=&country=India&jobtype=New+Grads&pagesize=20#results' },
    { company: 'Microsoft', url: 'https://jobs.careers.microsoft.com/global/en/search?q=software&lc=India&l=en_us&pg=1&pgSz=20&o=Relevance&flt=true' },
    { company: 'Amazon', url: 'https://amazon.jobs/content/en/career-programs/university?category%5B%5D=Software+Development&team%5B%5D=studentprograms.team-jobs-for-grads&employment-type%5B%5D=Full+time' }, 
    { company: 'Nutanix', url: 'https://nutanix.eightfold.ai/careers?location=India&department=Engineering&department=Computers%2FSoftware&department=Engineering%20-%20AMER&department=Engineering%20-%20India&seniority=Entry&pid=23329583&domain=nutanix.com&sort_by=relevance&triggerGoButton=false' },
    { company: 'Palo Alto Networks', url: 'https://jobs.paloaltonetworks.com/en/jobs/?search=engineer&country=India&pagesize=20#results'},
    { company: 'Mastercard', url: 'https://careers.mastercard.com/us/en/search-results?keywords=engineer&qcountry=India'},
    { company: 'Expedia group', url: 'https://careers.expediagroup.com/jobs/?&filter[category]=Technology&filter[country]=India&filter[jobfamily]=Development'},
    { company: 'Meesho', url: 'https://www.meesho.io/jobs?&t=Business%20Analytics,Backend,QA,Infrastructure,CTO%20Office,Data%20Engineering,Data%20Science,Demand,Frontend,Supply,Security,Acqusition,Meesho%20Grocery%20-%20Category,Meesho%20Grocery%20-%20SCM,Marketing,Meesho%20Grocery%20-%20Experience,Meesho%20Grocery%20-%20User%20Growth'},
    { company: 'Sprinklr', url: 'https://sprinklr.wd1.myworkdayjobs.com/careers?locationCountry=c4f78be1a8f14da0ab49ce1162348a5e&jobFamilyGroup=c0a7c42494e701247f567aa7db035f64'},
    { company: 'Airbnb', url: 'https://careers.airbnb.com/positions/?_departments=engineering&_workplace_type=live-and-work-anywhere&_jobs_sort=updated_at'},
    { company: 'Grab', url: 'https://www.grab.careers/en/jobs/?search=Intern&team=Engineering&country=India&country=Singapore&pagesize=20#results'},
]  
const headersList = [
    {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    },
    {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
        'Accept-Language': 'en-US,en;q=0.9',
    },
    {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    },
    {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    },
    {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    },
    {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    },
    {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    },
    {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    },

    // Add more headers as needed
];
module.exports = { sites, headersList }