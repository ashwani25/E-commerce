/**
 * Created by nico on 14.12.15.
 */

var Promise = require('promise'),
    request = require('request'),
    cheerio = require('cheerio'),

    total_review_count_selector = '.totalReviewCount',
    review_selector = '.review',
    review_votes_selector = '.review-votes',
    review_rating_selector = '.review-rating',
    review_title_selector = '.review-title',
    review_author_selector = '.author',
    review_date_selector = '.review-date',
    review_text_selector = '.review-text',
    profile_name_selector = '.public-name-text',
    profile_info_selector = 'div.bio-expander';

module.exports = {

    /*
     * returns a promise that yields the collected customer reviews
     */
    getReviewsForProductId: function (productId) {
        urlObject.setProductId(productId);
        urlObject.resetPageNumber();
        return new Promise(function(resolve, reject) {
            var reviews = [];
            retrieveReviews(reviews, function(result) {
                if (result !== 'undefined' && result.length > 0) {
                    resolve(result)
                } else {
                    reject("sorry for breaking the promise :-(");
                }
            });
        });
    },

    getProfileForAuthorId: function (authorId) {
        return new Promise(function(resolve, reject) {
           getAuthorProfileData(authorId, function(result) {
                if (result !== null) {
                    resolve(result);
                } else {
                    reject("sorry for breaking the promise :-(");
                }
            });
        });
    }
};

/*
 *  example product reviews url: 'http://www.amazon.de/product-reviews/B00EPFV6PO/ref=cm_cr_pr_paging_btm_next_3?ie=UTF8&showViewpoints=1&sortBy=byRankDescending&pageNumber=1'
 */
var urlObject = {
    reviewsBasePath: 'http://www.amazon.com/product-reviews/',
    productId: '',
    authorBasePath: 'http://www.amazon.com/gp/pdp/profile/',
    requestParams: '/ref=cm_cr_pr_paging_btm_next_3?ie=UTF8&showViewpoints=1&sortBy=byRankDescending&pageNumber=',
    pageNumber: 1,
    getAuthorURL: function(authorId) {
        return this.authorBasePath + authorId;
    },
    getReviewURL: function() {
        return this.reviewsBasePath + this.productId + this.requestParams + this.pageNumber;
    },
    setProductId: function(newProductId) {
        this.productId = newProductId;
    },
    getProductId: function() {
        return this.productId;
    },
    resetPageNumber: function() {
        this.pageNumber = 1;
    },
    alterPageNumber: function() {
        this.pageNumber += 1;
    }
};

/*
 * This function recursively collects all available reviews for the current configuration of the urlObject
 */
function retrieveReviews(arrayOfReviews, callback) {
    request(urlObject.getReviewURL(), function(error, response, body){
        if(!error && response.statusCode == 200) {
            var $ = cheerio.load(body),
                availableReviews = parseInt($(total_review_count_selector).text().replace('.',''));
            console.log("cheerio has found", availableReviews, "reviews");
            console.log("Processing reviews of page: ", urlObject.pageNumber);

            $(review_selector).each(function() {
                arrayOfReviews.push(getReview($(this)));
            });

            if (arrayOfReviews.length < availableReviews) {
                console.log("retrieving next page ...");
                urlObject.alterPageNumber();
                retrieveReviews(arrayOfReviews, callback);
            } else {
                console.log("All reviews retrieved");
                console.log(arrayOfReviews);
                callback(arrayOfReviews);
            }
        }
    });
}

/*
 *  This function converts the review dom element into a json representation
 */
function getReview(raw_review) {
        var review = {};
        review.id = raw_review.attr('id');
        review.productId = urlObject.getProductId();
        review.totalVotesCount = getTotalReviewVotesCount(raw_review);
        review.helpfulVotesCount = getHelpfulReviewVotesCount(raw_review);
        review.rating = getReviewRating(raw_review);
        review.title = getReviewTitle(raw_review);
        review.author = getReviewAuthor(raw_review);
        review.date = getReviewDate(raw_review);
        review.text = getReviewText(raw_review);
        return review;
}

/*
 *  This function extracts the total number of given votes from reviewVotesText
 *
 *  Example for reviewVotesText: '21 von 22 Kunden fanden ...' => returns 22
 */
