### The plugin

A plugin is a type implementing [`Plugin`]: a manifest and a `register`
function. `register` runs once at start-up and adds the plugin's
contributions through a [`Registrar`]:

```rust
pub const PLUGIN: Id = Id::new_static("hello");
pub const OPEN: Id = Id::new_static("hello.open");
pub const SCREEN: Id = Id::new_static("hello.screen");

pub struct Hello;

impl Plugin for Hello {
    fn manifest(&self) -> Manifest {
        Manifest::new(PLUGIN, "Hello", Version::new(0, 1, 0))
            .description("A sample plugin to start from.")
            .uses(paperpaw_sdk::Uses::NOTHING)
    }

    fn register(&self, r: &mut Registrar) -> Result<(), RegisterError> {
        r.add_action(ActionSpec::new(OPEN, "hello.title").handler(|_, _, out| {
            out.push(Command::OpenScreen(SCREEN, Params::new()));
        }))?;
        r.add_menu_entry(MenuEntry::new(menus::TOOLS, OPEN).order(90))?;
        r.add_icon(OPEN, Cow::Borrowed("star"))?;
        // … the screen, a setting, an event, translations
        Ok(())
    }
}
```

Every id starts with the plugin's id (`hello.open`); `core` is the
kernel's. Titles are translation keys, translated where they are shown.

Icons are named as in [Tabler Icons](https://tabler.io/icons), any of
them (`paperpaw_sdk::icons` knows every name). PaperPaw's icon font holds
the ones it uses itself; for another, bring its drawing as an icon pack
(see below), else none shows.
