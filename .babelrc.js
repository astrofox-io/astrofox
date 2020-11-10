{
  "presets": [
    ["@babel/env", {
      "targets": {
        "electron": "10.1.5"
      }
    }],
    "@babel/react"
  ],
  "plugins": [
    "react-refresh/babel",
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread",
    "@babel/proposal-optional-chaining",
    "@babel/proposal-nullish-coalescing-operator",
    "@babel/proposal-export-default-from"
  ],
  "env": {
    "production": {
      "presets": [
        ["@babel/env", {
          "targets": {
            "electron": "10.1.5"
          }
        }],
        "@babel/react"
      ],
      "plugins": [
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread",
        "@babel/proposal-optional-chaining",
        "@babel/proposal-nullish-coalescing-operator",
        "@babel/proposal-export-default-from"
      ]
    }
  }
}
