module.exports = {
  "viewports": [
    {
      "width": 1920,
      "height": 1280
    },
    {
      "width": 320,
      "height": 480
    },
    {
      "width": 1024,
      "height": 768
    }
  ],
  "pages": [
    {
      "name": "home",
      "url": "http://www.tescobank.com",
      "action": function (client, data, callback) {
        if (data.viewport.width > 480) {
          client.click('#top-level a[href="#nav-item-4"]').call(callback);
        } else {
          client.click('#trigger .nav-open').click('#top-level a[href="#nav-item-4"]').pause(500).call(callback);
        }
      },
      "selectors": [
        {
          "name": "nav",
          "selector": "#nav-primary .inner"
        }
      ]
    },
    {
      "name": "banking",
      "url": "http://www.tescobank.com/bank/",
      "selectors": [
        {
          "name": "signpost",
          "selector": ".signpost"
        },
        {
          "name": "social-icons",
          "selector": ".social-icons"
        }
      ]
    },
    {
      "name": "purchases card",
      "url": "http://www.tescobank.com/credit-cards/purchases/index.html",
      "selectors": [
        {
          "name": "benefits",
          "selector": ".benefits"
        },
        {
          "name": "faq-list",
          "selector": ".faq-list"
        }
      ]
    },
    {
      "name": "car insurance pre-apply",
      "url": "http://www.tescobank.com/car-insurance/standard/apply.html",
      "selectors": [
        {
          "name": "eligibility",
          "selector": ".eligibility"
        },
        {
          "name": "primary-footer",
          "selector": ".primary-footer"
        }
      ]
    }
  ]
};
