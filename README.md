# Another JWST Proposals Database

A modern web application for easy searching and browsing approved James Webb Space Telescope (JWST) proposals.

## Features

- **Full-text single term search** across proposal abstracts, observation tables, and descriptions.
- **Full-text list cross match** in the same way.
- **Metadata Browser** with sortable columns and filters.

All files are extracted from the public PDF files of the approved proposals. You can find the [extracted files here](https://github.com/zhechenghu/JWST-proposal-search/tree/main/src/data).

**Explore the universe with JWST!** 🔭✨

## Notes

While Google is usually reliable for checking whether a source has been proposed for JWST observations, I found there are edge cases where it fails. For example, searching *“AS 205”* (a young binary star with a protoplanetary disk) together with *“JWST”* in Google does not return relevant results. However, the target is in fact included in [proposal 1584](https://www.stsci.edu/jwst/science-execution/program-information?id=1584).

I grew tired of guessing which targets had been proposed for JWST, so I built this website with the help of AI tools.

AI tools used:

1. Gemini-2.5-Flash – to extract information from public PDF files of approved proposals.
2. bolt.new – to quickly generate a prototype of the website.
3. Cursor – to refine and polish the code.