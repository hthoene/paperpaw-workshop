//! Pictures for a plugin, made smaller on the computer without any LLM:
//! scaled down to what the readers need at most, stripped of metadata and
//! colour profiles, compressed as far as PNG goes (oxipng), never
//! interlaced (PaperPaw's decoder reads no interlaced PNGs). What is done
//! is the person's choice, per picture (see `Mode`); the original stays
//! with the project, the plugin gets this one. A picture the AI made of an
//! upload (convert_picture) comes with its `Shape` first: the part used,
//! fitted to the screen or a box, toned for e-ink.

use std::io::Cursor;

use base64::Engine;
use image::{DynamicImage, GenericImageView, ImageDecoder, ImageReader, Rgba, RgbaImage, imageops::FilterType};
use serde::{Deserialize, Serialize};

/// What becomes of a picture, as the person chose in the files drawer.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Mode {
    /// The picture as it is.
    Keep,
    /// Smaller, its colours kept.
    SmallerColour,
    /// Smaller, 16 grays: a 4-bit grayscale PNG (the reader dithers).
    SmallerGrays,
}

/// A part of a picture, in its own pixels.
#[derive(Debug, Clone, Copy, PartialEq, Deserialize)]
pub struct Rect {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

/// How the picture is fitted into its box.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Fit {
    /// Covering the box, cut at its edges around the middle.
    Fill,
    /// All of it, paper around.
    Whole,
}

/// Toned so it does not go muddy on e-ink (as src/pictures/gray.ts).
#[derive(Debug, Clone, Copy, Default, PartialEq, Deserialize)]
pub struct Tone {
    /// -1 (darker) to 1 (lighter).
    pub brightness: Option<f64>,
    /// -1 (flatter) to 1 (harder).
    pub contrast: Option<f64>,
    /// Above 1 lightens the middle grays.
    pub gamma: Option<f64>,
    pub invert: Option<bool>,
}

/// What the AI made of an upload: the part used, the box it fills
/// exactly, how, and its tone.
#[derive(Debug, Clone, PartialEq, Deserialize)]
pub struct Shape {
    pub width: u32,
    pub height: u32,
    pub fit: Fit,
    pub crop: Option<Rect>,
    #[serde(default)]
    pub tone: Tone,
}

/// A picture made, and what it is now.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Made {
    pub png: Vec<u8>,
    pub width: u32,
    pub height: u32,
}

/// What a picture is, for the check before sending (larger than needed?
/// in colour?).
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Info {
    pub width: u32,
    pub height: u32,
    pub bytes: usize,
    /// Whether it has colours other than grays.
    pub colour: bool,
}

/// The picture, turned as its EXIF says (as a phone's photo shows, and as
/// the AI saw it).
fn decode(bytes: &[u8]) -> Result<DynamicImage, String> {
    let unreadable = |e: image::ImageError| format!("not a picture the workshop reads: {e}");
    let mut decoder = ImageReader::new(Cursor::new(bytes))
        .with_guessed_format()
        .map_err(|e| e.to_string())?
        .into_decoder()
        .map_err(unreadable)?;
    let orientation = decoder.orientation().map_err(unreadable)?;
    let mut image = DynamicImage::from_decoder(decoder).map_err(unreadable)?;
    image.apply_orientation(orientation);
    Ok(image)
}

/// Whether `image` has colours other than grays (a little tolerance).
fn has_colour(image: &DynamicImage) -> bool {
    image.to_rgb8().pixels().any(|p| {
        let [r, g, b] = p.0;
        r.abs_diff(g) > 8 || g.abs_diff(b) > 8 || r.abs_diff(b) > 8
    })
}

pub fn info(bytes: &[u8]) -> Result<Info, String> {
    let image = decode(bytes)?;
    let (width, height) = image.dimensions();
    Ok(Info { width, height, bytes: bytes.len(), colour: has_colour(&image) })
}

/// `image` no larger than `max` (width, height), its sides kept in
/// proportion; turned the other way too, as a picture may be shown
/// across. Never larger than it was.
fn fit(image: DynamicImage, max: (u32, u32)) -> DynamicImage {
    let (w, h) = image.dimensions();
    let (long, short) = (max.0.max(max.1), max.0.min(max.1));
    let (bound_w, bound_h) = if w >= h { (long, short) } else { (short, long) };
    if w <= bound_w && h <= bound_h {
        return image;
    }
    image.resize(bound_w, bound_h, FilterType::Lanczos3)
}

