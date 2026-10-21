### Passwords and keys

Plugins keep passwords, API keys and tokens with
`Command::SetSecret(SecretChange::keep(id, label, value))` and read them
with `env.secrets.get(id)`. They are all listed in *Settings, Passwords
and keys*, where the user changes or removes them. Ask for one on the
keyboard in password mode (`params::MODE` `password`); the keyboard
offers to type it on a phone. They are kept apart from the settings and
not readable at a glance, but not encrypted: the devices have no safe
place for a key.
