var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var words = ["mention", "is", "either", "before", "or", "accept", "like", "answers", "on", "until", "it", "mentioned", "synonyms", "the", "do", "any", "kind", "of", "mention", "a"];

var categories = ["Literature", "History", "Science", "Fine Arts", "Religion", "Mythology", "Philosophy", "Social Science", "Geography", "Current Events", "Trash"]
var sortBy = require('sort-by');

function ArrNoDupe(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    return Object.keys(temp);
}

function getStats(category) {
    var map = {stats: []}
    var temp = []
    var dict = {}
    var counter = 0;
    var str = ""
    request("http://www.quinterest.org/php/searchDatabase.php?limit=&info=&categ=" + encodeURIComponent(category) + "&sub=None&stype=Answer&qtype=Tossups&difficulty=HS&tournamentyear=All", function(error, response, text) {
        $ = cheerio.load(text);
        $('div.col-md-12').each(function(something, elem) {
            counter++;
            var answer = $(this).find('p')[2].children[1];
            plainAns = answer.data.replace(/ *\([^)]*\) */g, "").split(' [')[0].split(' or')[0];
            val = plainAns
            for (var i = words.length - 1; i >= 0; i--)
                plainAns = plainAns.split(" " + words[i] + " ").join(" ")
            plainAns = plainAns.trim()
            dict[plainAns] = answer.data.trim();
            str += plainAns;
            temp.push(plainAns)
        });
        temp = ArrNoDupe(temp)
        for (var i = temp.length - 1; i >= 0; i--) {
            if (temp[i].length < 2) { continue; }
            map.stats.push({ title: temp[i], count: 1 })
        }
        for (var i = map.stats.length - 1; i >= 0; i--) {
            map.stats[i].count = str.split(map.stats[i].title).length - 1;
            map.stats[i].title = dict[map.stats[i].title]
        }
        map.count = counter;
        map.stats = map.stats.sort(sortBy('-count'))
        fs.writeFile(category + ".json", JSON.stringify(map), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log(category + " saved!");
        });
        /*console.log(map)
        total = 0
        for (var i = 20; i >= 0; i--) {
            total += map[i].count
        }
        console.log(total)*/
    });
}
for (var i = categories.length - 1; i >= 0; i--) {
    getStats(categories[i])
}