/// `image` as `shape` says: its part, transparency over white paper,
/// exactly `shape.width` x `shape.height`, toned.
fn shaped(image: DynamicImage, shape: &Shape) -> DynamicImage {
    let mut image = image;
    if let Some(c) = shape.crop {
        let (w, h) = image.dimensions();
        let x = (c.x.max(0.0) as u32).min(w - 1);
        let y = (c.y.max(0.0) as u32).min(h - 1);
        let cw = (c.width.round().max(1.0) as u32).min(w - x);
        let ch = (c.height.round().max(1.0) as u32).min(h - y);
        image = image.crop_imm(x, y, cw, ch);
    }
    let (width, height) = (shape.width.max(1), shape.height.max(1));
    let image = over_white(&image);
    let (w, h) = image.dimensions();
    let mut out = match shape.fit {
        Fit::Fill => {
            // Cut to the box's proportions at the source's size, then scale.
            let scale = (f64::from(width) / f64::from(w)).max(f64::from(height) / f64::from(h));
            let cw = ((f64::from(width) / scale).round() as u32).clamp(1, w);
            let ch = ((f64::from(height) / scale).round() as u32).clamp(1, h);
            let part = image::imageops::crop_imm(&image, (w - cw) / 2, (h - ch) / 2, cw, ch).to_image();
            image::imageops::resize(&part, width, height, FilterType::Lanczos3)
        }
        Fit::Whole => {
            let scale = (f64::from(width) / f64::from(w)).min(f64::from(height) / f64::from(h));
            let sw = ((f64::from(w) * scale).round() as u32).clamp(1, width);
            let sh = ((f64::from(h) * scale).round() as u32).clamp(1, height);
            let scaled = image::imageops::resize(&image, sw, sh, FilterType::Lanczos3);
            let mut paper = RgbaImage::from_pixel(width, height, Rgba([255, 255, 255, 255]));
            image::imageops::overlay(&mut paper, &scaled, i64::from((width - sw) / 2), i64::from((height - sh) / 2));
            paper
        }
    };
    toned(&mut out, &shape.tone);
    DynamicImage::ImageRgba8(out)
}

/// Transparent parts over white, as the reader shows them.
fn over_white(image: &DynamicImage) -> RgbaImage {
    let mut rgba = image.to_rgba8();
    for p in rgba.pixels_mut() {
        let [r, g, b, a] = p.0;
        let over = |c: u8| ((u32::from(c) * u32::from(a) + 255 * (255 - u32::from(a))) / 255) as u8;
        *p = Rgba([over(r), over(g), over(b), 255]);
    }
    rgba
}

fn luma(r: u8, g: u8, b: u8) -> u8 {
    ((u32::from(r) * 299 + u32::from(g) * 587 + u32::from(b) * 114) / 1000) as u8
}

/// Stretched so its darkest and lightest parts use all grays, then
/// gamma, contrast, brightness and invert, each colour alike.
fn toned(image: &mut RgbaImage, tone: &Tone) {
    let mut counts = [0u64; 256];
    for p in image.pixels() {
        counts[usize::from(luma(p.0[0], p.0[1], p.0[2]))] += 1;
    }
    let total = u64::from(image.width()) * u64::from(image.height());
    let find = |share: f64| {
        let mut seen = 0;
        for (v, n) in counts.iter().enumerate() {
            seen += n;
            if seen as f64 >= share * total as f64 {
                return v as f64;
            }
        }
        255.0
    };
    let (mut lo, mut hi) = (find(0.005), find(0.995));
    if hi - lo < 16.0 {
        (lo, hi) = (0.0, 255.0);
    }
    let contrast = 1.0 + tone.contrast.unwrap_or(0.0);
    let brightness = tone.brightness.unwrap_or(0.0) * 128.0;
    let gamma = tone.gamma.unwrap_or(1.0);
    let invert = tone.invert.unwrap_or(false);
    let mut table = [0u8; 256];
    for (c, out) in table.iter_mut().enumerate() {
        let v = ((c as f64 - lo) / (hi - lo)).clamp(0.0, 1.0).powf(1.0 / gamma);
        let mut v = ((v - 0.5) * contrast + 0.5) * 255.0 + brightness;
        if invert {
            v = 255.0 - v;
        }
        *out = v.clamp(0.0, 255.0).round() as u8;
    }
    for p in image.pixels_mut() {
        for c in &mut p.0[..3] {
            *c = table[usize::from(*c)];
        }
    }
}

