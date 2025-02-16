const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://github.com/xdan/jodit/network/dependents', { waitUntil: 'networkidle' });

    let hasNext = true;

    while (hasNext) {
        try {
            await page.waitForSelector('.Box-row');

            const projects = await page.$$eval('.Box-row', rows => {
                return rows.map(row => {
                    const userElem = row.querySelector('a[data-hovercard-type="user"]');
                    const repoElem = row.querySelector('a[data-hovercard-type="repository"]');
                    const starElem = row.querySelectorAll('span.color-fg-muted')[1];
                    let stars = 0;
                    if (starElem) {
                        stars = parseInt(starElem.innerText.replace(/\D/g, ''), 10);
                    }
                    return {
                        user: userElem ? userElem.href : '',
                        repo: repoElem ? repoElem.href : '',
                        stars
                    };
                });
            });

            projects.forEach(project => {
                if (project.stars > 10) {
                    console.table(project);
                }
            });

            const nextButton = await page.$('div[data-test-selector="pagination"] a:has-text("Next")');
            if (nextButton) {
                await Promise.all([
                    page.waitForNavigation({waitUntil: 'networkidle'}),
                    nextButton.click()
                ]);
            } else {
                hasNext = false;
            }

            await page.waitForTimeout(1000);
        } catch (e) {
            console.error(e);
            console.log('Last page:', await page.url());
            break;
        }
    }

    await browser.close();
})();