function getTotalReviewVotesCount(review) {
    var reviewVotesText = review.find(review_votes_selector).text();
    if (reviewVotesText == '') {
        return 0;
    } else {
        return reviewVotesText.split(" ")[2];
    }
}

/*
 *  This function extracts the number of helpful votes from reviewVotesText
 *
 *  Example for reviewVotesText: '21 von 22 Kunden fanden ...' => returns 21
 */
function getHelpfulReviewVotesCount(review) {
    var reviewVotesText = review.find(review_votes_selector).text();
    if (reviewVotesText == '') {
        return 0;
    } else {
        return reviewVotesText.split(" ")[0];
    }
}

/*
 *  This function extracts rating out of the rating text. There can only be integer ratings. Hence the decimal places are ignored.
 *
 *  Example for rating text: '3,0 von 5 Sternen' => returns 3
 */
function getReviewRating(review) {
    return review.find(review_rating_selector).text().charAt(0);
}

function getReviewTitle(review) {
    return review.find(review_title_selector).text();
}

/*
 *  This function extracts the id of the author from the link to the author's profile
 *
 *  Example for profile link: 'http://www.amazon.de/gp/pdp/profile/A2TO01EKZI952O/ref=cm_cr_pr_pdp?ie=UTF8' => returns 'A2TO01EKZI952O'
 */
function getReviewAuthor(review) {
    var authorLink = review.find(review_author_selector).attr('href'),
        authorLinkParts = authorLink.split('/');

    for (i = 0; i < authorLinkParts.length; i++) {
        if(authorLinkParts[i] == 'profile') {
            return authorLinkParts[++i];
        }
    }

}

/*
 *  This function extracts the date out of the date text.
 *
 *  Example for date text: 'on March 9, 2015' => returns Mon Mar 09 2015 00:00:00 GMT+0100 (CET)
 */
function getReviewDate(review) {
    var dateString = review.find(review_date_selector).text(),
        dateStringParts = dateString.split(" "),
        year = dateStringParts[3],
        month = 0,
        day = dateStringParts[2].replace(',','');

        switch (dateStringParts[1]) {
            case 'January':
                month = 0;
                break;
            case 'February':
                month = 1;
                break;
            case 'March':
                month = 2;
                break;
            case 'April':
                month = 3;
                break;
            case 'May':
                month = 4;
                break;
            case 'June':
                month = 5;
                break;
            case 'July':
                month = 6;
                break;
            case 'August':
                month = 7;
                break;
            case 'September':
                month = 8;
                break;
            case 'October':
                month = 9;
                break;
            case 'November':
                month = 10;
                break;
            case 'December':
                month = 11;
                break;
            default:
                month = 1;
                break;
    }

    var date = new Date(year,month,day);
    return date.toDateString();
}

/*
 *  returns the text of the review
 */
function getReviewText(review) {
    return review.find(review_text_selector).text();
}

function getAuthorProfileData(authorId, callback) {

    request(urlObject.getAuthorURL(authorId), function(error, response, body) {
        if(!error && response.statusCode == 200) {
            var $ = cheerio.load(body),
                author = {},
                infoArray = $(profile_info_selector).text().replace(/\s+/g, ' ').split(' ');

            author.id = authorId;
            author.name = $(profile_name_selector).text().trim();
            author.rank = infoArray[infoArray.indexOf('ranking')+1].replace('#','').replace(/,/g, '');
            author.helpfulVotes = infoArray[infoArray.indexOf('votes')+1].replace(/,/g, '');

            /*
             *  Use this code if you want to get reviews from amazon.de
             */

            // author.name = $(profile_name_selector).text().trim();
            // if($(reviewer_link_selector).length) {
            //     author.rank = $(reviewer_link_selector).text().split("\n")[0].replace('#','').replace(/\./g,'');
            // } else {
            //     author.rank = $(".profile-info div:contains('Rang des Rezensenten')").text().split('#')[1].replace(/\./g,'').trim();
            // }
            // author.helpfulness = $(helpfulness_selector).text().split('%')[0];

            callback(author);
        } else {
            callback(null);
        }
    });
}
