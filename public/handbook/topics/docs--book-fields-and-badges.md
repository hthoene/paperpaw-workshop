### Book fields and badges

Declare an owned field with `native::declare::BookFieldDecl::new(name, title)`
and `Declarations::book_field`; `.in_catalog()` also keeps short values in the
catalog. `Declarations::book_badge(name, token)` registers the owner callback.
The host supplies each name's plugin prefix. Badge stage payload codecs follow
Kernel's `core.book-badge` schema.

Read all owners' fields with `native::library::Library::fields`, passing a
`BookRef` and `FieldCursor::start()` for the first page. `FieldPage::rows()`
lends each complete id, translated title and value. Continue with
`page.end().next()` until it is `None`; no value is silently shortened.
The cursor carries this book's field generation. It is distinct from the
catalog generation carried by a catalog-based `BookRef`. `Error::State` on
continuation means restart from the first page. At most 64 fields belong to
one book, in owning-plugin/name order; each page fits the service reply cap.
