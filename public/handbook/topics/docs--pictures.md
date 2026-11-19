### Pictures

The host decodes and draws pictures; a plugin never holds one in memory.
`CommandSender::image_prepare(&PrepareImage)` asks for a JPEG, PNG (not interlaced) or GIF
of the plugin's data folder, with `uses.storage` the library, or (`PrepareRoot::Bundle`, no
feature) the plugin's own install folder, read only: the pictures it ships; a plugin built into
the image has none there, and the host answers `ImageStatus::NotFound`
(`PrepareImage::new(PrepareRoot::Data, path, cookie)`, `.side(n)` for the longest side, 0
being the screen's and a side above 1,600 being clamped, `.colour()`). Subscribe to
`EventKind::ImageReady` first: the end is one `Event::ImageReady` carrying the cookie, an
`ImageStatus` (`Ready`, `Unsupported`, `Damaged`, `TooLarge`, `CardFailure`, `NoMemory`,
`NotFound`: no such file at that root and path; an unknown value reads as `Damaged`), and for
`Ready` the `ImageId` and the size made. At
most 4 requests wait and 8 pictures are kept per plugin; give each back with
`image_release(id)`. `ImageInfo::read(host, id)` gives the size and whether it is colour
(`image.info`; `not_decoded()` says the format has not decoded it yet), and
`Canvas::draw_image(id, rect, ImageStyle)` draws it scaled into the rectangle, centred,
clipped by the canvas, only inside a draw callback (`State` elsewhere).
`ImageStyle::new().fill()` crops to fill, `.stretch()` scales to the rectangle and drops the
shape, `.dots()` draws black and white dots also on a panel with grays and `.grays()` in the
panel's grays, `.small()` keeps a small picture out of the ghosting refresh,
`.transparency(0..=255)` blends (255 draws nothing). `PrepareImage::turn()` applies a JPEG's EXIF
orientation (the size in `ImageReady` is the size after the turn), `.tone(&[u8; 256])` maps every
gray through the plugin's own table while the picture is decoded, and `ImageReady::luma()` is the
mean brightness of an 8 by 8 grid over the picture. `NotFound` is an
ended id: prepare it again. The host reads the file in bands, so a card failure can leave
the bands drawn so far.

`Library::cover(host, book, side, input, out)` gives a book's cover as an `ImageId` with its
size (`Cover::image()`, `Cover::info()`), made by the book's format on first use and kept in the
host's cover cache. `side` 0 is the list's size. `NotFound` means the book has no cover (show
text); `Busy` means it is being made, so ask again when `library_changed` bit 6 says it is
ready. Draw it with `Canvas::draw_image` and release it with `image_release` when it scrolls out
of the list. `input` is 1,024 bytes and `out` 4,096.
