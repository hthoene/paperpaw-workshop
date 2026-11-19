### Opening a book as a client

`native::document::Documents::open(host)` opens `core.document`. `open_book(host, &OpenBook, input, out)`
opens one book and returns a `DocState`; `OpenBook::new(path)` reads the card's library
with the host's format and picture sizes, and its builders set the root, the format,
flags, picture sides (at most 1,600), a user CSS file and up to 12 `(name, value)`
options. More options than 12, or one over its caps, answers `NoSpace`; the handed root
for the CSS file is `Invalid`. Nothing bad reaches the host. `state` reads the
preparation state (`Preparation`), `close` ends the document, `xpointer` turns a
`DocPosition` into a KOReader XPointer and `locate` turns an XPointer (at most 1,024
bytes) back. An answer for another document is `Invalid`. Reading blocks and the
table of contents are not in this client yet. The host answers `Busy` while a
document is preparing.
