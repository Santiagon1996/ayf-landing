export const constant = {
  EMPTY_OR_BLANK_REGEX: /^\s*$/, //==> matches empty or blank strings
  EMAIL_REGEX:
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i, //==> regex para los EMAIL`s
  URL_REGEX:
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, //==> regex para las URL
  // USERNAME_REGEX: /^[a-zA-Z0-9]+$/,
  NAME_REGEX: /^[A-Za-z]+(?: [A-Za-z]+)*$/, //==> regex para los nombres
  ICON_LEGAL: "legal",
  ICON_ACCOUNTING: "accounting",
  ICON_NEWS: "news",
};
