define({ "api": [
  {
    "type": "get",
    "url": "/info",
    "title": "Greeting from server",
    "version": "1.0.0",
    "name": "GetInfo",
    "group": "Socketservice",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "Greeting",
            "description": "<p>from server.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"Welcome to the user service\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "src/routes.js",
    "groupTitle": "Socketservice"
  }
] });
