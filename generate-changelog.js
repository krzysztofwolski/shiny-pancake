const { execSync } = require("child_process");

let detailedChangelog  = execSync("npx news-fragments preview").toString();
let prChangelog = execSync("npx auto-changelog --stdout --commit-limit false -u --template https://raw.githubusercontent.com/release-it/release-it/master/templates/changelog-compact.hbs").toString();

const getEncodedCharacters = (string) => {
    // Find all encoded special characters like `&#x60;`
    const regexp = /\&\#\w{3,4}\;/g;
    // Set used for duplicate removal
    return [...new Set([...string.matchAll(regexp)].map((e)=>(e[0])))]
}
const encodedToChar = (string) => {
    // &#x60; -> 60
    return String.fromCharCode(parseInt(string.slice(3,-1), 16))
}
const decodeChangelog = (changelog) => {
    const encodedChars = getEncodedCharacters(changelog);
    let decodedChangelog = changelog;
    encodedChars.forEach((char)=>{
        decodedChangelog = decodedChangelog.replace(new RegExp(char, 'g'), encodedToChar(char))
    })
    return decodedChangelog;
}

console.log(decodeChangelog(detailedChangelog + "\n\n## Merged PRs\n" + prChangelog))