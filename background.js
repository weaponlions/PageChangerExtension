chrome.runtime.onInstalled.addListener(() => {
    console.log('Page Number Controller extension installed.');
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageNumber") {
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.storage.local.get({ keyType: "page" }, (data) => {
                const keyType = data.keyType ?? "page"; // Default to "page" if keyType is not found
                
                if (tabs.length > 0) {
                    const pageInfo = parsePageInfo(tabs[0].url);
                    // Send the parsed page number and keyType
                    sendResponse({ page: pageInfo.page, input: keyType });
                } else {
                    sendResponse({ page: 1, input: keyType }); // If no active tab, default to page 1
                }
            });
        });
        return true; 
        
    } else if (request.action === "incrementPage" || request.action === "decrementPage") {
        
        chrome.storage.local.get({ keyType: "page", paramType: "path" }, (data) => {
            const keyType = data.keyType ?? "page";
            const paramType = data.paramType ?? "path";
            
            adjustPageNumber(request.action === "incrementPage" ? 1 : -1, paramType, [keyType]);
        });
    } else if (request.action === "submitType") {
        chrome.storage.local.set({ keyType: request.message, paramType: request.type }, () => {
            console.log('New keyType saved:', request.message);
        });
    }
});


// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     // console.log("CHANGER")
//     if (changeInfo.status === 'complete' && tab.url) {
//         const url = tab.url;
//         const domain = new URL(url).hostname;
//         const pageInfo = parsePageInfo(url);

//         chrome.storage.local.get({ domains: {} }, (data) => {
//             const domainData = data.domains[domain] || {};
//             if (pageInfo.pageFound) {
//                 // Update stored page number and structure
//                 domainData.page = pageInfo.page;
//                 domainData.type = pageInfo.type;
//                 domainData.key = pageInfo.key;
//                 chrome.storage.local.set({
//                     domains: { ...data.domains, [domain]: domainData }
//                 });
//             } else if (domainData.page) {
//                 // Redirect to stored page number
//                 if (domainData.page == 1) {
//                     return;
//                 }
//                 const newUrl = constructUrl(url, domainData);
//                 if (newUrl !== url) chrome.tabs.update(tabId, { url: newUrl });
//             }
//         });
//     }
// });


function parsePageInfo(url, type, customKeys = ['page', 'p', 'pg']) {
    if (type === 'query') {
        let queryRegex = new RegExp(`[?&](${customKeys.join('|')})=(\\d+)`);
        let match = url.match(queryRegex);
        if (match) {
            return {
                page: parseInt(match[2], 10),
                type: 'query',
                key: match[1],  
                pageFound: true
            };
        }
    }

    
    if (type === 'path' || type === 'both') {
        let pathRegex = new RegExp(`/(${customKeys.join('|')})/(\\d+)(/|$)`);
        let match = url.match(pathRegex);
        if (match) {
            return {
                page: parseInt(match[2], 10),
                type: 'path',
                key: match[1],
                pageFound: true
            };
        }
    }

    return { page: 1, pageFound: false };
}



// function constructUrl(url, { type, key, page }) {
//     if (type === 'query') {
//         const separator = url.includes('?') ? '&' : '?';
//         return `${url}${separator}${key}=${page}`;
//     } else if (type === 'path') {
//         return url.replace(/(\/[^\/]+\/)([^\/]*)/, `$1${key}/${page}/$2`);
//     }
//     return url;
// }

// function adjustPageNumber(delta) {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         if (tabs.length > 0) {
//             const tab = tabs[0];
//             const pageInfo = parsePageInfo(tab.url);
//             const newPage = Math.max(pageInfo.page + delta, 1);
//             const domain = new URL(tab.url).hostname;

//             chrome.storage.local.get({ domains: {} }, (data) => {
//                 const domainData = data.domains[domain] || {};
//                 const newUrl = constructUrl(tab.url, { ...domainData, page: newPage });
// console.log(newUrl)
//                 if (newUrl !== tab.url) {
//                     chrome.tabs.update(tab.id, { url: newUrl });
//                     chrome.storage.local.set({
//                         domains: { ...data.domains, [domain]: { ...domainData, page: newPage } }
//                     });
//                 }
//             });
//         }
//     });
// }

function adjustPageNumber(delta, type, keyType = ["page"]) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const tab = tabs[0];
            const pageInfo = parsePageInfo(tab.url, type, keyType);  // Get current page info
            const newPage = Math.max(pageInfo.page + delta, 1);  // Increase or decrease page number
            const domain = new URL(tab.url).hostname;

            chrome.storage.local.get({ domains: {} }, (data) => {
                const domainData = data.domains[domain] || {};
                const newUrl = constructUrl(tab.url, { ...pageInfo, newPage: newPage });  // Construct new URL
                
                // console.log("New URL:", newUrl);  // Log the new URL for debugging

                // Update the tab URL if it's different from the current one
                if (newUrl !== tab.url) {
                    chrome.runtime.sendMessage({ type: 'response', message: newPage });
                    chrome.tabs.update(tab.id, { url: newUrl });
                    chrome.storage.local.set({
                        domains: { ...data.domains, [domain]: { ...domainData, page: newPage } }
                    });
                }
            });
        }
    });
}

// function constructUrl(url, { type, key, page }) {
//     const urlObj = new URL(url);


//     let newUrl = url;
//     if (page == 1) {
//         return `${urlObj.origin}`;
//     }
//     if (urlObj.pathname.includes("/page/")) {
//         newUrl = url.replace(/\/page\/\d+\//, `/page/${page}/`);
//     } else {
//         const separator = urlObj.pathname.endsWith('/') ? '' : '/';
//         newUrl = `${urlObj.origin}${urlObj.pathname}${separator}page/${page}/`;
//     }

//     return newUrl;
// }

function constructUrl(url, { type, key, page, newPage }) {
    console.log({ type, key, page })
    const urlObj = new URL(url);
    let newUrl = url;

    if (page === 1) {
        if (urlObj.pathname.includes("/page/")) {
            newUrl = `${urlObj.origin}${urlObj.pathname.replace(/\/page\/\d+\//, '/')}`;
        }
        newUrl = newUrl.replace(new RegExp(`[?&]${key}=\\d+`), '');
        return newUrl.endsWith('?') || newUrl.endsWith('&') ? newUrl.slice(0, -1) : newUrl;
    }

    if (type === 'path') {
        if (urlObj.pathname.includes(`/${key}/`)) {
            const separator = urlObj.pathname.endsWith("/") ? '/' : '';
            newUrl = url.replace(`/${key}/${page}${separator}`, `/${key}/${newPage}${separator}`); 
        } 
        
        else {
            const separator = urlObj.pathname.endsWith('/') ? '' : '/'; 
            newUrl = `${urlObj.origin}${urlObj.pathname}${separator}${key}/${newPage}/`;
        }
    }

    if (type === 'query') {
        const searchParams = new URLSearchParams(urlObj.search);
        searchParams.set(key, newPage);
        newUrl = `${urlObj.origin}${urlObj.pathname}?${searchParams.toString()}`;
    }

    return newUrl;
}
