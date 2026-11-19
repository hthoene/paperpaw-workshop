### Flat callbacks in interface 7 draft 5

The flat `native::Plugin` facade borrows all callback input from the host.
`event` receives a decoded `native::events::Event` and a `native::reply::Reply` writer: append the family's encoded
reply with `write`, and return `Ok(())`. The glue returns only the written length.
A full writer returns `Error::NoSpace` without appending a partial write.
Events without replies receive an empty writer.

`draw` receives a decoded `native::callbacks::DrawFrame` with its target rectangle,
clip rows and borrowed payload. `input` receives a typed `Input` and returns
`Handled::Yes` or `Handled::No`. Neither input nor reply storage can escape the
callback. Decoders reject unknown exact tags and invalid input enum values.

Declare screens and actions with `native::declare::ScreenDecl` and `ActionDecl`.
Choose repeated-open behavior with `ScreenDecl::instances(native::declare::Instances::Single)`;
`PerParams` is the default and `Many` creates an instance for each open.
Use `Question::confirm(...)?` with `.confirm_labels("Keep\nDiscard")?` for custom
button words. Empty labels retain the dialog defaults. `.only_yes()?` requires an
empty no label; `.focus_yes()?` selects initial yes focus. Dialog plugins read
`QuestionInfo::{yes_label, no_label, only_yes, focus_yes}`.
For menu discovery, `RegistryItem::user_defined()` reads the host's explicit user
definition flag, including empty definitions and definitions equal to defaults.
Decode their shown/run events with `native::events::Event::decode`. Format catalog strings
with `native::formatting::format_message(host, key, args, &mut buffers)`.
Create `FormatBuffers::new(scratch, out)` to name the temporary argument encoding
storage and translated output separately; neither buffer is allocated by the SDK.
`digits` maps ASCII digits. Both functions return the full required byte length,
so retry when the result exceeds the output capacity.
