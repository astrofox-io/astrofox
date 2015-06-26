@font-face {
    font-family: '<%= fontName %>';
    src: url('../fonts/<%= fontName %>/<%= fontName %>.eot'),
        url('../fonts/<%= fontName %>/<%= fontName %>.woff') format('woff'),
        url('../fonts/<%= fontName %>/<%= fontName %>.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
}

[class^="icon-"]:before,
[class*=" icon-"]:before {
  font-family: '<%= fontName %>';
  font-style: normal;
  font-weight: normal;
  display: inline-block;
  text-decoration: inherit;
  text-align: center;
  font-variant: normal;
  text-transform: none;
}

<% _.each(glyphs, function(glyph) { %>.<%= className %>-<%= glyph.name %>:before { content: "\<%= glyph.code %>" }
<% }); %>