/// 16 grays over white, packed as a 4-bit grayscale PNG.
fn grays_png(image: &DynamicImage) -> Result<Vec<u8>, String> {
    let (w, h) = image.dimensions();
    let rgba = image.to_rgba8();
    let row = (w as usize).div_ceil(2);
    let mut packed = vec![0u8; row * h as usize];
    for (x, y, p) in rgba.enumerate_pixels() {
        let [r, g, b, a] = p.0;
        // The eye's weights; transparent parts over white, as the reader shows them.
        let luma = (u32::from(r) * 299 + u32::from(g) * 587 + u32::from(b) * 114) / 1000;
        let over = (luma * u32::from(a) + 255 * (255 - u32::from(a))) / 255;
        let level = ((over * 15 + 127) / 255) as u8;
        let at = y as usize * row + x as usize / 2;
        packed[at] |= if x % 2 == 0 { level << 4 } else { level };
    }
    let mut out = Vec::new();
    let mut encoder = png::Encoder::new(&mut out, w, h);
    encoder.set_color(png::ColorType::Grayscale);
    encoder.set_depth(png::BitDepth::Four);
    let mut writer = encoder.write_header().map_err(|e| e.to_string())?;
    writer.write_image_data(&packed).map_err(|e| e.to_string())?;
    writer.finish().map_err(|e| e.to_string())?;
    Ok(out)
}

fn colour_png(image: &DynamicImage) -> Result<Vec<u8>, String> {
    let mut out = Vec::new();
    image
        .write_to(&mut Cursor::new(&mut out), image::ImageFormat::Png)
        .map_err(|e| e.to_string())?;
    Ok(out)
}

/// As small as PNG goes: every chunk but the image's own dropped, no
/// interlacing, the strongest deflate.
fn squeeze(png: &[u8]) -> Result<Vec<u8>, String> {
    let mut options = oxipng::Options::from_preset(6);
    options.strip = oxipng::StripChunks::All;
    options.interlace = Some(oxipng::Interlacing::None);
    oxipng::optimize_from_memory(png, &options).map_err(|e| e.to_string())
}

/// The picture `bytes` made as `mode` says, no larger than `max`; with a
/// `shape`, made into that first (and as large as it says).
pub fn make(bytes: &[u8], mode: Mode, max: (u32, u32), shape: Option<&Shape>) -> Result<Made, String> {
    let image = decode(bytes)?;
    let image = match shape {
        Some(shape) => shaped(image, shape),
        None if mode == Mode::Keep => {
            let (width, height) = image.dimensions();
            return Ok(Made { png: bytes.to_vec(), width, height });
        }
        None => fit(image, max),
    };
    let (width, height) = image.dimensions();
    let png = match mode {
        Mode::SmallerGrays => grays_png(&image)?,
        _ => colour_png(&image)?,
    };
    Ok(Made { png: squeeze(&png)?, width, height })
}

fn b64() -> base64::engine::GeneralPurpose {
    base64::engine::general_purpose::STANDARD
}

