### Translations

```ini
[meta]
language = en
name = English
plural = one-other

[messages]
hello.title = Hello
# {name} is the name set, {count} the books opened since the start.
hello.greeting.one = Hello, {name}! You opened {count} book.
hello.greeting.other = Hello, {name}! You opened {count} books.
```

Every text a plugin shows comes from catalogs like this, added with
`r.add_translations(…)`; English first, then any other language. `tr`
translates, `format` fills `{placeholders}`, `plural` picks the form for
a number. A test that all languages have the same keys belongs in every
plugin (see the sample).

Two messages say what a plugin is in the lists: `<id>.plugin.name` and
`<id>.plugin.description` (a line). *How it works* says more: a few
sentences on what it does, where it is found and how it is used, plain
text with paragraphs apart by an empty line, one file per language
beside the catalogs (`how/en.txt`, `how/de.txt`). The manifest names
them; as a table in the program they take no memory until the plugin
manager shows one (a plugin held), paged like a book:

```rust
static HOW: [(&str, &str); 2] = [
    ("en", include_str!("../how/en.txt")),
    ("de", include_str!("../how/de.txt")),
];
// In `manifest`: Manifest::new(…).description(…).how(&HOW)
```

The same text is the `description` of the plugin's entry in the store
(see [Publishing](#publishing)), shown on its page there. A data plugin
gives it as `<id>.plugin.how` in its catalogs, quoted, paragraphs apart
by `\n\n`. `paperpaw-dev` warns where a plugin with code has none or a
short one.
