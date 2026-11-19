# Packed sRGB color values

`abi/abi.def` owns the optional `color_value` descriptor, introduced in minor 1.
`tools/abi-gen.py` emits its independent Rust codec in
`abi/generated/color_wire.rs` and
`crates/paperpaw-core/src/abi7/color_wire.rs`. The raw C and Rust declarations
keep their existing `u32` signatures. No SDK interface-6 types or snapshots
change.

A color is the numeric unsigned value `0x00RRGGBB`. Red occupies bits 16 through
23, green bits 8 through 15 and blue bits 0 through 7. Each channel is an 8-bit
sRGB value, from 0 through 255. There is no alpha channel. Bits 24 through 31
are reserved and must be zero. A host returns `ERR_INVALID` for any nonzero
reserved bit before drawing. It must not interpret those bits as alpha or
silently discard them.

This is a numeric argument, independent of the machine's byte order. For
example, red is `0x00ff0000`, green is `0x0000ff00`, blue is `0x000000ff`, black
is `0x00000000` and white is `0x00ffffff`. Channels `[0x12, 0x34, 0x56]` encode
as `0x00123456`. Packing does not quantize the channels. The destination canvas
applies its pixel-format conversion when drawing.

Every host argument named `color` follows this contract, including:

| Slot | Operation |
| --- | --- |
| 9 | `canvas.fill_rect` |
| 10 | `canvas.draw_line` |
| 11 | `canvas.fill_round` |
| 12 | `canvas.stroke_round` |
| 14 | `text.draw` |

Slot 13, `text.measure`, has no color argument. A plugin metadata requirement
for any host entry with a `color` argument automatically includes the
descriptor's `since` minor, even if the function signature predates it. The
rule also applies to future host entries with that argument.

The generated allocation-free helpers are
`color_encode(r: u8, g: u8, b: u8) -> u32` and
`color_decode(value: u32) -> Result<[u8; 3], i32>`. Both are `const fn`, use
`core` only and retain all valid channel bits. Decoding returns channels in
red, green, blue order or `ERR_INVALID` (`-2`). Neither function draws or
allocates memory.

The descriptor and its channel objects have closed key sets. Its initial
addition must respect the released minor floor; an existing descriptor cannot
be changed or removed. Lock format 6 records its separate generated source in
`emitted_color`. Lock formats 1 through 5 remain readable. Older schemas
without this descriptor continue to generate their previous declarations and
no color codec; absence does not select an alternative encoding.

Focused checks:

```sh
python3 tools/abi-gen.py --check
python3 tools/abi-metadata-fixtures.py --check
python3 -m unittest discover -s tools/tests -p test_abi_color.py
```

The tests cover closed schema validation, compatibility and minor floors,
legacy locks, generated-file freshness, standalone `no_std` compilation,
golden colors, every channel byte and every nonzero reserved high byte.