/// The picture in base64 made as `mode` says; the result in base64 with
/// its size. Runs off the window's thread: compressing takes a moment.
#[tauri::command]
pub async fn picture_make(
    base64: String,
    mode: Mode,
    max_width: u32,
    max_height: u32,
    shape: Option<Shape>,
) -> Result<(String, u32, u32), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let bytes = b64().decode(base64).map_err(|e| e.to_string())?;
        let made = make(&bytes, mode, (max_width, max_height), shape.as_ref())?;
        Ok((b64().encode(made.png), made.width, made.height))
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn picture_info(base64: String) -> Result<Info, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let bytes = b64().decode(base64).map_err(|e| e.to_string())?;
        info(&bytes)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A picture `w`×`h`, a colour gradient, with metadata, as a camera's
    /// would be (here: a text chunk).
    fn photo(w: u32, h: u32) -> Vec<u8> {
        let image = image::RgbImage::from_fn(w, h, |x, y| image::Rgb([(x * 255 / w) as u8, (y * 255 / h) as u8, 128]));
        let mut out = Vec::new();
        let mut encoder = png::Encoder::new(&mut out, w, h);
        encoder.set_color(png::ColorType::Rgb);
        encoder.set_depth(png::BitDepth::Eight);
        encoder.add_text_chunk("Comment".into(), "taken with a camera".into()).unwrap();
        let mut writer = encoder.write_header().unwrap();
        writer.write_image_data(image.as_raw()).unwrap();
        writer.finish().unwrap();
        out
    }

    fn header(png: &[u8]) -> (u32, u32, u8, u8, u8) {
        let be = |i: usize| u32::from_be_bytes(png[i..i + 4].try_into().unwrap());
        (be(16), be(20), png[24], png[25], png[28])
    }

    #[test]
    fn grays_are_a_small_4_bit_grayscale_png_within_the_panel() {
        let original = photo(2000, 3000);
        let made = make(&original, Mode::SmallerGrays, (480, 800), None).unwrap();
        let (w, h, depth, color, interlace) = header(&made.png);
        assert_eq!((w, h), (made.width, made.height));
        assert!(w <= 480 && h <= 800, "{w}x{h}");
        assert_eq!((depth, color, interlace), (4, 0, 0), "4-bit gray, not interlaced");
        assert!(!made.png.windows(4).any(|c| c == b"tEXt"), "metadata stripped");
        assert!(made.png.len() < original.len() / 10);
        assert!(!info(&made.png).unwrap().colour);
    }

    #[test]
    fn colour_is_kept_when_asked_and_made_smaller() {
        let original = photo(1600, 1200);
        let made = make(&original, Mode::SmallerColour, (480, 800), None).unwrap();
        // Across: the longer side may take the panel's longer side (800x480).
        assert_eq!((made.width, made.height), (640, 480));
        assert!(info(&made.png).unwrap().colour);
        assert!(!made.png.windows(4).any(|c| c == b"tEXt"));
        assert_eq!(header(&made.png).4, 0, "not interlaced");
    }

    #[test]
    fn keep_leaves_it_as_it_is_and_small_pictures_are_not_made_larger() {
        let original = photo(100, 50);
        assert_eq!(make(&original, Mode::Keep, (480, 800), None).unwrap().png, original);
        let made = make(&original, Mode::SmallerGrays, (480, 800), None).unwrap();
        assert_eq!((made.width, made.height), (100, 50));
    }

    #[test]
    fn transparent_parts_become_white() {
        let image = DynamicImage::ImageRgba8(image::RgbaImage::from_pixel(4, 4, image::Rgba([0, 0, 0, 0])));
        let png = grays_png(&image).unwrap();
        let decoded = decode(&png).unwrap().to_luma8();
        assert!(decoded.pixels().all(|p| p.0[0] == 255));
    }

    #[test]
    fn a_shape_gives_its_part_at_exactly_its_size_in_grays() {
        // Left half black, right half white; the right part used.
        let image = image::RgbImage::from_fn(400, 200, |x, _| if x < 200 { image::Rgb([0, 0, 0]) } else { image::Rgb([255, 255, 255]) });
        let mut png = Vec::new();
        DynamicImage::ImageRgb8(image).write_to(&mut Cursor::new(&mut png), image::ImageFormat::Png).unwrap();
        let shape = Shape { width: 120, height: 200, fit: Fit::Fill, crop: Some(Rect { x: 150.0, y: 0.0, width: 250.0, height: 200.0 }), tone: Tone::default() };
        let made = make(&png, Mode::SmallerGrays, (1264, 1680), Some(&shape)).unwrap();
        assert_eq!((made.width, made.height), (120, 200));
        let (_, _, depth, colour, _) = header(&made.png);
        assert!(depth <= 4 && colour == 0, "gray, at most 4 bits: {depth}");
        let gray = decode(&made.png).unwrap().to_luma8();
        assert!(gray.get_pixel(119, 100).0[0] > 240, "the white part at the right");

        // All of it, paper around; inverted, the black half turns white.
        let whole = Shape { width: 300, height: 300, fit: Fit::Whole, crop: None, tone: Tone { invert: Some(true), ..Tone::default() } };
        let made = make(&png, Mode::SmallerGrays, (1264, 1680), Some(&whole)).unwrap();
        assert_eq!((made.width, made.height), (300, 300));
        let gray = decode(&made.png).unwrap().to_luma8();
        assert!(gray.get_pixel(10, 150).0[0] > 240, "what was black is white");
        assert!(gray.get_pixel(290, 150).0[0] < 15, "what was white is black");

        // Kept in colour when the person said so.
        let colour = make(&photo(300, 200), Mode::Keep, (1264, 1680), Some(&whole)).unwrap();
        assert!(info(&colour.png).unwrap().colour);
    }

    #[test]
    fn what_is_not_a_picture_is_said() {
        assert!(make(b"not a picture", Mode::SmallerGrays, (480, 800), None).is_err());
    }
}
